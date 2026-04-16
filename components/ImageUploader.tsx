"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, ImageIcon, X, Camera } from "lucide-react";

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
  const [isDragging, setIsDragging] = useState(false);

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
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  if (previewUrl) {
    return (
      <div className="relative rounded-3xl overflow-hidden border-4 border-blue-200 shadow-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt="Uploaded screenshot"
          className="w-full max-h-[500px] object-contain bg-gray-900"
        />
        {!disabled && (
          <button
            onClick={onClear}
            className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all"
            title="Remove image"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <p className="text-white text-sm font-semibold flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Screenshot loaded — ready to analyze
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => !disabled && fileInputRef.current?.click()}
      className={`
        relative border-4 border-dashed rounded-3xl p-10 md:p-16 text-center cursor-pointer transition-all
        ${isDragging
          ? "border-blue-500 bg-blue-50 scale-[1.02]"
          : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />
      <div className="flex flex-col items-center gap-5">
        <div
          className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all ${
            isDragging ? "bg-blue-500 animate-bounce" : "bg-blue-100"
          }`}
        >
          {isDragging ? (
            <Upload className="w-10 h-10 md:w-12 md:h-12 text-white" />
          ) : (
            <Camera className="w-10 h-10 md:w-12 md:h-12 text-blue-500" />
          )}
        </div>
        <div>
          <p className="text-2xl md:text-3xl font-black text-gray-800 mb-2">
            {isDragging ? "Drop it here!" : "Upload Your Screenshot"}
          </p>
          <p className="text-base md:text-lg text-gray-500 font-medium">
            Drag &amp; drop or{" "}
            <span className="text-blue-600 font-bold underline">tap to browse</span>
          </p>
          <p className="text-sm text-gray-400 mt-3">
            Supports JPG, PNG, WEBP · Any app or website
          </p>
        </div>
      </div>
    </div>
  );
}
