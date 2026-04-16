"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  RotateCcw,
  HelpCircle,
  SendHorizonal,
} from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
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
}

const SAMPLE_QUESTIONS = [
  "How do I send an email?",
  "What should I tap to go back?",
  "How do I make a payment here?",
  "What is this warning telling me?",
];

export default function DemoPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = useCallback((file: File, url: string) => {
    setImageFile(file);
    setPreviewUrl(url);
    setResult(null);
    setError(null);
  }, []);

  const handleClear = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setQuestion("");
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      if (question.trim()) {
        formData.append("question", question.trim());
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || "Failed to analyze image");
      }

      setResult(json.data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
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
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-semibold text-sm md:text-base transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow">
                <span className="text-white font-black text-sm">T</span>
              </div>
              <span className="text-lg md:text-xl font-black text-gray-900">
                Tech<span className="text-blue-600">Buddy</span>
              </span>
            </div>
            <div className="w-20" />
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-3">
            Get Help with Any App
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-xl mx-auto font-medium">
            Upload your screenshot and we&apos;ll tell you exactly what to do
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-start">
          {/* Left: Upload + Question */}
          <div className="space-y-5 md:space-y-6">
            {/* Upload */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-5 md:p-6">
              <h2 className="text-lg md:text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 rounded-lg px-2 py-1 text-sm font-bold">
                  Step 1
                </span>
                Upload your screenshot
              </h2>
              <ImageUploader
                onImageSelect={handleImageSelect}
                previewUrl={previewUrl}
                onClear={handleClear}
                disabled={loading}
              />
            </div>

            {/* Optional Question */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-5 md:p-6">
              <h2 className="text-lg md:text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-600 rounded-lg px-2 py-1 text-sm font-bold">
                  Step 2
                </span>
                Ask a question{" "}
                <span className="text-gray-400 font-normal text-sm">(optional)</span>
              </h2>
              <div className="relative">
                <HelpCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && imageFile && !loading) handleAnalyze();
                  }}
                  placeholder="e.g. How do I send an email?"
                  className="w-full pl-11 pr-4 py-3 md:py-4 bg-gray-50 border-2 border-gray-200 focus:border-blue-400 focus:outline-none rounded-2xl text-base md:text-lg font-medium text-gray-800 placeholder:text-gray-400 transition-colors"
                  disabled={loading}
                />
              </div>
              {/* Quick-pick questions */}
              <div className="flex flex-wrap gap-2 mt-3">
                {SAMPLE_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuestion(q)}
                    className="text-xs md:text-sm bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-gray-600 font-medium px-3 py-1.5 rounded-full transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={!imageFile || loading}
              className={`
                w-full flex items-center justify-center gap-3 font-black text-xl md:text-2xl py-5 md:py-6 rounded-3xl shadow-xl transition-all
                ${
                  imageFile && !loading
                    ? "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }
              `}
            >
              {loading ? (
                <>
                  <Loader2 className="w-7 h-7 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-7 h-7" />
                  Get Instructions
                  <SendHorizonal className="w-6 h-6" />
                </>
              )}
            </button>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 rounded-2xl p-4 font-semibold text-base">
                {error.includes("API key") ? (
                  <span>
                    API key not configured. Set{" "}
                    <code className="bg-red-100 px-1 rounded">OPENAI_API_KEY</code>{" "}
                    in your <code className="bg-red-100 px-1 rounded">.env.local</code> file.
                  </span>
                ) : (
                  error
                )}
              </div>
            )}
          </div>

          {/* Right: Results */}
          <div className="space-y-5 md:space-y-6">
            {result ? (
              <>
                {/* Scam Warning (if any) */}
                {result.isScam && result.scamWarning && (
                  <ScamWarning message={result.scamWarning} />
                )}

                {/* Voice */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-5 md:p-6">
                  <h2 className="text-base md:text-lg font-black text-gray-700 mb-3 flex items-center gap-2">
                    <span className="bg-green-100 text-green-600 rounded-lg px-2 py-1 text-sm font-bold">
                      Audio
                    </span>
                    Listen to your instructions
                  </h2>
                  <VoiceOutput text={voiceText} />
                </div>

                {/* Main Instructions */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-5 md:p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg md:text-xl font-black text-gray-800 flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-600 rounded-lg px-2 py-1 text-sm font-bold">
                        Result
                      </span>
                      Your Instructions
                    </h2>
                    <button
                      onClick={handleClear}
                      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 font-semibold transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      New
                    </button>
                  </div>
                  <InstructionCard data={result} />
                </div>
              </>
            ) : (
              /* Placeholder state */
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 md:p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
                {loading ? (
                  <div className="space-y-5">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-blue-500 animate-spin" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xl md:text-2xl font-black text-gray-800">
                        Analyzing your screenshot...
                      </p>
                      <p className="text-gray-500 font-medium">
                        Our AI is reading every button and menu
                      </p>
                    </div>
                    {/* Shimmer placeholder */}
                    <div className="w-full space-y-3 mt-4">
                      <div className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
                      <div className="h-10 bg-gray-100 rounded-2xl animate-pulse w-3/4" />
                      <div className="h-10 bg-gray-100 rounded-2xl animate-pulse w-5/6" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-gray-300" />
                    </div>
                    <p className="text-xl md:text-2xl font-black text-gray-400">
                      Your instructions will appear here
                    </p>
                    <p className="text-gray-400 font-medium max-w-xs mx-auto">
                      Upload a screenshot and tap{" "}
                      <strong className="text-gray-500">Get Instructions</strong>
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
