import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import {
  COOKIE_NAME,
  parseTokenCookie,
  makeTokenCookie,
  isOverLimit,
} from "@/lib/sessionTokens";

export const maxDuration = 60;

const SYSTEM_PROMPT = `You are TechBuddy — a warm, patient AI helper for senior citizens. You explain things clearly and simply, like you're talking to a kind, smart person who is just new to technology.

Rules:
- NEVER use technical jargon. If you must use a tech word, immediately explain it in plain English.
- Keep answers short — 2 to 5 sentences. Seniors don't want a wall of text.
- Be warm, encouraging, and never make the user feel dumb.
- If asked about technology (phones, computers, apps), give very concrete, step-by-step instructions.
- If asked about AI tools like ChatGPT, Claude, or Gemini, explain them as "helpful computer assistants you can have a conversation with."
- If something seems like a scam, immediately warn the user clearly and tell them NOT to click, call, or pay anything.
- End responses with a gentle follow-up offer, like "Does that help? Feel free to ask more!"`;

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json() as {
      message: string;
      history: Array<{ role: "user" | "assistant"; content: string }>;
    };

    const userKey = request.headers.get("x-openai-key");
    const apiKey = userKey || process.env.OPENAI_API_KEY;
    const usingServerKey = !userKey;

    if (!apiKey) {
      return NextResponse.json({ error: "No API key provided" }, { status: 400 });
    }

    // Enforce session token limit only when using the server key
    const cookieValue = request.cookies.get(COOKIE_NAME)?.value ?? null;
    const session = parseTokenCookie(cookieValue);

    if (usingServerKey && isOverLimit(session.tokens)) {
      return NextResponse.json(
        { error: "I'm a little tired right now. Please try again later!" },
        { status: 429 }
      );
    }

    const client = new OpenAI({ apiKey });

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history,
      { role: "user", content: message },
    ];

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 400,
      messages,
    });

    const reply = response.choices[0]?.message?.content ?? "I'm not sure — could you ask that a different way?";

    const res = NextResponse.json({ success: true, message: reply });

    if (usingServerKey) {
      const tokensUsed = response.usage?.total_tokens ?? 0;
      const newTotal = session.tokens + tokensUsed;
      res.cookies.set(COOKIE_NAME, makeTokenCookie(newTotal, session.createdAt), {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 24h
      });
    }

    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
