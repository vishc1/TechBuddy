import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // allow up to 60s for GPT-4o on Vercel

const SYSTEM_PROMPT = `You are TechBuddy, a friendly AI assistant that helps senior citizens and non-tech-savvy users navigate apps and websites.

When analyzing a screenshot, you must respond in valid JSON with this exact structure:
{
  "isScam": boolean,
  "scamWarning": string | null,
  "appName": string,
  "currentScreen": string,
  "mainInstruction": string,
  "steps": string[],
  "visibleElements": string[]
}

Rules:
- "isScam": true if you see suspicious popups, urgent warnings asking for money, fake prize notifications, phishing attempts, or anything that looks like a scam
- "scamWarning": a short, clear warning message if isScam is true, otherwise null
- "appName": the name of the app or website shown (e.g., "Gmail", "Facebook", "Amazon")
- "currentScreen": a brief description of what screen is shown (e.g., "Inbox", "Login Page")
- "mainInstruction": one clear, simple sentence telling the user the most important next action (e.g., "Tap the blue Compose button in the top right corner to write a new email.")
- "steps": array of 2-4 clear, numbered steps using simple language. Start each step with an action word (Tap, Press, Click, Scroll, Look for). Be very specific about location (top left, bottom right, center, etc.)
- "visibleElements": list of buttons, menus, icons you can see (e.g., ["Compose button (top right)", "Search bar (top)", "Inbox tab (bottom)"])

CRITICAL: Use extremely simple language suitable for seniors. Avoid jargon. Be encouraging and reassuring. If it's a scam, be very clear and direct about the danger.`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;
    const userQuestion = (formData.get("question") as string) || "";

    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiKey =
      request.headers.get("x-openai-key") || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "No OpenAI API key provided" },
        { status: 400 }
      );
    }

    const client = new OpenAI({ apiKey });

    const bytes = await imageFile.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mediaType = imageFile.type; // e.g. "image/jpeg"

    const userMessage = userQuestion
      ? `Please analyze this screenshot and help me. My question is: "${userQuestion}"`
      : "Please analyze this screenshot and tell me what to do next.";

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mediaType};base64,${base64}`,
                detail: "high",
              },
            },
            {
              type: "text",
              text: userMessage,
            },
          ],
        },
      ],
    });

    const rawText = response.choices[0]?.message?.content ?? "";

    // Extract JSON from the response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ success: true, data: parsed });
  } catch (err) {
    console.error("Analysis error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
