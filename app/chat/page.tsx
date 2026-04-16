"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  Square,
  Bot,
  Sparkles,
} from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const STARTER_PROMPTS = [
  { emoji: "✉️", text: "Help me write a message to my doctor" },
  { emoji: "📱", text: "How do I send a photo to my grandkids?" },
  { emoji: "🤖", text: "What is ChatGPT and how do I use it?" },
  { emoji: "🔒", text: "I got a suspicious call — is it a scam?" },
  { emoji: "📧", text: "How do I check my email on my phone?" },
  { emoji: "💊", text: "Help me set a pill reminder on my phone" },
  { emoji: "📰", text: "Explain the news to me in simple terms" },
  { emoji: "😄", text: "Tell me a good joke!" },
];

const LS_KEY = "techbuddy_openai_key";

// Minimal Web Speech API types
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}
interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((e: { results: { [i: number]: { [i: number]: { transcript: string } } } }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [apiKey, setApiKey] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) setApiKey(saved);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getHeaders = (): HeadersInit => {
    const key = localStorage.getItem(LS_KEY) || apiKey;
    return key ? { "x-openai-key": key, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: ChatMessage = { role: "user", content: text.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ message: text.trim(), history: messages }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed");
      setMessages([...updated, { role: "assistant", content: json.message }]);
    } catch {
      setMessages([...updated, { role: "assistant", content: "Sorry, something went wrong. Please try again!" }]);
    } finally {
      setLoading(false);
    }
  };

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const speakText = (text: string) => {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.82;
    utt.pitch = 1.0;
    utt.volume = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((v) =>
      ["samantha", "karen", "daniel", "google"].some((n) => v.name.toLowerCase().includes(n))
    );
    if (preferred) utt.voice = preferred;
    utt.onstart = () => setSpeaking(true);
    utt.onend = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const needsKey = !apiKey;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 font-[var(--font-inter)] flex flex-col">
      {/* Nav */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-bold text-base md:text-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center shadow">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl md:text-2xl font-black text-gray-900">
                AI <span className="text-purple-600">Buddy</span>
              </span>
            </div>
            <div className="w-20" />
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
            Chat with Your AI Buddy
          </h1>
          <p className="text-lg text-gray-500 font-medium">
            Ask anything — technology questions, scam checks, or just a friendly chat
          </p>
        </div>

        {/* API key warning */}
        {needsKey && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
            <p className="font-bold text-amber-800 text-base mb-3">
              You need a free code to use AI Buddy. Go to the{" "}
              <Link href="/demo" className="underline text-blue-700">
                main helper page
              </Link>{" "}
              first to save your code.
            </p>
          </div>
        )}

        {/* Starter prompts — only show before first message */}
        {messages.length === 0 && (
          <div>
            <p className="text-base font-bold text-gray-500 mb-3 text-center">
              Not sure what to ask? Tap one of these to get started:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STARTER_PROMPTS.map((p) => (
                <button
                  key={p.text}
                  onClick={() => sendMessage(p.text)}
                  disabled={needsKey || loading}
                  className="flex items-center gap-3 bg-white hover:bg-purple-50 border-2 border-gray-100 hover:border-purple-300 rounded-2xl px-5 py-4 text-left font-semibold text-gray-800 text-base transition-all shadow-sm hover:shadow-md disabled:opacity-40"
                >
                  <span className="text-2xl">{p.emoji}</span>
                  {p.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat messages */}
        {messages.length > 0 && (
          <div className="flex flex-col gap-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} items-end gap-2`}>
                {msg.role === "assistant" && (
                  <div className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center shrink-0 mb-0.5">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] px-5 py-4 rounded-3xl text-base md:text-lg font-medium leading-relaxed ${
                    msg.role === "user"
                      ? "bg-purple-600 text-white rounded-br-sm"
                      : "bg-white border-2 border-gray-100 text-gray-800 rounded-bl-sm shadow-sm"
                  }`}
                >
                  {msg.content}
                  {msg.role === "assistant" && (
                    <button
                      onClick={() =>
                        speaking ? stopSpeaking() : speakText(msg.content)
                      }
                      className="flex items-center gap-1.5 mt-3 text-sm text-purple-500 hover:text-purple-700 font-semibold transition-colors"
                    >
                      {speaking ? (
                        <><Square className="w-3.5 h-3.5 fill-purple-500" /> Stop reading</>
                      ) : (
                        <><Volume2 className="w-3.5 h-3.5" /> Read aloud</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start items-end gap-2">
                <div className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white border-2 border-gray-100 px-5 py-4 rounded-3xl rounded-bl-sm flex items-center gap-2 text-gray-500 text-base shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Thinking...
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        )}

        {/* More prompts button after conversation starts */}
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="self-center text-sm text-gray-400 hover:text-purple-600 font-semibold transition-colors underline"
          >
            Start a new conversation
          </button>
        )}
      </main>

      {/* Input bar — sticky at bottom */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-lg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            {/* Mic button */}
            <button
              onClick={listening ? stopListening : startListening}
              disabled={needsKey || loading}
              className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all font-bold disabled:opacity-40 ${
                listening
                  ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                  : "bg-gray-100 hover:bg-purple-100 text-gray-600 hover:text-purple-700"
              }`}
              title={listening ? "Stop listening" : "Speak your question"}
            >
              {listening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) sendMessage(input);
              }}
              placeholder={listening ? "Listening... speak now" : "Type or speak your question..."}
              disabled={needsKey || loading}
              className="flex-1 px-5 py-4 bg-gray-50 border-2 border-gray-200 focus:border-purple-400 focus:outline-none rounded-2xl text-base md:text-lg font-medium text-gray-800 placeholder:text-gray-400 transition-colors disabled:opacity-40"
            />

            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading || needsKey}
              className="shrink-0 w-14 h-14 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-2xl flex items-center justify-center transition-colors"
              aria-label="Send"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
            </button>
          </div>

          {listening && (
            <p className="text-center text-sm text-red-500 font-semibold mt-2 animate-pulse">
              Listening... speak now, then tap the mic to stop
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
