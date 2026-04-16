"use client";

import { ShieldAlert, X } from "lucide-react";

interface ScamWarningProps {
  message: string;
}

export default function ScamWarning({ message }: ScamWarningProps) {
  return (
    <div className="relative bg-gradient-to-br from-red-500 to-red-700 text-white rounded-3xl p-6 md:p-8 shadow-2xl border-4 border-red-300 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="bg-white/20 rounded-2xl p-3 shrink-0">
          <ShieldAlert className="w-10 h-10 md:w-12 md:h-12 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <X className="w-6 h-6 text-red-200" />
            <h3 className="text-2xl md:text-3xl font-black tracking-tight">
              SCAM WARNING!
            </h3>
          </div>
          <p className="text-lg md:text-xl font-semibold text-red-100 leading-relaxed mb-4">
            {message}
          </p>
          <div className="bg-white/15 rounded-2xl p-4">
            <p className="text-base md:text-lg font-bold text-white">
              What to do right now:
            </p>
            <ul className="mt-2 space-y-1 text-red-100 text-sm md:text-base">
              <li>✓ Do NOT click any buttons on that screen</li>
              <li>✓ Do NOT call any phone numbers shown</li>
              <li>✓ Close the app completely</li>
              <li>✓ Tell a trusted family member or friend</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
