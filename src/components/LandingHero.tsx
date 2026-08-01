"use client";
import React, { useState } from "react";
import { MessageCircle, Mic, Video, User2, ShieldCheck, RefreshCw, MousePointerClick } from "lucide-react";

interface ModeItem {
  key: string;
  title: string;
  icon: React.ReactNode;
  desc: string;
}

const modes: ModeItem[] = [
  {
    key: "text",
    title: "Text Chat",
    icon: <MessageCircle size={26} />,
    desc: "Send instant messages with a random stranger using only text.",
  },
  {
    key: "voice",
    title: "Voice Chat",
    icon: <Mic size={26} />,
    desc: "Talk out loud using your voice—connect on a deeper level.",
  },
  {
    key: "video",
    title: "Video Chat",
    icon: <Video size={26} />,
    desc: "See and talk live, face-to-face with someone random.",
  },
];

export default function LandingHero({ onStart }: { onStart?: (mode: string) => void }) {
  const [mode, setMode] = useState("video");

  return (
    <section className="min-h-[95vh] flex items-center justify-center bg-gradient-to-br from-[#0c1b2e] via-[#111c2d] to-[#1b2333] relative overflow-x-hidden">
      {/* Center Card */}
      <div className="w-full max-w-2xl bg-gradient-to-br from-[#142133]/90 to-[#1b2434]/95 rounded-3xl shadow-2xl border-[0.5px] border-[#18314a] mx-auto p-0 flex flex-col items-center relative">
        
        {/* Logo area */}
        <div className="flex items-center gap-3 pt-8 pb-2">
          <div className="bg-gradient-to-tr from-cyan-400 to-fuchsia-500 w-11 h-11 rounded-2xl flex items-center justify-center shadow-xl">
            <User2 size={28} className="text-white" />
          </div>
          <span className="font-extrabold text-[2rem] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400">Strangerly</span>
        </div>

        {/* Big Heading */}
        <h1 className="text-3xl mt-2 md:text-4xl text-white text-center font-bold tracking-tight">
          Chat with <span className="bg-gradient-to-r from-cyan-300 to-fuchsia-400 bg-clip-text text-transparent">Strangers</span>
        </h1>

        {/* Subtitle/Online */}
        <div className="flex items-center gap-2 justify-center mb-4 mt-2">
          <span className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse shadow"></span>
          <span className="text-[#3afae2] font-semibold text-base">7,402</span>
          <span className="text-slate-400 text-sm">people online now</span>
        </div>

        {/* Mode Select */}
        <div className="w-full flex items-center justify-center gap-2 mt-5 mb-8 px-4">
          {modes.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`
                px-5 py-5 rounded-2xl border-2 transition-all duration-150 flex flex-col items-center gap-2
                shadow-lg
                ${mode === m.key
                  ? "bg-gradient-to-tr from-cyan-400 to-fuchsia-600 text-white border-cyan-400 scale-105 shadow-[0_6px_40px_#22e3dd55]"
                  : "bg-[#191e2f] text-cyan-200 border-[#232b44] hover:bg-cyan-700/20 hover:scale-[1.04]"
                }
              `}
              style={{ minWidth: 100 }}
            >
              {m.icon}
              <span className="font-bold text-base">{m.title}</span>
              <span className="text-[11px] mt-0.5 text-cyan-100 opacity-75 text-center">{m.desc}</span>
            </button>
          ))}
        </div>

        {/* Big CTA */}
        <button
          className="w-[90%] max-w-xs bg-gradient-to-r from-cyan-400 to-fuchsia-500 hover:to-blue-400 hover:from-pink-400 
          text-lg font-bold rounded-xl shadow-xl py-4 mb-5 mt-0 transition-all active:scale-95 
          flex items-center gap-3 justify-center text-white cursor-pointer"
          onClick={() => onStart && onStart(mode)}
        >
          {mode === "video" ? <Video size={23} /> : mode === "voice" ? <Mic size={23} /> : <MessageCircle size={23} />}
          Start {modes.find(m => m.key === mode)?.title}
        </button>

        {/* Features / badges below button */}
        <div className="flex items-center gap-3 justify-center mt-1 mb-3 text-xs font-medium">
          <span className="bg-[#1d2f44] text-cyan-300 rounded-md px-2 py-0.5 flex items-center gap-1"><RefreshCw size={14}/> Instant match</span>
          <span className="bg-[#282143] text-pink-200 rounded-md px-2 py-0.5 flex items-center gap-1"><ShieldCheck size={14}/> Moderated</span>
          <span className="bg-[#17394c] text-blue-100 rounded-md px-2 py-0.5">No signup</span>
        </div>

        <p className="text-xs mt-0 mb-8 text-center text-slate-400 px-7">
          Free random chat with people around the world. No signup, no install, always anonymous. The modern Omegle & OpenTalk alternative.
        </p>

      </div>
    </section>
  );
}