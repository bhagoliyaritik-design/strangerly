"use client";
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWindow from "@/components/ChatWindow";
import { Mic, Video, MessageCircle, RefreshCw, ShieldCheck, User2, User } from "lucide-react";
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
    <section className="w-full flex min-h-[75vh] items-center justify-center bg-gradient-to-br from-[#091526] via-[#0f172a] to-[#141b2d] px-3 sm:px-4 pt-24 sm:pt-28 pb-8">
      
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center relative">
        
        {/* Dynamic Header Animation Area (Mobile Optimized) */}
        <div className="h-16 sm:h-20 flex items-center justify-center w-full mb-1">
          {mode === "text" && (
            <div className="flex items-center gap-2 sm:gap-4 animate-bounce">
              <div className="bg-[#18263c] border border-[#2b3e5d] text-cyan-200 px-3 py-1.5 rounded-2xl rounded-bl-sm text-[11px] sm:text-xs shadow-xl">
                Hey 👋
              </div>
              <div className="bg-[#152338] border border-[#263a59] text-cyan-100 px-3 py-1.5 rounded-2xl rounded-br-sm text-[11px] sm:text-xs shadow-xl">
                Hi! Where you from?
              </div>
            </div>
          )}

          {mode === "voice" && (
            <div className="flex items-center gap-1 bg-[#131d2e]/90 border border-[#223552] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-inner">
              <span className="w-1 h-2.5 sm:h-3 bg-cyan-400 rounded-full animate-pulse"></span>
              <span className="w-1 h-4 sm:h-6 bg-cyan-400 rounded-full animate-pulse [animation-delay:0.2s]"></span>
              <span className="w-1 h-6 sm:h-8 bg-cyan-400 rounded-full animate-pulse [animation-delay:0.4s]"></span>
              <span className="text-[10px] sm:text-xs text-cyan-300 font-bold px-1.5 sm:px-2 tracking-wide">Voice Active</span>
              <span className="w-1 h-6 sm:h-8 bg-cyan-400 rounded-full animate-pulse [animation-delay:0.4s]"></span>
              <span className="w-1 h-4 sm:h-6 bg-cyan-400 rounded-full animate-pulse [animation-delay:0.2s]"></span>
              <span className="w-1 h-2.5 sm:h-3 bg-cyan-400 rounded-full animate-pulse"></span>
            </div>
          )}

          {mode === "video" && (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-12 sm:w-14 h-10 sm:h-12 bg-[#152338] border border-[#263a59] rounded-xl flex items-center justify-center shadow-lg relative">
                <span className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                <User size={18} className="text-cyan-400" />
              </div>
              <div className="w-6 sm:w-12 h-0.5 bg-gradient-to-r from-cyan-500 to-fuchsia-500 animate-pulse"></div>
              <div className="w-12 sm:w-14 h-10 sm:h-12 bg-[#152338] border border-[#263a59] rounded-xl flex items-center justify-center shadow-lg relative">
                <Video size={10} className="absolute top-1.5 right-1.5 text-cyan-400" />
                <User size={18} className="text-cyan-400" />
              </div>
            </div>
          )}
        </div>

        {/* Main Card Box */}
        <div className="
          w-full rounded-2xl sm:rounded-3xl shadow-2xl border border-[#22325490] bg-gradient-to-br 
          from-[#131c2e]/95 to-[#0b111f]/95 backdrop-blur-md
          p-3 sm:p-6 flex flex-col items-center
        ">
          <div className="flex flex-col items-center gap-1 pt-2 pb-1 w-full">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="bg-gradient-to-tr from-cyan-400 to-fuchsia-500 w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <User2 size={24} className="text-white sm:w-7 sm:h-7" />
              </span>
              <span className="font-extrabold text-2xl sm:text-[2rem] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400">Strangerly</span>
            </div>
            <h1 className="text-center text-white text-xl sm:text-4xl font-bold tracking-tight mt-1.5 sm:mt-2 mb-0">
              Chat with <span className="bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">Strangers</span>
            </h1>
            <div className="flex items-center gap-2 mt-1.5 sm:mt-2 mb-3 sm:mb-4">
              <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-green-400 animate-pulse shadow"></span>
              <span className="text-[#38fae7] font-bold text-sm sm:text-base">7,402</span>
              <span className="text-slate-300 text-xs sm:text-sm">people online now</span>
            </div>
          </div>

          {/* Modes (Mobile Grid 3-column layout) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 p-1 w-full items-stretch justify-center mb-3 mt-1">
            <LandingModeBtn icon={<MessageCircle size={22} />} label="Text" sub="Instant msg" active={mode === "text"} onClick={() => setMode("text")} />
            <LandingModeBtn icon={<Mic size={22} />} label="Voice" sub="Crystal clear" active={mode === "voice"} onClick={() => setMode("voice")} />
            <LandingModeBtn icon={<Video size={22} />} label="Video" sub="1-tap cam" active={mode === "video"} onClick={() => setMode("video")} />
          </div>

          <button
            onClick={onStart}
            className="w-full max-w-xs mx-auto mb-2 sm:mb-3 mt-1 sm:mt-2 py-3.5 sm:py-4 px-4 bg-gradient-to-r from-cyan-400 to-fuchsia-400 hover:from-blue-500 hover:to-pink-500 text-white font-bold text-base sm:text-lg rounded-xl shadow-lg flex items-center justify-center gap-2.5 active:scale-95 transition-all cursor-pointer"
          >
            {mode === "text" && <MessageCircle size={19} />} 
            {mode === "voice" && <Mic size={19} />} 
            {mode === "video" && <Video size={19} />} 
            Start {mode.charAt(0).toUpperCase() + mode.slice(1)} Chat
          </button>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 justify-center mt-1 mb-2 text-[11px] sm:text-xs font-medium">
            <span className="bg-[#152a45] text-cyan-300 rounded-md px-2 py-1 flex items-center gap-1"><RefreshCw size={12}/> Instant match</span>
            <span className="bg-[#1f2d48] text-pink-200 rounded-md px-2 py-1 flex items-center gap-1"><ShieldCheck size={12}/> Moderated</span>
            <span className="bg-[#123146] text-blue-100 rounded-md px-2 py-1">No signup</span>
          </div>

          <p className="text-[11px] sm:text-xs mt-1 mb-1 text-center text-slate-300 px-2 sm:px-7 pb-1">
            Free random text/voice/video chat with people worldwide. Always anonymous. No signup, no install.
          </p>
        </div>

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
        flex-1 min-w-0 h-[100px] sm:h-[130px]
        flex flex-col items-center justify-center transition-all rounded-xl sm:rounded-2xl shadow-md border cursor-pointer p-1.5 sm:p-2
        ${active
        ? "bg-gradient-to-tr from-cyan-400 to-fuchsia-500 text-white border-cyan-300 scale-[1.02] shadow-[0_4px_20px_#18e1cd44]"
        : "bg-[#141c2e] text-cyan-100 border-[#273557] hover:border-cyan-300/60"
        }
      `}
      onClick={onClick}
      type="button"
    >
      <span className="mb-1">{icon}</span>
      <span className={`font-bold text-xs sm:text-base mb-0.5 truncate ${active ? "text-white" : ""}`}>{label}</span>
      <span className="text-[9px] sm:text-xs opacity-80 text-center truncate w-full px-0.5">{sub}</span>
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
    <div className="bg-gradient-to-br from-[#091526] via-[#0f172a] to-[#141b2d] min-h-screen w-full text-white overflow-x-hidden">
      <Navbar />
      <LandingHero onStart={handleStart} mode={mode} setMode={setMode} />

      <div className="w-full flex flex-col gap-y-6 items-center justify-center py-6 sm:py-10 px-4">
        <div className="max-w-5xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          <div className="bg-gradient-to-br from-[#131f33] to-[#162238] rounded-2xl shadow-xl p-5 sm:p-7 border border-[#253657]/60 flex items-center justify-center">
            <HowItWorks />
          </div>
          <div className="bg-gradient-to-br from-[#161a33] to-[#141836] rounded-2xl shadow-xl p-5 sm:p-7 border border-[#253657]/60 flex items-center justify-center">
            <SafetySection />
          </div>
        </div>
      </div>

      <section className="max-w-xl mx-auto rounded-2xl bg-[#111c2e]/80 border border-[#233351]/50 p-5 sm:p-7 text-center shadow-lg mb-10 mx-4 sm:mx-auto">
        <h2 className="text-base sm:text-lg font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">About Strangerly</h2>
        <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
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