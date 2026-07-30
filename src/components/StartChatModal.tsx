"use client";
import React, { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";
import { ChatMode } from "@/types";

type Props = {
  open: boolean;
  onClose: () => void;
  mode: ChatMode;
};

const modeLabels: Record<ChatMode, string> = {
  text: "Text Chat",
  voice: "Voice Chat",
  video: "Video Chat",
};

export default function StartChatModal({ open, onClose, mode }: Props) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (open) {
      setTimeout(() => setLoading(true), 0); // ✅ Lint happy!
      timer = setTimeout(() => setLoading(false), 2500);
    } else {
      setLoading(true); // Reset loading when closed
    }

    return () => clearTimeout(timer);
  }, [open, mode]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur">
      <div className="glass-card p-8 min-w-[90vw] max-w-[400px] relative">
        <button
          className="absolute top-4 right-4 p-1 rounded-full bg-glass hover:bg-cyan/10 transition"
          aria-label="Close"
          onClick={onClose}
        >
          <X size={23} />
        </button>
        <h3 className="gradient-glow-text text-xl font-bold mb-5 flex items-center justify-center">
          {loading ? "Finding someone..." : "Person Found"}
        </h3>
        <div className="flex flex-col gap-7 items-center">
          {loading ? (
            <>
              <div className="flex flex-col items-center">
                <Loader2 className="animate-spin text-cyan mb-4" size={45} />
                <span className="text-slate-300 text-md">
                  Hang tight. Looking for a partner for {modeLabels[mode].toLowerCase()}...
                </span>
              </div>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-slate-100 font-semibold transition-all"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <div className="text-slate-100 mb-3">
                You are now matched.{" "}
                <span className="gradient-glow-text font-semibold">Enjoy your chat!</span> (This is a prototype.)
              </div>
              <button
                onClick={onClose}
                className="px-7 py-3 rounded-full bg-gradient-glow shadow-glow text-white font-semibold transition-all hover:scale-105"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}