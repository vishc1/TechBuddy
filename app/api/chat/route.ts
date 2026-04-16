import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

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

    const apiKey =
      request.headers.get("x-openai-key") || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "No API key provided" }, { status: 400 });
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
    return NextResponse.json({ success: true, message: reply });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
