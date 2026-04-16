"use client";

import { useRef, useCallback } from "react";
import { ImageIcon, X, Camera } from "lucide-react";

interface ImageUploaderProps {
  onImageSelect: (file: File, previewUrl: string) => void;
  previewUrl: string | null;
  onClear: () => void;
  disabled?: boolean;
}

export default function ImageUploader({
  onImageSelect,
  previewUrl,
  onClear,
  disabled = false,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt="Your screenshot"
          className="w-full max-h-[500px] object-contain bg-gray-900"
        />
        {!disabled && (
          <button
            onClick={onClear}
            className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-2.5 shadow-lg transition-all"
            title="Remove image"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <p className="text-white text-base font-bold flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Screenshot ready — good job!
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
        </div>
      </button>
    </div>
  );
}
