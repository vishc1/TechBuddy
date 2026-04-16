"use client";

import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Square } from "lucide-react";

interface VoiceOutputProps {
  text: string;
}

export default function VoiceOutput({ text }: VoiceOutputProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setIsSupported("speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined") {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = () => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Slow, clear speech for seniors
    utterance.rate = 0.82;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Prefer a friendly voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) =>
        v.name.toLowerCase().includes("samantha") ||
        v.name.toLowerCase().includes("karen") ||
        v.name.toLowerCase().includes("daniel") ||
        v.name.toLowerCase().includes("google")
    );
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  if (!isSupported) return null;

  return (
    <div className="flex items-center gap-3 md:gap-4">
      {isPlaying ? (
        <button
          onClick={stop}
          className="flex items-center gap-3 bg-red-100 hover:bg-red-200 text-red-700 font-bold px-5 py-3 md:px-6 md:py-4 rounded-2xl text-base md:text-lg transition-all shadow-md"
        >
          <Square className="w-5 h-5 fill-red-500" />
          Stop Reading
        </button>
      ) : (
        <button
          onClick={speak}
          className="flex items-center gap-3 bg-green-100 hover:bg-green-200 text-green-700 font-bold px-5 py-3 md:px-6 md:py-4 rounded-2xl text-base md:text-lg transition-all shadow-md"
        >
          <Volume2 className="w-5 h-5" />
          Read Instructions Aloud
        </button>
      )}
      {isPlaying && (
        <div className="flex gap-1 items-end h-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 bg-green-500 rounded-full animate-bounce"
              style={{
                height: `${12 + i * 4}px`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
