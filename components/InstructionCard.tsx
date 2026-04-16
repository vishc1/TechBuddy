"use client";

import { Smartphone, Layout, List, Eye, ChevronRight } from "lucide-react";

interface AnalysisResult {
  isScam: boolean;
  scamWarning: string | null;
  appName: string;
  currentScreen: string;
  mainInstruction: string;
  steps: string[];
  visibleElements: string[];
}

interface InstructionCardProps {
  data: AnalysisResult;
}

export default function InstructionCard({ data }: InstructionCardProps) {
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

      {/* Steps */}
      {data.steps && data.steps.length > 0 && (
        <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-md p-6 md:p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-green-100 rounded-xl p-2">
              <List className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-gray-900">
              Step-by-Step Instructions
            </h3>
          </div>
          <ol className="space-y-4">
            {data.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-4">
                <div className="shrink-0 w-9 h-9 md:w-10 md:h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black text-base md:text-lg">
                  {i + 1}
                </div>
                <div className="flex-1 bg-gray-50 rounded-2xl p-3 md:p-4">
                  <p className="text-base md:text-lg font-semibold text-gray-800 leading-relaxed">
                    {step}
                  </p>
                </div>
              </li>
            ))}
          </ol>
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
    </div>
  );
}
