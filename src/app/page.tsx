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
    <section className="w-full flex min-h-[77vh] items-center justify-center bg-gradient-to-br from-[#0c1b2e] via-[#121832] to-[#191f2e] pb-8 pt-8">
      <div className="
        w-full max-w-2xl mx-auto rounded-3xl shadow-2xl border border-[#23335170] bg-gradient-to-br 
        from-[#181f2f]/80 to-[#101522]/90 backdrop-blur-[2.5px]
        p-0 flex flex-col items-center 
      ">
        <div className="flex flex-col items-center gap-1 pt-8 pb-1 w-full">
          <div className="flex items-center gap-3">
            <span className="bg-gradient-to-tr from-cyan-400 to-fuchsia-500 w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg">
              <User2 size={28} className="text-white" />
            </span>
            <span className="font-extrabold text-[2rem] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400">Strangerly</span>
          </div>
          <h1 className="text-center text-white text-3xl md:text-4xl font-bold tracking-tight mt-2 mb-0">
            Chat with <span className="bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">Strangers</span>
          </h1>
          <div className="flex items-center gap-2 mt-2 mb-4">
            <span className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse shadow"></span>
            <span className="text-[#38fae7] font-bold text-base">7,402</span>
            <span className="text-slate-400 text-sm">people online now</span>
          </div>
        </div>
        {/* Modes */}
        <div className="flex flex-wrap gap-5 p-2 w-full items-stretch justify-center mb-3 mt-5">
          <LandingModeBtn icon={<MessageCircle size={25} />} label="Text Chat" sub="Instant, safe messages" active={mode === "text"} onClick={() => setMode("text")} />
          <LandingModeBtn icon={<Mic size={25} />} label="Voice Chat" sub="No signup, crystal clear" active={mode === "voice"} onClick={() => setMode("voice")} />
          <LandingModeBtn icon={<Video size={25} />} label="Video Chat" sub="1-tap cam chat" active={mode === "video"} onClick={() => setMode("video")} />
        </div>
        <button
          onClick={onStart}
          className="w-[90%] max-w-xs mx-auto mb-3 mt-1 py-4 px-4 bg-gradient-to-r from-cyan-400 to-fuchsia-400 hover:from-blue-500 hover:to-pink-500 text-white font-bold text-lg rounded-xl shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          {mode === "text" && <MessageCircle size={21} />} 
          {mode === "voice" && <Mic size={21} />} 
          {mode === "video" && <Video size={21} />} 
          Start {mode.charAt(0).toUpperCase() + mode.slice(1)} Chat
        </button>
        <div className="flex flex-wrap items-center gap-3 justify-center mt-1 mb-1 text-xs font-medium">
          <span className="bg-[#1d2f44] text-cyan-300 rounded-md px-2 py-0.5 flex items-center gap-1"><RefreshCw size={14}/> Instant match</span>
          <span className="bg-[#26344c] text-pink-200 rounded-md px-2 py-0.5 flex items-center gap-1"><ShieldCheck size={14}/> Moderated</span>
          <span className="bg-[#17394c] text-blue-100 rounded-md px-2 py-0.5">No signup</span>
        </div>
        <p className="text-xs mt-2 mb-7 text-center text-slate-400 px-7 pb-2">
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
        w-[150px] h-[120px] md:w-[170px] md:h-[130px]
        flex flex-col items-center justify-center transition-all rounded-2xl shadow-md border 
        ${active
        ? "bg-gradient-to-tr from-cyan-400 to-fuchsia-500 text-white border-cyan-300 scale-105 shadow-[0_6px_32px_#18e1cd44]"
        : "bg-[#181f2f]/90 text-cyan-100 border-[#2e3b5d] hover:border-cyan-300/60 hover:scale-105"
        }
      `}
      style={{ minWidth: 120 }}
      onClick={onClick}
      type="button"
    >
      <span className="mb-1">{icon}</span>
      <span className={`font-bold text-base mb-1 ${active ? "text-white" : ""}`}>{label}</span>
      <span className="text-xs opacity-70 text-center">{sub}</span>
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
    <div className="bg-gradient-to-br from-[#0c1b2e] via-[#121832] to-[#191f2e] min-h-screen w-full">
      <Navbar />
      <LandingHero onStart={handleStart} mode={mode} setMode={setMode} />

      <div className="w-full flex flex-col gap-y-0 items-center justify-center py-12">
        <div className="max-w-5xl w-full px-4 mx-auto grid grid-cols-1 md:grid-cols-2 gap-7">
          <div className="bg-gradient-to-br from-[#18253a]/80 via-[#1c273c]/80 to-[#1b2440]/70 rounded-2xl shadow-xl p-7 min-h-[270px] flex items-center justify-center">
            <HowItWorks />
          </div>
          <div className="bg-gradient-to-br from-[#21243a]/70 to-[#191d3c]/80 rounded-2xl shadow-xl p-7 min-h-[270px] flex items-center justify-center">
            <SafetySection />
          </div>
        </div>
      </div>

      <section className="max-w-xl mx-auto rounded-xl bg-[#13223a]/60 p-7 text-center shadow-sm mb-10">
        <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">About Strangerly</h2>
        <p className="text-slate-300 opacity-80 text-base">
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