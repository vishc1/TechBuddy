"use client";

import { useState } from "react";
import { Smartphone, Layout, List, Eye, ChevronRight, CheckCircle2, Circle, Copy, Check, Printer, Lightbulb } from "lucide-react";

interface AnalysisResult {
  isScam: boolean;
  scamWarning: string | null;
  appName: string;
  currentScreen: string;
  mainInstruction: string;
  steps: string[];
  visibleElements: string[];
  techTip?: string;
}

interface InstructionCardProps {
  data: AnalysisResult;
}

export default function InstructionCard({ data }: InstructionCardProps) {
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(false);

  const toggleStep = (i: number) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const allDone = data.steps.length > 0 && checkedSteps.size === data.steps.length;

  const handleCopy = async () => {
    const text = [
      `App: ${data.appName} — ${data.currentScreen}`,
      ``,
      data.mainInstruction,
      ``,
      ...data.steps.map((s, i) => `${i + 1}. ${s}`),
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5 md:space-y-6">
      {/* App / Screen Info */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-bold text-sm md:text-base">
          <Smartphone className="w-4 h-4" />
          {data.appName}
        </div>
        <div className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-full font-semibold text-sm md:text-base">
          <Layout className="w-4 h-4" />
          {data.currentScreen}
        </div>
      </div>

      {/* Main Instruction — BIG and prominent */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-6 md:p-8 shadow-xl">
        <p className="text-sm md:text-base font-semibold text-blue-200 uppercase tracking-widest mb-3">
          What to do next
        </p>
        <p className="text-2xl md:text-3xl lg:text-4xl font-black leading-snug">
          {data.mainInstruction}
        </p>
      </div>

      {/* Steps with checkoff */}
      {data.steps && data.steps.length > 0 && (
        <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-md p-6 md:p-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 rounded-xl p-2">
                <List className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-gray-900">
                Step-by-Step Instructions
              </h3>
            </div>
            <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 text-sm md:text-base font-bold text-gray-500 hover:text-green-600 transition-colors px-3 py-2 rounded-xl hover:bg-green-50 no-print"
              title="Print instructions"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 text-sm md:text-base font-bold text-gray-500 hover:text-blue-600 transition-colors px-3 py-2 rounded-xl hover:bg-blue-50"
              title="Copy all steps"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-5">
            <div className="flex items-center justify-between text-sm font-semibold text-gray-500 mb-1.5">
              <span>Your progress</span>
              <span>{checkedSteps.size} of {data.steps.length} done</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${(checkedSteps.size / data.steps.length) * 100}%` }}
              />
            </div>
          </div>

          {allDone && (
            <div className="flex items-center gap-3 bg-green-50 border-2 border-green-200 text-green-700 rounded-2xl px-5 py-4 mb-5 font-bold text-base md:text-lg">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              Great job! You finished all the steps!
            </div>
          )}

          <ol className="space-y-4">
            {data.steps.map((step, i) => {
              const done = checkedSteps.has(i);
              return (
                <li key={i}>
                  <button
                    onClick={() => toggleStep(i)}
                    className={`w-full flex items-start gap-4 rounded-2xl p-3 md:p-4 transition-all text-left group ${
                      done
                        ? "bg-green-50 border-2 border-green-200"
                        : "bg-gray-50 border-2 border-transparent hover:border-blue-200 hover:bg-blue-50"
                    }`}
                    title={done ? "Mark as not done" : "Mark as done"}
                  >
                    <div className={`shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center font-black text-base md:text-lg transition-colors ${
                      done ? "bg-green-500 text-white" : "bg-blue-600 text-white"
                    }`}>
                      {done ? <Check className="w-5 h-5" /> : i + 1}
                    </div>
                    <div className="flex-1 flex items-start justify-between gap-3">
                      <p className={`text-base md:text-lg font-semibold leading-relaxed transition-colors ${
                        done ? "text-green-700 line-through decoration-green-400" : "text-gray-800"
                      }`}>
                        {step}
                      </p>
                      <div className={`shrink-0 mt-0.5 transition-colors ${done ? "text-green-500" : "text-gray-300 group-hover:text-blue-400"}`}>
                        {done ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>

          <p className="text-sm text-gray-400 font-medium text-center mt-4">
            Tap a step to mark it as done
          </p>
        </div>
      )}

      {/* Visible Elements */}
      {data.visibleElements && data.visibleElements.length > 0 && (
        <div className="bg-gray-50 rounded-3xl border border-gray-200 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 rounded-xl p-2">
              <Eye className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg md:text-xl font-black text-gray-700">
              What I Can See on Screen
            </h3>
          </div>
          <ul className="space-y-2">
            {data.visibleElements.map((el, i) => (
              <li key={i} className="flex items-center gap-3 text-gray-600">
                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-sm md:text-base font-medium">{el}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tech Tip */}
      {data.techTip && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 md:p-7 flex items-start gap-4">
          <div className="shrink-0 w-11 h-11 bg-amber-400 rounded-2xl flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-amber-700 uppercase tracking-wider mb-1">
              Did you know?
            </p>
            <p className="text-base md:text-lg font-semibold text-amber-900 leading-relaxed">
              {data.techTip}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
