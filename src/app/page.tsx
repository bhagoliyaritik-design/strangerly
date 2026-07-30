"use client";
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWindow from "@/components/ChatWindow";
import { Mic, Video, MessageCircle, RefreshCw, ShieldCheck, User2 } from "lucide-react";
import HowItWorks from "@/components/HowItWorks";
import SafetySection from "@/components/SafetySection";
import { useRouter } from "next/navigation";

type ChatMode = "text" | "voice" | "video";

function LandingHero({
  onStart,
  mode,
  setMode,
}: {
  onStart: () => void;
  mode: ChatMode;
  setMode: (m: ChatMode) => void;
}) {
  return (
    <section className="w-full flex min-h-[75vh] items-center justify-center bg-gradient-to-br from-[#091526] via-[#0f172a] to-[#141b2d] px-4 pt-28 pb-10">
      <div className="
        w-full max-w-2xl mx-auto rounded-3xl shadow-2xl border border-[#22325490] bg-gradient-to-br 
        from-[#131c2e]/95 to-[#0b111f]/95 backdrop-blur-md
        p-2 sm:p-4 flex flex-col items-center 
      ">
        <div className="flex flex-col items-center gap-1 pt-6 pb-1 w-full">
          <div className="flex items-center gap-3">
            <span className="bg-gradient-to-tr from-cyan-400 to-fuchsia-500 w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg">
              <User2 size={28} className="text-white" />
            </span>
            <span className="font-extrabold text-[2rem] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400">Strangerly</span>
          </div>
          <h1 className="text-center text-white text-2xl sm:text-4xl font-bold tracking-tight mt-2 mb-0">
            Chat with <span className="bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">Strangers</span>
          </h1>
          <div className="flex items-center gap-2 mt-2 mb-4">
            <span className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse shadow"></span>
            <span className="text-[#38fae7] font-bold text-base">7,402</span>
            <span className="text-slate-300 text-sm">people online now</span>
          </div>
        </div>

        {/* Modes */}
        <div className="flex flex-wrap gap-3 sm:gap-5 p-2 w-full items-stretch justify-center mb-3 mt-2">
          <LandingModeBtn icon={<MessageCircle size={25} />} label="Text Chat" sub="Instant, safe messages" active={mode === "text"} onClick={() => setMode("text")} />
          <LandingModeBtn icon={<Mic size={25} />} label="Voice Chat" sub="No signup, crystal clear" active={mode === "voice"} onClick={() => setMode("voice")} />
          <LandingModeBtn icon={<Video size={25} />} label="Video Chat" sub="1-tap cam chat" active={mode === "video"} onClick={() => setMode("video")} />
        </div>

        <button
          onClick={onStart}
          className="w-[90%] max-w-xs mx-auto mb-3 mt-2 py-4 px-4 bg-gradient-to-r from-cyan-400 to-fuchsia-400 hover:from-blue-500 hover:to-pink-500 text-white font-bold text-lg rounded-xl shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-all cursor-pointer"
        >
          {mode === "text" && <MessageCircle size={21} />} 
          {mode === "voice" && <Mic size={21} />} 
          {mode === "video" && <Video size={21} />} 
          Start {mode.charAt(0).toUpperCase() + mode.slice(1)} Chat
        </button>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-center mt-1 mb-2 text-xs font-medium">
          <span className="bg-[#152a45] text-cyan-300 rounded-md px-2.5 py-1 flex items-center gap-1"><RefreshCw size={14}/> Instant match</span>
          <span className="bg-[#1f2d48] text-pink-200 rounded-md px-2.5 py-1 flex items-center gap-1"><ShieldCheck size={14}/> Moderated</span>
          <span className="bg-[#123146] text-blue-100 rounded-md px-2.5 py-1">No signup</span>
        </div>

        <p className="text-xs mt-2 mb-5 text-center text-slate-300 px-4 sm:px-7 pb-2">
          Free random text/voice/video chat with people worldwide. Always anonymous. No signup, no install. Strangerly is the modern Omegle &amp; OpenTalk alternative.
        </p>
      </div>
    </section>
  );
}

function LandingModeBtn({
  icon, label, sub, active, onClick
}: {
  icon: React.ReactNode, label: string, sub: string, active: boolean, onClick: () => void
}) {
  return (
    <button
      className={`
        w-[140px] h-[115px] sm:w-[170px] sm:h-[130px]
        flex flex-col items-center justify-center transition-all rounded-2xl shadow-md border cursor-pointer
        ${active
        ? "bg-gradient-to-tr from-cyan-400 to-fuchsia-500 text-white border-cyan-300 scale-105 shadow-[0_6px_32px_#18e1cd44]"
        : "bg-[#141c2e] text-cyan-100 border-[#273557] hover:border-cyan-300/60 hover:scale-105"
        }
      `}
      onClick={onClick}
      type="button"
    >
      <span className="mb-1">{icon}</span>
      <span className={`font-bold text-sm sm:text-base mb-1 ${active ? "text-white" : ""}`}>{label}</span>
      <span className="text-[11px] sm:text-xs opacity-80 text-center px-1">{sub}</span>
    </button>
  );
}

export default function HomePage() {
  const [chatOpen, setChatOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>("text");
  const router = useRouter();

  const handleStart = () => {
    if (mode === "voice") {
      router.push("/voice");
    } else if (mode === "video") {
      router.push("/video");
    } else {
      setChatOpen(true);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#091526] via-[#0f172a] to-[#141b2d] min-h-screen w-full text-white">
      <Navbar />
      <LandingHero onStart={handleStart} mode={mode} setMode={setMode} />

      <div className="w-full flex flex-col gap-y-6 items-center justify-center py-10 px-4">
        <div className="max-w-5xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-[#131f33] to-[#162238] rounded-2xl shadow-xl p-6 sm:p-7 border border-[#253657]/60 flex items-center justify-center">
            <HowItWorks />
          </div>
          <div className="bg-gradient-to-br from-[#161a33] to-[#141836] rounded-2xl shadow-xl p-6 sm:p-7 border border-[#253657]/60 flex items-center justify-center">
            <SafetySection />
          </div>
        </div>
      </div>

      <section className="max-w-xl mx-auto rounded-2xl bg-[#111c2e]/80 border border-[#233351]/50 p-6 sm:p-7 text-center shadow-lg mb-12 mx-4 sm:mx-auto">
        <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">About Strangerly</h2>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Strangerly instantly connects you with strangers for text, voice, or video chat — no signup, always anonymous and modern. The world's simplest Omegle alternative.
        </p>
      </section>

      <Footer />

      {chatOpen && (
        <ChatWindow onLeave={() => setChatOpen(false)} />
      )}
    </div>
  );
}