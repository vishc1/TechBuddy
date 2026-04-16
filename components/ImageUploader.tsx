"use client";

import { useRef, useCallback, useEffect } from "react";
import { ImageIcon, X, Camera, ClipboardPaste } from "lucide-react";

export type TapZone =
  | "top-left" | "top-center" | "top-right"
  | "middle-left" | "center" | "middle-right"
  | "bottom-left" | "bottom-center" | "bottom-right";

export interface TapTarget {
  zone: TapZone;
  label: string;
}

const ZONE_POSITIONS: Record<TapZone, { x: number; y: number }> = {
  "top-left":      { x: 18, y: 10 },
  "top-center":    { x: 50, y: 10 },
  "top-right":     { x: 82, y: 10 },
  "middle-left":   { x: 18, y: 50 },
  "center":        { x: 50, y: 50 },
  "middle-right":  { x: 82, y: 50 },
  "bottom-left":   { x: 18, y: 88 },
  "bottom-center": { x: 50, y: 88 },
  "bottom-right":  { x: 82, y: 88 },
};

interface ImageUploaderProps {
  onImageSelect: (file: File, previewUrl: string) => void;
  previewUrl: string | null;
  onClear: () => void;
  disabled?: boolean;
  tapTarget?: TapTarget | null;
}

export default function ImageUploader({
  onImageSelect,
  previewUrl,
  onClear,
  disabled = false,
  tapTarget,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Allow pasting a screenshot from clipboard (Ctrl+V / Cmd+V)
  useEffect(() => {
    if (disabled) return;
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) handleFile(file);
          break;
        }
      }
    };
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      onImageSelect(file, url);
    },
    [onImageSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  if (previewUrl) {
    return (
      <div className="relative rounded-3xl overflow-hidden border-4 border-blue-300 shadow-xl">
        {/* Use h-auto (not object-contain) so % coordinates map directly */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt="Your screenshot"
          className="w-full h-auto block"
        />

        {/* Tap highlight overlay */}
        {tapTarget && (() => {
          const pos = ZONE_POSITIONS[tapTarget.zone] ?? { x: 50, y: 50 };
          return (
          <div
            className="absolute pointer-events-none z-10 flex flex-col items-center gap-1.5"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Pulsing rings */}
            <div className="relative flex items-center justify-center">
              <span className="absolute w-16 h-16 rounded-full bg-yellow-400 opacity-30 animate-ping" />
              <span className="absolute w-10 h-10 rounded-full bg-yellow-400 opacity-50" />
              <span className="relative w-6 h-6 rounded-full bg-yellow-400 border-[3px] border-white shadow-xl" />
            </div>
            {/* Label pill */}
            <div className="bg-yellow-400 text-gray-900 font-black text-sm px-3 py-1 rounded-full whitespace-nowrap shadow-lg leading-snug">
              👆 {tapTarget.label}
            </div>
          </div>
          );
        })()}

        {!disabled && (
          <button
            onClick={onClear}
            className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-2.5 shadow-lg transition-all z-20"
            title="Remove image"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 z-10">
          <p className="text-white text-base font-bold flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            {tapTarget ? `Tap the highlighted area ↑` : "Screenshot ready — good job!"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      <button
        type="button"
        onClick={() => !disabled && fileInputRef.current?.click()}
        disabled={disabled}
        className={`
          w-full flex flex-col items-center gap-5 py-12 md:py-16 px-6 rounded-3xl border-4 border-dashed transition-all
          ${disabled
            ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
            : "border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-500 active:scale-[0.98] cursor-pointer"
          }
        `}
      >
        <div className="w-24 h-24 md:w-28 md:h-28 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
          <Camera className="w-12 h-12 md:w-14 md:h-14 text-white" />
        </div>
        <div className="text-center">
          <p className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
            Tap Here to Choose Your Screenshot
          </p>
          <p className="text-lg md:text-xl text-gray-500 font-medium">
            Find the screenshot in your photos or files
          </p>
          <div className="flex items-center justify-center gap-2 mt-3 text-blue-500 font-semibold text-base">
            <ClipboardPaste className="w-4 h-4" />
            Or press Ctrl+V / ⌘+V to paste directly
          </div>
        </div>
      </button>
    </div>
  );
}
