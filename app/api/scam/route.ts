import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const SCAM_PROMPT = `You are TechBuddy's scam detection expert, helping senior citizens identify scams. Analyze the text provided and determine if it is a scam.

Respond in valid JSON with this exact structure:
{
  "isScam": boolean,
  "confidence": "high" | "medium" | "low",
  "verdict": string,
  "redFlags": string[],
  "safeActions": string[],
  "summary": string
}

Rules:
- "isScam": true if this looks like a scam, phishing attempt, fraud, or suspicious communication
- "confidence": how confident you are in the assessment
- "verdict": one short sentence, e.g. "This is almost certainly a phone scam." or "This looks like a legitimate message from your bank."
- "redFlags": list of specific suspicious things you noticed (e.g. "Urgency language: 'Act now or lose your account'", "Requests payment via gift card"). Empty array if none.
- "safeActions": what the person should do right now (3-5 concrete steps). If it's a scam: do NOT click/call/pay, report it. If it's safe: reassure them.
- "summary": 2-3 sentences explaining your reasoning in plain English for a senior citizen.

Common scams to look for: IRS/tax scams, Social Security scams, Medicare/insurance fraud, tech support scams, lottery/prize scams, grandparent scams, romance scams, utility company threats, fake package delivery, phishing links, gift card payment demands.`;

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json() as { text: string };

    if (!text?.trim()) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const apiKey =
      request.headers.get("x-openai-key") || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "No API key provided" }, { status: 400 });
    }

    const client = new OpenAI({ apiKey });

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 600,
      messages: [
        { role: "system", content: SCAM_PROMPT },
        { role: "user", content: `Please check if this is a scam:\n\n${text}` },
      ],
    });

    const raw = response.choices[0]?.message?.content ?? "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON in response");

    const parsed = JSON.parse(match[0]);
    return NextResponse.json({ success: true, data: parsed });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
