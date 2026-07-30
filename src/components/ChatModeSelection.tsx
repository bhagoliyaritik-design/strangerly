"use client";
import React from "react";
import { Mic, Video, MessageCircle } from 'lucide-react';
import type { ChatMode } from "@/types";

const modes = [
  {
    key: "text" as ChatMode,
    title: "Text Chat",
    icon: <MessageCircle size={28} />,
    desc: "Send instant messages with a random stranger using only text.",
  },
  {
    key: "voice" as ChatMode,
    title: "Voice Chat",
    icon: <Mic size={28} />,
    desc: "Talk out loud using your voice—connect on a deeper level.",
  },
  {
    key: "video" as ChatMode,
    title: "Video Chat",
    icon: <Video size={28} />,
    desc: "See and talk live, face-to-face with someone random.",
  },
];

type Props = {
  selected: ChatMode;
  setSelected: (mode: ChatMode) => void;
}

export default function ChatModeSelection({ selected, setSelected }: Props) {
  return (
    <section className="section pt-10" id="chat">
      <h2 className="text-2xl font-bold gradient-glow-text mb-7 text-center">Choose your chat mode</h2>
      <div className="flex flex-col md:flex-row gap-7 justify-center items-center">
        {modes.map(mode => (
          <button
            key={mode.key}
            className={`glass-card p-7 flex-1 min-w-[230px] flex flex-col items-center gap-3 border-2 transition-all duration-200 ${
              selected === mode.key
                ? "border-gradient-glow scale-105 shadow-glow animate-glow"
                : "border-transparent hover:border-cyan/40"
            }`}
            onClick={() => setSelected(mode.key)}
          >
            <span className="mb-2 text-cyan">{mode.icon}</span>
            <h3 className="text-lg font-semibold">{mode.title}</h3>
            <p className="text-slate-400 text-sm">{mode.desc}</p>
          </button>
        ))}
      </div>
    </section>
  );
}