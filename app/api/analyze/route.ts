import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const ANALYSIS_PROMPT = (detailLevel: string) => `You are TechBuddy, a friendly AI assistant that helps senior citizens and non-tech-savvy users navigate apps and websites. Always be encouraging and reassuring. Avoid technical jargon.

When analyzing a screenshot, respond in valid JSON with this exact structure:
{
  "isScam": boolean,
  "scamWarning": string | null,
  "appName": string,
  "currentScreen": string,
  "mainInstruction": string,
  "steps": string[],
  "visibleElements": string[],
  "techTip": string,
  "tapTarget": { "zone": string, "label": string } | null
}

Rules:
- "isScam": true if you see suspicious popups, urgent warnings asking for money, fake prize notifications, phishing attempts, or anything that looks like a scam
- "scamWarning": a short, clear warning message if isScam is true, otherwise null
- "appName": the name of the app or website shown (e.g., "Gmail", "Facebook", "Amazon")
- "currentScreen": a brief description of what screen is shown (e.g., "Inbox", "Login Page")
- "mainInstruction": one clear, simple sentence telling the user the most important next action (e.g., "Tap the blue Compose button in the top right corner to write a new email.")
- "steps": array of step-by-step instructions. Start each with an action word (Tap, Press, Click, Scroll). Be specific about location (top left, bottom right, center, etc.)
- "visibleElements": list of buttons, menus, icons you can see (e.g., ["Compose button (top right)", "Search bar (top)"])
- "tapTarget": the single most important element the user needs to tap or click to complete the mainInstruction. Mentally divide the image into a 3x3 grid of equal thirds: the TOP ROW covers the upper third of the image height, the MIDDLE ROW covers the middle third, and the BOTTOM ROW covers the lower third. The LEFT COLUMN covers the left third of the image width, CENTER covers the middle third, and RIGHT covers the right third. Set "zone" to exactly one of these 9 values based on which cell the element falls in: "top-left", "top-center", "top-right", "middle-left", "center", "middle-right", "bottom-left", "bottom-center", "bottom-right". Be precise — if an element is near the bottom of the image use "bottom-*", not "middle-*". Set "label" to a short name for the element (e.g. "Send button", "Menu icon", "Sign In button"). Return null only if the action doesn't involve tapping a specific visible element (e.g. "scroll down" or "wait").
- "techTip": one short, friendly "did you know?" tip that teaches the user something about a specific icon, button color, or UI pattern that is actually visible in this screenshot. It must be tied to something on screen — do not give a generic tip. Examples of good tips: "The red button you see usually means 'close' or 'stop' — red colors in apps are a warning to slow down.", "Those three horizontal lines (☰) at the top-left are called a hamburger menu — tap them to see more pages or settings.", "The lock icon in the address bar tells you the website is secure — it means your information is protected.", "Blue underlined words are called links — tapping them will take you to a new page.", "The gear or cog icon (⚙) always means Settings on any app or device." Keep it to 1-2 sentences. Plain English only. Make it feel like a kind teacher sharing a helpful secret.

${
  detailLevel === "simple"
    ? "SIMPLE MODE: Use 2-3 steps maximum. One short sentence per step. Use only the most basic words. Write as if explaining to someone who has never used a smartphone before. No technical terms."
    : "DETAILED MODE: Use 4-6 steps. Explain what each element does and why. Include what to expect after each step. Add helpful tips for common mistakes. Give more context."
}

CRITICAL: Use extremely simple language suitable for seniors. Be encouraging and reassuring. If it's a scam, be very clear and direct about the danger.`;

const FOLLOWUP_PROMPT = `You are TechBuddy, a friendly AI assistant helping a senior citizen navigate their phone or computer. You already analyzed a screenshot for them and gave step-by-step instructions. Now they have a follow-up question.

Answer their question clearly and simply. Be warm and encouraging. Keep it short — 2-4 sentences. Use very simple words. If they're confused or frustrated, reassure them that it's okay. Never use technical jargon.`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;
    const userQuestion = (formData.get("question") as string) || "";
    const detailLevel = (formData.get("detailLevel") as string) || "simple";
    const deviceContext = (formData.get("deviceContext") as string) || "";
    const isFollowUp = formData.get("followUp") === "true";
    const historyRaw = (formData.get("history") as string) || "[]";
    const contextRaw = (formData.get("context") as string) || "";

    const apiKey =
      request.headers.get("x-openai-key") || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "No OpenAI API key provided" },
        { status: 400 }
      );
    }

    const client = new OpenAI({ apiKey });

    if (isFollowUp) {
      const history = JSON.parse(historyRaw) as Array<{
        role: "user" | "assistant";
        content: string;
      }>;

      const systemContent =
        FOLLOWUP_PROMPT +
        (contextRaw ? `\n\nContext from the screenshot you already analyzed: ${contextRaw}` : "");

      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: "system", content: systemContent },
        ...history,
        { role: "user", content: userQuestion },
      ];

      const response = await client.chat.completions.create({
        model: "gpt-4o",
        max_tokens: 300,
        messages,
      });

      const answer =
        response.choices[0]?.message?.content ??
        "I'm not sure. Please try asking again.";

      return NextResponse.json({ success: true, data: { message: answer } });
    }

    // Initial screenshot analysis
    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const bytes = await imageFile.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mediaType = imageFile.type;

    const deviceNote = deviceContext
      ? ` The user is on: ${deviceContext}.`
      : "";

    const userMessage = userQuestion
      ? `Please analyze this screenshot and help me.${deviceNote} My question is: "${userQuestion}"`
      : `Please analyze this screenshot and tell me what to do next.${deviceNote}`;

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content: ANALYSIS_PROMPT(detailLevel) + (deviceContext ? `\n\nThe user has told you they are using: ${deviceContext}. Use the correct terminology for that platform (e.g. "tap" for phones, "click" for computers, exact button/menu names for that app or website).` : ""),
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
