"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  Shield,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ClipboardPaste,
} from "lucide-react";

interface ScamResult {
  isScam: boolean;
  confidence: "high" | "medium" | "low";
  verdict: string;
  redFlags: string[];
  safeActions: string[];
  summary: string;
}

const EXAMPLES = [
  "You have a package waiting. Pay $2.99 to release it: bit.ly/pkg9921",
  "This is the IRS. You owe $3,200 in back taxes. Call 1-888-555-0192 immediately or a warrant will be issued.",
  "Congratulations! You've won a $500 Amazon gift card. Click here to claim within 24 hours.",
  "Hi grandma, I'm in trouble and need you to buy $500 in Google Play cards. Please don't tell mom.",
];

const LS_KEY = "techbuddy_openai_key";

export default function ScamPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<ScamResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      const key = localStorage.getItem(LS_KEY);
      if (key) headers["x-openai-key"] = key;

      const res = await fetch("/api/scam", {
        method: "POST",
        headers,
        body: JSON.stringify({ text: text.trim() }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed");
      setResult(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const confidenceLabel = {
    high: "Very confident",
    medium: "Fairly confident",
    low: "Uncertain — proceed with caution",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 font-[var(--font-inter)]">
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
              <div className="w-9 h-9 bg-red-500 rounded-xl flex items-center justify-center shadow">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl md:text-2xl font-black text-gray-900">
                Scam <span className="text-red-500">Checker</span>
              </span>
            </div>
            <div className="w-20" />
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
            Is This a Scam?
          </h1>
          <p className="text-lg md:text-xl text-gray-500 font-medium max-w-xl mx-auto">
            Got a suspicious text, email, phone call, or pop-up message?
            Paste it below and we&apos;ll check it for you instantly.
          </p>
        </div>

        {/* Input */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 md:p-8 space-y-5">
          <div>
            <label className="block text-xl font-black text-gray-900 mb-2">
              Paste the suspicious message here:
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. 'Your Amazon account has been locked. Call 1-800-555-0129 to unlock it.' — paste anything here"
              rows={5}
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 focus:border-red-400 focus:outline-none rounded-2xl text-base md:text-lg font-medium text-gray-800 placeholder:text-gray-400 transition-colors resize-none leading-relaxed"
              disabled={loading}
            />
          </div>

          {/* Example chips */}
          <div>
            <p className="text-sm font-bold text-gray-400 mb-2 flex items-center gap-1.5">
              <ClipboardPaste className="w-4 h-4" />
              Or tap an example to try it:
            </p>
            <div className="flex flex-col gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setText(ex)}
                  className="text-left text-sm font-medium text-gray-600 bg-gray-50 hover:bg-red-50 hover:text-red-700 border border-gray-200 hover:border-red-200 px-4 py-3 rounded-xl transition-colors leading-snug"
                >
                  &ldquo;{ex}&rdquo;
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCheck}
            disabled={!text.trim() || loading}
            className={`w-full flex items-center justify-center gap-3 font-black text-xl py-5 rounded-2xl shadow-lg transition-all ${
              text.trim() && !loading
                ? "bg-red-500 hover:bg-red-600 text-white hover:shadow-xl"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Shield className="w-6 h-6" />
                Check for Scam
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 rounded-2xl p-5 font-semibold text-base">
            Something went wrong: {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-5">
            {/* Verdict banner */}
            <div
              className={`rounded-3xl p-7 md:p-9 flex items-start gap-5 shadow-xl border-4 ${
                result.isScam
                  ? "bg-gradient-to-br from-red-500 to-red-700 border-red-300 text-white"
                  : "bg-gradient-to-br from-green-500 to-emerald-600 border-green-300 text-white"
              }`}
            >
              <div className="bg-white/20 rounded-2xl p-3 shrink-0">
                {result.isScam ? (
                  <ShieldAlert className="w-10 h-10 text-white" />
                ) : (
                  <ShieldCheck className="w-10 h-10 text-white" />
                )}
              </div>
              <div>
                <p className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">
                  {result.isScam ? "Scam Detected" : "Looks Safe"} · {confidenceLabel[result.confidence]}
                </p>
                <p className="text-2xl md:text-3xl font-black leading-snug">
                  {result.verdict}
                </p>
                <p className="mt-3 text-base md:text-lg opacity-90 leading-relaxed">
                  {result.summary}
                </p>
              </div>
            </div>

            {/* Red flags */}
            {result.redFlags.length > 0 && (
              <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6 md:p-8">
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                  Warning Signs I Found
                </h3>
                <ul className="space-y-3">
                  {result.redFlags.map((flag, i) => (
                    <li key={i} className="flex items-start gap-3 text-base md:text-lg text-gray-700">
                      <span className="text-red-500 font-black shrink-0 mt-0.5">✗</span>
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Safe actions */}
            <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6 md:p-8">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                What You Should Do Right Now
              </h3>
              <ol className="space-y-4">
                {result.safeActions.map((action, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="shrink-0 w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black text-base">
                      {i + 1}
                    </div>
                    <p className="text-base md:text-lg font-semibold text-gray-800 leading-relaxed pt-1">
                      {action}
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Check another */}
            <button
              onClick={() => { setText(""); setResult(null); }}
              className="w-full py-4 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-lg hover:border-red-300 hover:text-red-600 transition-colors"
            >
              Check Another Message
            </button>
          </div>
        )}

        {/* Helpful note */}
        {!result && !loading && (
          <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-5 text-base text-blue-800">
            <p className="font-bold mb-1">You can check anything suspicious here:</p>
            <ul className="space-y-1 text-blue-700">
              <li>✓ Text messages about packages, prizes, or accounts</li>
              <li>✓ Emails from banks, the IRS, or Amazon</li>
              <li>✓ Phone call scripts or voicemail transcripts</li>
              <li>✓ Pop-up warnings on your computer</li>
              <li>✓ Messages from strangers asking for money or gift cards</li>
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
