"use client";

import Link from "next/link";
import { ArrowLeft, Bot, MessageCircle, Shield, Sparkles, ChevronRight, ExternalLink } from "lucide-react";

const EXAMPLE_QUESTIONS = [
  { emoji: "✉️", q: "Help me write an email to my doctor about my knee pain." },
  { emoji: "💊", q: "What are common side effects of metformin?" },
  { emoji: "🌤️", q: "Will it rain in Austin, Texas tomorrow?" },
  { emoji: "📝", q: "Can you explain what Medicare Part B covers in simple terms?" },
  { emoji: "🎂", q: "Write a birthday message for my grandson who is turning 16." },
  { emoji: "📞", q: "Someone called me from 1-800-555-0199 saying I owe the IRS money. Is this a scam?" },
  { emoji: "📺", q: "How do I make the text bigger on my TV remote?" },
  { emoji: "📸", q: "How do I share a photo from my iPhone to my family?" },
];

const AI_TOOLS = [
  {
    name: "ChatGPT",
    by: "by OpenAI",
    color: "bg-green-50 border-green-200",
    badge: "bg-green-100 text-green-700",
    description: "The most popular AI assistant. Great for writing help, questions, and explanations. Free to use.",
    url: "https://chat.openai.com",
    tip: "Sign up with your email at chat.openai.com — it's free.",
  },
  {
    name: "Claude",
    by: "by Anthropic",
    color: "bg-orange-50 border-orange-200",
    badge: "bg-orange-100 text-orange-700",
    description: "Known for being very safe and clear. Excellent at explaining complex topics simply. Free to use.",
    url: "https://claude.ai",
    tip: "Go to claude.ai and sign in with Google — no new password needed.",
  },
  {
    name: "Gemini",
    by: "by Google",
    color: "bg-blue-50 border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    description: "Google's AI. If you already have a Gmail account, you can use Gemini for free with no new signup.",
    url: "https://gemini.google.com",
    tip: "Sign in with your Gmail at gemini.google.com — you're already set up.",
  },
];

const SAFETY_TIPS = [
  "Never share your Social Security number, passwords, or bank details with any AI.",
  "AI can make mistakes. For medical or legal decisions, always check with a real professional.",
  "AI assistants won't contact you first — if something calls or texts claiming to be AI, that's a scam.",
  "You can always ask AI to explain something again in simpler words — it never gets frustrated.",
  "Your conversations are private — AI doesn't share what you say with your family or employer.",
];

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 font-[var(--font-inter)]">
      {/* Nav */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-bold text-base md:text-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center shadow">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl md:text-2xl font-black text-gray-900">
                Learn <span className="text-amber-500">AI</span>
              </span>
            </div>
            <div className="w-20" />
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-14 space-y-16">

        {/* Hero */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold mb-5">
            <Sparkles className="w-4 h-4" />
            No experience needed — start from zero
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">
            What Is AI, and How Can It Help Me?
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            AI assistants are like having a very knowledgeable, patient helper available any time of day —
            for free. This guide explains what they are, what to ask them, and how to stay safe.
          </p>
        </div>

        {/* What is AI — plain English */}
        <section className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
              <Bot className="w-7 h-7 text-amber-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">What Is AI — in Plain English</h2>
          </div>
          <div className="space-y-5 text-base md:text-lg text-gray-700 leading-relaxed">
            <p>
              Think of AI like a very well-read assistant who has read millions of books, articles, and websites.
              You can have a typed conversation with it — ask questions, get explanations, or ask for help writing something —
              and it will reply in clear, friendly language.
            </p>
            <p>
              It is <strong>not</strong> a real person, and it doesn&apos;t have feelings. But it is incredibly
              good at explaining things, answering questions, and helping you write messages or find information.
            </p>
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
              <p className="font-bold text-amber-800 text-base md:text-lg mb-1">
                A good way to think about it:
              </p>
              <p className="text-amber-700">
                It&apos;s like texting a very smart, patient friend who never gets tired of your questions
                and always has time to help — at 2am or 2pm, any day of the week.
              </p>
            </div>
          </div>
        </section>

        {/* Example questions */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2 flex items-center justify-center gap-3">
              <MessageCircle className="w-8 h-8 text-purple-500" />
              8 Things You Can Ask Right Now
            </h2>
            <p className="text-base md:text-lg text-gray-500">
              Copy any of these into ChatGPT, Claude, or TechBuddy&apos;s AI Chat
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {EXAMPLE_QUESTIONS.map((item) => (
              <div
                key={item.q}
                className="bg-white rounded-2xl border-2 border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-purple-200 transition-all"
              >
                <div className="flex gap-3 items-start">
                  <span className="text-2xl shrink-0">{item.emoji}</span>
                  <p className="text-base md:text-lg font-semibold text-gray-800 leading-snug">
                    &ldquo;{item.q}&rdquo;
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/chat"
              className="inline-flex items-center gap-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-lg px-8 py-4 rounded-2xl shadow-lg transition-all"
            >
              <Bot className="w-6 h-6" />
              Try These in AI Buddy Chat
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* The 3 AI tools */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
              The 3 Most Popular AI Assistants
            </h2>
            <p className="text-base md:text-lg text-gray-500">
              All three are free to use. Pick the one that sounds easiest to start with.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {AI_TOOLS.map((tool) => (
              <div key={tool.name} className={`rounded-3xl border-2 p-6 ${tool.color} flex flex-col gap-4`}>
                <div>
                  <div className={`inline-flex px-3 py-1 rounded-full text-sm font-bold mb-1 ${tool.badge}`}>
                    {tool.by}
                  </div>
                  <h3 className="text-2xl font-black text-gray-900">{tool.name}</h3>
                </div>
                <p className="text-base text-gray-700 leading-relaxed flex-1">{tool.description}</p>
                <div className="bg-white/70 rounded-2xl p-4">
                  <p className="text-sm font-bold text-gray-600 mb-1">How to get started:</p>
                  <p className="text-sm text-gray-700">{tool.tip}</p>
                </div>
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-bold text-base text-gray-700 hover:text-blue-700 transition-colors"
                >
                  Open {tool.name}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Safety tips */}
        <section className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-green-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">Staying Safe with AI</h2>
          </div>
          <ul className="space-y-4">
            {SAFETY_TIPS.map((tip, i) => (
              <li key={i} className="flex items-start gap-4">
                <div className="shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-black text-sm mt-0.5">
                  {i + 1}
                </div>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed">{tip}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-10 md:p-14 text-center text-white shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-black mb-3">Ready to Try It?</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-lg mx-auto">
            TechBuddy&apos;s AI Buddy is already set up for you — no account needed.
            It&apos;s a great place to practice before using ChatGPT or Claude on your own.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/chat"
              className="inline-flex items-center justify-center gap-3 bg-white hover:bg-blue-50 text-blue-700 font-black text-lg px-8 py-4 rounded-2xl shadow-lg transition-all"
            >
              <Bot className="w-6 h-6" />
              Open AI Buddy Chat
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center justify-center gap-3 bg-white/20 hover:bg-white/30 text-white font-bold text-lg px-8 py-4 rounded-2xl transition-all"
            >
              Screenshot Helper
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-400 text-sm font-medium">
        <p>TechBuddy — built to help everyone feel confident with technology.</p>
      </footer>
    </div>
  );
}
