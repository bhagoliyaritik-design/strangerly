"use client";
import { Mic, Video, MessageCircle, CheckCircle2, Globe, UserCircle2 } from "lucide-react";
import React, { useState } from "react";

const chatModes = [
  {
    key: "text",
    label: "Text",
    icon: <MessageCircle size={22} />,
    desc: "Instant, safe text conversations"
  },
  {
    key: "voice",
    label: "Voice",
    icon: <Mic size={22} />,
    desc: "Anonymous voice chat"
  },
  {
    key: "video",
    label: "Video",
    icon: <Video size={22} />,
    desc: "Video talk, face to face"
  },
];

export default function HeroSection() {
  const [mode, setMode] = useState("video"); // Default = video, like OpenTalk

  return (
    <section
      className="min-h-[94vh] w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#091724] via-[#102139] to-[#151828]">
      <div className="w-full max-w-2xl mx-auto rounded-3xl shadow-2xl p-0 bg-[#171d27]/85 border border-[#274052]/60 flex flex-col items-center justify-center backdrop-blur-xl"
        style={{boxShadow:"0 10px 48px 0 #0d406e44"}}>
        {/* Animated Icons */}
        <div className="flex items-center justify-center gap-5 mt-7 mb-4">
          <div className="bg-gradient-to-br from-cyan-400 to-blue-600 shadow-xl p-4 rounded-2xl">
            <MessageCircle size={38} className="text-white drop-shadow-xl" />
          </div>
          <div className="bg-gradient-to-br from-blue-800 to-purple-700 shadow-xl p-4 rounded-2xl">
            <Video size={38} className="text-white drop-shadow-xl" />
          </div>
        </div>
        {/* Heading */}
        <h1 className="text-4xl font-extrabold text-center tracking-tight select-none mt-4 mb-1">
          <span className="text-white">Chat with </span>
          <span className="bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">Strangers</span>
        </h1>
        {/* Online + subtitle */}
        <div className="flex items-center justify-center gap-2 mt-2 mb-4">
          <span className="h-3 w-3 rounded-full bg-green-400 animate-pulse shadow"></span>
          <span className="text-[#38fae7] font-semibold text-lg">7,008</span>
          <span className="text-slate-400 text-sm">people chatting right now</span>
        </div>

        {/* Mode Select Card */}
        <div className="flex items-center justify-center mt-3 mb-6">
          <div className="bg-gradient-to-tr from-[#1e2834] to-[#232b44] border border-[#23313e] rounded-xl shadow-lg px-2 py-3 flex gap-3">
            {chatModes.map(m => (
              <button
                key={m.key}
                className={`font-semibold text-base px-8 py-2 rounded-lg flex flex-col items-center gap-1 transition-all outline-none shadow-[0_0_15px_#2bb1dc22]
                ${mode === m.key
                  ? "bg-gradient-to-r from-cyan-600 to-blue-800 text-white shadow-xl scale-105"
                  : "bg-[#232a39] text-cyan-200 hover:bg-cyan-700/50"
                }`}
                style={{ minWidth: 94, outline: mode === m.key ? "2px solid #21dad9" : "" }}
                onClick={() => setMode(m.key)}
              >
                {m.icon}
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Big CTA */}
        <button
          className="w-full max-w-xs mt-2 bg-gradient-to-r from-cyan-400 to-fuchsia-400 hover:from-blue-400 hover:to-pink-400 transition-colors duration-200
            text-white font-bold text-lg rounded-xl shadow-lg py-4 px-4 tracking-tight flex items-center justify-center gap-3
            active:scale-[0.97]
          "
          style={{marginTop:20, marginBottom:10, letterSpacing:"0.01em"}}
        >
          Start {mode.charAt(0).toUpperCase() + mode.slice(1)} Chat
          <span className="inline-block ml-3">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M18.495 12.709a1 1 0 0 0 0-1.42L9.682 2.95a1 1 0 0 0-1.364 1.46l7.276 7.517H3.97a1 1 0 1 0 0 2h11.624l-7.276 7.517A1 1 0 1 0 9.682 21.05l8.813-8.339Z"/></svg>
          </span>
        </button>

        {/* Features/Badges */}
        <div className="flex items-center justify-center gap-3 mt-5 mb-2 text-xs">
          <div className="bg-[#1d2831] text-cyan-300 font-bold rounded-lg px-3 py-1 flex items-center gap-2"><CheckCircle2 size={16}/> Instant match</div>
          <div className="bg-[#182439] text-blue-300 font-bold rounded-lg px-3 py-1 flex items-center gap-2"><Globe size={16}/> 100+ countries</div>
          <div className="bg-[#2a1432] text-pink-200 rounded-lg px-3 py-1 font-bold flex items-center gap-2"><UserCircle2 size={16}/> No signup</div>
          <div className="bg-[#1d2831] text-orange-200 rounded-lg px-3 py-1">Moderated</div>
        </div>
        {/* description below badges */}
        <p className="text-xs mt-2 mb-6 text-center text-slate-400 px-8">
          Free random video & text chat with people around the world. No signup, no install. The modern Omegle alternative.
        </p>
      </div>
    </section>
  );
}