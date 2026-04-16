"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  RotateCcw,
  HelpCircle,
  SendHorizonal,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  MessageCircle,
  Send,
  Zap,
  BookOpen,
  Monitor,
  Mic,
  MicOff,
  Bot,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import ImageUploader, { TapTarget } from "@/components/ImageUploader";
import InstructionCard from "@/components/InstructionCard";
import ScamWarning from "@/components/ScamWarning";
import VoiceOutput from "@/components/VoiceOutput";

interface AnalysisResult {
  isScam: boolean;
  scamWarning: string | null;
  appName: string;
  currentScreen: string;
  mainInstruction: string;
  steps: string[];
  visibleElements: string[];
  techTip?: string;
  tapTarget?: TapTarget | null;
}

interface HistoryEntry {
  id: string;
  timestamp: number;
  appName: string;
  currentScreen: string;
  result: AnalysisResult;
}

const HISTORY_KEY = "techbuddy_history";
const MAX_HISTORY = 5;

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SAMPLE_QUESTIONS = [
  "How do I send a message?",
  "How do I go back to the main screen?",
  "How do I make a payment?",
  "What does this warning mean?",
];

const DEVICE_CHIPS = [
  "iPhone",
  "Android phone",
  "iPad",
  "Windows PC",
  "Mac",
  "Chrome browser",
  "Safari",
  "Gmail",
  "Facebook",
  "Amazon",
];

const LS_KEY = "techbuddy_openai_key";

function inferZoneFromText(text: string): TapTarget | null {
  if (!text) return null;
  const t = text.toLowerCase();
  const top    = t.includes("top") || t.includes("upper");
  const bottom = t.includes("bottom") || t.includes("lower");
  const left   = t.includes("left");
  const right  = t.includes("right");
  const mid    = t.includes("center") || t.includes("middle");

  let zone: TapTarget["zone"];
  if      (top && left)    zone = "top-left";
  else if (top && right)   zone = "top-right";
  else if (top && mid)     zone = "top-center";
  else if (top)            zone = "top-center";
  else if (bottom && left) zone = "bottom-left";
  else if (bottom && right)zone = "bottom-right";
  else if (bottom && mid)  zone = "bottom-center";
  else if (bottom)         zone = "bottom-center";
  else if (left)           zone = "middle-left";
  else if (right)          zone = "middle-right";
  else if (mid)            zone = "center";
  else zone = "bottom-center";

  return { zone, label: "Tap here" };
}

export default function DemoPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailLevel, setDetailLevel] = useState<"simple" | "detailed">("simple");

  const [apiKey, setApiKey] = useState("");
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [showKeyHelp, setShowKeyHelp] = useState(false);

  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<{ stop(): void } | null>(null);

  const [deviceContext, setDeviceContext] = useState("");

  const [largeText, setLargeText] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [followUpInput, setFollowUpInput] = useState("");
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const toggleLargeText = () => {
    setLargeText((v) => {
      const next = !v;
      document.documentElement.classList.toggle("large-text", next);
      return next;
    });
  };

  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      setApiKey(saved);
      setApiKeySaved(true);
    }

    const savedHistory = localStorage.getItem(HISTORY_KEY);
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  const startListening = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = new SR() as any;
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e: { results: { [i: number]: { [i: number]: { transcript: string } } } }) => {
      setQuestion(e.results[0][0].transcript);
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

  useEffect(() => {
    if (chatMessages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const handleSaveKey = () => {
    const trimmed = apiKey.trim();
    if (!trimmed) return;
    localStorage.setItem(LS_KEY, trimmed);
    setApiKey(trimmed);
    setApiKeySaved(true);
  };

  const handleClearKey = () => {
    localStorage.removeItem(LS_KEY);
    setApiKey("");
    setApiKeySaved(false);
  };

  const handleImageSelect = useCallback((file: File, url: string) => {
    setImageFile(file);
    setPreviewUrl(url);
    setResult(null);
    setError(null);
    setChatMessages([]);
  }, []);

  const handleClear = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setQuestion("");
    setDeviceContext("");
    setChatMessages([]);
    setFollowUpInput("");
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setChatMessages([]);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      if (question.trim()) formData.append("question", question.trim());
      if (deviceContext.trim()) formData.append("deviceContext", deviceContext.trim());
      formData.append("detailLevel", detailLevel);

      const headers: HeadersInit = {};
      const storedKey = localStorage.getItem(LS_KEY);
      if (storedKey) headers["x-openai-key"] = storedKey;

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers,
        body: formData,
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || "Failed to analyze image");
      }

      setResult(json.data);

      // Save to usage history
      const entry: HistoryEntry = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        appName: json.data.appName || "Unknown app",
        currentScreen: json.data.currentScreen || "",
        result: json.data,
      };
      setHistory((prev) => {
        const updated = [entry, ...prev.filter((h) => h.id !== entry.id)].slice(0, MAX_HISTORY);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUp = async () => {
    if (!followUpInput.trim() || !result || followUpLoading) return;
    const userQ = followUpInput.trim();
    setFollowUpInput("");
    setFollowUpLoading(true);

    const updatedMessages: ChatMessage[] = [
      ...chatMessages,
      { role: "user", content: userQ },
    ];
    setChatMessages(updatedMessages);

    try {
      const formData = new FormData();
      formData.append("followUp", "true");
      formData.append("question", userQ);
      formData.append("history", JSON.stringify(chatMessages));
      formData.append(
        "context",
        `App: ${result.appName}. Screen: ${result.currentScreen}. Instructions given: ${result.steps.join(". ")}`
      );

      const headers: HeadersInit = {};
      const storedKey = localStorage.getItem(LS_KEY);
      if (storedKey) headers["x-openai-key"] = storedKey;

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers,
        body: formData,
      });

      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Failed to get answer");

      setChatMessages([
        ...updatedMessages,
        { role: "assistant", content: json.data.message },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setChatMessages([
        ...updatedMessages,
        { role: "assistant", content: `Sorry, I couldn't answer that. ${msg}` },
      ]);
    } finally {
      setFollowUpLoading(false);
    }
  };

  const voiceText = result
    ? `${result.mainInstruction} ${result.steps.join(". ")}`
    : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-[var(--font-inter)]">
      {/* Top Nav */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-bold text-base md:text-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Home</span>
              </Link>
              <Link
                href="/chat"
                className="hidden sm:flex items-center gap-1.5 text-purple-600 hover:text-purple-800 font-bold text-sm transition-colors"
              >
                <Bot className="w-4 h-4" />
                AI Chat
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow">
                <span className="text-white font-black text-base">T</span>
              </div>
              <span className="text-xl md:text-2xl font-black text-gray-900">
                Tech<span className="text-blue-600">Buddy</span>
              </span>
            </div>
            <button
              onClick={toggleLargeText}
              title={largeText ? "Switch to normal text" : "Switch to larger text"}
              className={`flex items-center gap-1.5 font-black text-sm px-3 py-2 rounded-xl border-2 transition-all ${
                largeText
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              <span className="text-base leading-none">A</span>
              <span className="text-xl leading-none">A</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-3">
            Let&apos;s Figure It Out Together
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 max-w-xl mx-auto font-medium leading-relaxed">
            Upload a screenshot of anything confusing and we&apos;ll explain exactly what to do — in plain English.
          </p>
        </div>

        {/* Secret Code Section */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 md:p-8 mb-6 md:mb-8">
          <div className="flex items-start justify-between gap-4 mb-1">
            <h2 className="text-xl md:text-2xl font-black text-gray-800 flex items-center gap-2">
              <Key className="w-6 h-6 text-blue-500 shrink-0" />
              Your Secret Code
              <span className="text-sm font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                one-time setup
              </span>
            </h2>
            <button
              onClick={() => setShowKeyHelp((v) => !v)}
              className="text-blue-600 underline font-semibold text-base shrink-0"
            >
              {showKeyHelp ? "Hide help" : "What is this?"}
            </button>
          </div>

          {showKeyHelp && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-4 text-base text-blue-800 leading-relaxed">
              <p className="font-bold mb-1">Think of it like a library card.</p>
              <p>
                TechBuddy uses a service called OpenAI to understand your screenshots. You need your own OpenAI API key to use it. You only need to enter it once — TechBuddy saves it in your browser.
              </p>
              <p className="mt-2">
                To get your key, go to{" "}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline"
                >
                  platform.openai.com/api-keys
                </a>{" "}
                and create an account. New accounts include some free credits. After that, each use costs a few cents. Then copy your key and paste it here.
              </p>
            </div>
          )}

          {apiKeySaved ? (
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-2 bg-green-50 border-2 border-green-200 text-green-700 px-5 py-3 rounded-2xl font-bold text-base flex-1">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                All set! Your code is saved.
              </div>
              <button
                onClick={handleClearKey}
                className="px-4 py-3 rounded-2xl border-2 border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 text-base font-semibold transition-colors"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2 mt-3">
              <div className="relative flex-1">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveKey()}
                  placeholder="Paste your code here..."
                  className="w-full pr-12 pl-5 py-4 bg-gray-50 border-2 border-gray-200 focus:border-blue-400 focus:outline-none rounded-2xl text-lg font-mono text-gray-800 placeholder:text-gray-400 placeholder:font-sans transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showKey ? "Hide code" : "Show code"}
                >
                  {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <button
                onClick={handleSaveKey}
                disabled={!apiKey.trim()}
                className="px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-black rounded-2xl transition-colors text-base"
              >
                Save
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-start">
          {/* Left column */}
          <div className="space-y-5 md:space-y-6">

            {/* Upload */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-2">
                1. Upload your screenshot
              </h2>
              <p className="text-base md:text-lg text-gray-500 font-medium mb-5">
                Take a screenshot of the confusing screen first, then tap the button below to upload it.
              </p>
              <ImageUploader
                onImageSelect={handleImageSelect}
                previewUrl={previewUrl}
                onClear={handleClear}
                disabled={loading}
                tapTarget={result?.tapTarget ?? inferZoneFromText(result?.mainInstruction ?? "")}
              />
            </div>

            {/* Question + Detail Level combined */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 md:p-8 space-y-6">
              {/* Question */}
              <div>
                <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-1">
                  2. What are you trying to do?
                </h2>
                <p className="text-base md:text-lg text-gray-500 font-medium mb-4">
                  You can skip this — TechBuddy will figure it out from the screenshot.
                </p>
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <HelpCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && imageFile && !loading) handleAnalyze();
                      }}
                      placeholder={listening ? "Listening... speak now" : "e.g. How do I send a message?"}
                      className={`w-full pl-11 pr-4 py-4 bg-gray-50 border-2 focus:outline-none rounded-2xl text-lg font-medium text-gray-800 placeholder:text-gray-400 transition-colors ${
                        listening ? "border-red-400 bg-red-50 placeholder:text-red-400" : "border-gray-200 focus:border-blue-400"
                      }`}
                      disabled={loading}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={listening ? stopListening : startListening}
                    disabled={loading}
                    title={listening ? "Stop listening" : "Speak your question"}
                    className={`shrink-0 w-14 rounded-2xl flex items-center justify-center transition-all ${
                      listening
                        ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                        : "bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-700"
                    }`}
                  >
                    {listening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {SAMPLE_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => setQuestion(q)}
                      className="text-sm md:text-base bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-gray-600 font-semibold px-4 py-2 rounded-full transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Device / Website context */}
              <div>
                <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-1 flex items-center gap-2">
                  <Monitor className="w-6 h-6 text-blue-500 shrink-0" />
                  3. What are you using? <span className="text-base font-semibold text-gray-400">(optional)</span>
                </h2>
                <p className="text-base md:text-lg text-gray-500 font-medium mb-4">
                  Tell us your device or website so we can give you exact button names.
                </p>
                <div className="relative mb-3">
                  <input
                    type="text"
                    value={deviceContext}
                    onChange={(e) => setDeviceContext(e.target.value)}
                    placeholder="e.g., iPhone, Windows PC, Gmail, Amazon..."
                    className="w-full pl-5 pr-4 py-4 bg-gray-50 border-2 border-gray-200 focus:border-blue-400 focus:outline-none rounded-2xl text-lg font-medium text-gray-800 placeholder:text-gray-400 transition-colors"
                    disabled={loading}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {DEVICE_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setDeviceContext(chip)}
                      className={`text-sm md:text-base font-semibold px-4 py-2 rounded-full transition-colors ${
                        deviceContext === chip
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-gray-600"
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Detail Level */}
              <div>
                <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-1">
                  4. How much explanation do you want?
                </h2>
                <p className="text-base md:text-lg text-gray-500 font-medium mb-4">
                  Most people prefer Simple.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDetailLevel("simple")}
                    className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 font-bold transition-all ${
                      detailLevel === "simple"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <Zap className={`w-8 h-8 ${detailLevel === "simple" ? "text-blue-500" : "text-gray-400"}`} />
                    <span className="text-lg md:text-xl">Simple</span>
                    <span className="text-sm font-normal text-center leading-snug opacity-70">
                      Short and to the point
                    </span>
                  </button>
                  <button
                    onClick={() => setDetailLevel("detailed")}
                    className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 font-bold transition-all ${
                      detailLevel === "detailed"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <BookOpen className={`w-8 h-8 ${detailLevel === "detailed" ? "text-blue-500" : "text-gray-400"}`} />
                    <span className="text-lg md:text-xl">Detailed</span>
                    <span className="text-sm font-normal text-center leading-snug opacity-70">
                      More steps, more context
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Big Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={!imageFile || loading || !apiKeySaved}
              className={`
                w-full flex items-center justify-center gap-3 font-black text-2xl md:text-3xl py-6 md:py-8 rounded-3xl shadow-xl transition-all
                ${
                  imageFile && !loading && apiKeySaved
                    ? "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-2xl hover:scale-[1.01] active:scale-[0.98]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }
              `}
            >
              {loading ? (
                <>
                  <Loader2 className="w-8 h-8 animate-spin" />
                  Working on it...
                </>
              ) : (
                <>
                  <Sparkles className="w-8 h-8" />
                  Get My Instructions
                  <SendHorizonal className="w-7 h-7" />
                </>
              )}
            </button>

            {!apiKeySaved && (
              <p className="text-center text-base text-gray-400 font-semibold -mt-2">
                Save your secret code above first
              </p>
            )}

            {!imageFile && apiKeySaved && (
              <p className="text-center text-base text-gray-400 font-semibold -mt-2">
                Upload a screenshot above first
              </p>
            )}

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 rounded-2xl p-5 font-semibold text-base leading-relaxed">
                Something went wrong: {error}
              </div>
            )}

            {/* Usage History */}
            {history.length > 0 && (
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setHistoryOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <span className="flex items-center gap-2 font-black text-gray-700 text-base md:text-lg">
                    <Clock className="w-5 h-5 text-blue-500" />
                    Recent Help
                    <span className="bg-blue-100 text-blue-700 text-sm font-bold px-2 py-0.5 rounded-full">
                      {history.length}
                    </span>
                  </span>
                  {historyOpen
                    ? <ChevronUp className="w-5 h-5 text-gray-400" />
                    : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>

                {historyOpen && (
                  <div className="border-t border-gray-100 divide-y divide-gray-50">
                    {history.map((entry) => (
                      <button
                        key={entry.id}
                        onClick={() => setResult(entry.result)}
                        className="w-full flex items-center justify-between px-6 py-4 hover:bg-blue-50 transition-colors text-left group"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 text-base truncate group-hover:text-blue-700 transition-colors">
                            {entry.appName}
                            {entry.currentScreen ? ` — ${entry.currentScreen}` : ""}
                          </p>
                          <p className="text-sm text-gray-400 font-medium mt-0.5 truncate">
                            {entry.result.mainInstruction}
                          </p>
                        </div>
                        <span className="shrink-0 ml-3 text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                          {timeAgo(entry.timestamp)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right column — Results */}
          <div className="space-y-5 md:space-y-6">
            {result ? (
              <>
                {result.isScam && result.scamWarning && (
                  <ScamWarning message={result.scamWarning} />
                )}

                {/* Voice */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 md:p-8">
                  <h2 className="text-xl md:text-2xl font-black text-gray-800 mb-4">
                    Want me to read it out loud?
                  </h2>
                  <VoiceOutput text={voiceText} />
                </div>

                {/* Instructions */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 md:p-8">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl md:text-2xl font-black text-gray-800">
                      Here&apos;s what to do
                    </h2>
                    <button
                      onClick={handleClear}
                      className="flex items-center gap-1.5 text-base text-gray-500 hover:text-blue-600 font-bold transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Start over
                    </button>
                  </div>
                  <InstructionCard data={result} />
                </div>

                {/* Follow-up Chat */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 md:p-8">
                  <h2 className="text-xl md:text-2xl font-black text-gray-800 mb-2 flex items-center gap-2">
                    <MessageCircle className="w-6 h-6 text-purple-500" />
                    Still stuck? Ask me anything
                  </h2>
                  <p className="text-base text-gray-500 font-medium mb-4">
                    For example: &ldquo;I did step 2 but now I see a red error&rdquo;
                  </p>

                  {chatMessages.length > 0 && (
                    <div className="space-y-3 mb-4 max-h-80 overflow-y-auto pr-1">
                      {chatMessages.map((msg, i) => (
                        <div
                          key={i}
                          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] px-5 py-4 rounded-2xl text-base md:text-lg font-medium leading-relaxed ${
                              msg.role === "user"
                                ? "bg-blue-600 text-white rounded-br-sm"
                                : "bg-gray-100 text-gray-800 rounded-bl-sm"
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      ))}
                      {followUpLoading && (
                        <div className="flex justify-start">
                          <div className="bg-gray-100 text-gray-500 px-5 py-4 rounded-2xl rounded-bl-sm flex items-center gap-2 text-base">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Thinking...
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                  )}

                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={followUpInput}
                      onChange={(e) => setFollowUpInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !followUpLoading) handleFollowUp();
                      }}
                      placeholder="Type your question here..."
                      className="flex-1 px-5 py-4 bg-gray-50 border-2 border-gray-200 focus:border-purple-400 focus:outline-none rounded-2xl text-base md:text-lg font-medium text-gray-800 placeholder:text-gray-400 transition-colors"
                      disabled={followUpLoading}
                    />
                    <button
                      onClick={handleFollowUp}
                      disabled={!followUpInput.trim() || followUpLoading}
                      className="px-5 py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-2xl transition-colors shrink-0"
                      aria-label="Send question"
                    >
                      {followUpLoading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <Send className="w-6 h-6" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 md:p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
                {loading ? (
                  <div className="space-y-6">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <Sparkles className="w-10 h-10 text-blue-500 animate-spin" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-2xl md:text-3xl font-black text-gray-800">
                        Reading your screenshot...
                      </p>
                      <p className="text-lg text-gray-500 font-medium">
                        Just a moment — this takes about 10 seconds
                      </p>
                    </div>
                    <div className="w-full space-y-3 mt-4">
                      <div className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
                      <div className="h-10 bg-gray-100 rounded-2xl animate-pulse w-3/4" />
                      <div className="h-10 bg-gray-100 rounded-2xl animate-pulse w-5/6" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <Sparkles className="w-12 h-12 text-gray-300" />
                    </div>
                    <p className="text-2xl md:text-3xl font-black text-gray-400">
                      Your instructions will appear here
                    </p>
                    <p className="text-lg text-gray-400 font-medium max-w-xs mx-auto leading-relaxed">
                      Follow the steps on the left, then tap{" "}
                      <strong className="text-gray-500">Get My Instructions</strong>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
