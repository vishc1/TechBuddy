# TechBuddy 🤝

> **AI-powered screenshot assistant for senior citizens** — Upload any app screenshot and get simple, clear step-by-step instructions.

Built for hackathons. Deployed in minutes. Designed for everyone.

---

## What is TechBuddy?

TechBuddy helps seniors and non-tech-savvy users navigate any app or website by:

1. **Uploading a screenshot** of the confusing screen
2. **AI analyzes** every button, menu, and element
3. **Returns plain-English instructions** in large, readable text
4. **Reads instructions aloud** via text-to-speech
5. **Warns about scams** if a suspicious popup is detected

**Example:** Upload a Gmail screenshot → TechBuddy says _"Tap the blue Compose button in the top right corner to write a new email."_

---

## Features

| Feature | Description |
|---|---|
| Screenshot Analysis | AI reads every button, icon, and menu on screen |
| Step-by-Step Instructions | Simple numbered steps in large readable text |
| Voice Read-Aloud | Web Speech API reads instructions at a comfortable pace |
| Scam Detection | Warns immediately if screenshot looks like a phishing/scam attempt |
| Senior-Friendly UI | Extra-large buttons, high contrast, simple layout |
| Mobile Responsive | Works on phones, tablets, and desktop |
| Optional Custom Questions | Ask "How do I send an email?" alongside your screenshot |

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **AI Vision:** Claude claude-sonnet-4-6 (Anthropic)
- **Icons:** Lucide React
- **Voice:** Web Speech API (browser native, no cost)
- **Deployment:** Vercel (zero config)

---

## Project Structure

```
techbuddy/
├── app/
│   ├── layout.tsx          # Root layout + metadata
│   ├── page.tsx            # Landing page
│   ├── globals.css         # Global styles
│   ├── demo/
│   │   └── page.tsx        # Main demo / analysis page
│   └── api/
│       └── analyze/
│           └── route.ts    # Claude Vision API route
├── components/
│   ├── ImageUploader.tsx   # Drag & drop screenshot upload
│   ├── InstructionCard.tsx # Displays AI instructions
│   ├── VoiceOutput.tsx     # Text-to-speech button
│   └── ScamWarning.tsx     # Scam alert banner
├── .env.example            # Environment variable template
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- An Anthropic API key from [console.anthropic.com](https://console.anthropic.com)

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/techbuddy.git
cd techbuddy

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

```env
ANTHROPIC_API_KEY=your_key_here
```

---

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push this repo to GitHub
2. Import into [Vercel](https://vercel.com)
3. Add `ANTHROPIC_API_KEY` in Project Settings → Environment Variables
4. Deploy!

---

## How the AI Works

The `/api/analyze` endpoint:

1. Accepts a `multipart/form-data` POST with an image file
2. Converts the image to base64 and sends it to Claude claude-sonnet-4-6 via the Anthropic SDK
3. Prompts Claude to respond in structured JSON with:
   - `isScam` — boolean flag for scam detection
   - `scamWarning` — human-readable warning if scam detected
   - `appName` — identified app/website
   - `currentScreen` — what screen is shown
   - `mainInstruction` — primary action in plain English
   - `steps` — numbered step-by-step guide
   - `visibleElements` — inventory of buttons/menus visible

---

## Hackathon Notes

- **Demo-first design**: The `/demo` page is the core experience
- **No auth required**: Anyone can upload a screenshot immediately
- **Graceful error handling**: API key errors display a helpful message
- **Mobile tested**: Responsive layout from 320px up

---

## License

MIT — build something great with it.
