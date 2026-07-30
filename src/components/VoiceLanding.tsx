"use client";
import React, { useState } from "react";
import { Mic, User2, Lock, Link2 } from "lucide-react";

export default function VoiceLanding({ onStart }: { onStart: () => void }) {
  const [pref, setPref] = useState("any");

  return (
    <section className="flex items-center justify-center min-h-[85vh] bg-gradient-to-br from-[#101622] via-[#171d28] to-[#1d2028]">
      <div className="w-full max-w-md rounded-3xl bg-gradient-to-br from-[#171c27]/95 to-[#181f2a]/90 shadow-2xl border border-[#253345]/60 p-0 flex flex-col items-center mx-auto relative">
        {/* Avatars */}
        <div className="flex justify-center gap-[-10px] mt-7 mb-3">
          {[1,2,3,4].map(i => (
            <span key={i} className="inline-flex w-10 h-10 rounded-full -ml-2 bg-gradient-to-br from-orange-300 to-amber-200 border-2 border-[#101622] items-center justify-center text-xl">
              🤗
            </span>
          ))}
        </div>

        {/* Online */}
        <div className="text-center">
          <div className="flex items-center gap-2 justify-center mb-1">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-green-200 font-bold text-sm">7,050k online</span>
          </div>
          <div className="font-bold text-xl text-white mb-1">1‑to‑1 voice</div>
          <div className="text-sm text-slate-400 font-normal -mt-1">Private call · instant match <span className="inline-block ml-1 h-2 w-2 rounded-full bg-indigo-300" /></div>
        </div>

        {/* Preference */}
        <div className="mt-5 w-full px-7 flex justify-center gap-3 mb-1">
          <button
            className={`px-4 py-2 rounded-full font-bold text-sm bg-gradient-to-r from-[#29254d] to-[#19242a] shadow ${pref === "any" ? "border-2 border-cyan-300 text-cyan-200 scale-105" : "text-slate-200 opacity-80"} transition`}
            onClick={() => setPref("any")}
          >✨ Any</button>
          <button
            disabled
            className="px-4 py-2 rounded-full font-bold text-sm bg-neutral-900 shadow text-yellow-200 opacity-60 flex items-center gap-1 cursor-not-allowed"
            title="premium"
          >
            <Lock size={13} /> Male
          </button>
          <button
            disabled
            className="px-4 py-2 rounded-full font-bold text-sm bg-neutral-900 shadow text-fuchsia-200 opacity-60 flex items-center gap-1 cursor-not-allowed"
            title="premium"
          >
            <Lock size={13} /> Female
          </button>
        </div>
        <div className="w-full px-7">
          <button
            className="mt-5 w-full bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-blue-400 hover:to-cyan-400 text-white font-bold rounded-xl py-4 text-lg shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95"
            onClick={onStart}
          >
            <Mic size={20} className="mr-1" />
            Start 1-to-1 call
          </button>
        </div>
        <button
          className="w-[90%] mx-auto mt-3 flex items-center gap-2 bg-[#11182c]/70 border border-[#262d49]/50 rounded-2xl px-5 py-3 text-slate-200 font-semibold text-sm justify-center hover:bg-[#212c47]/80 transition mb-6"
          disabled
        >
          <Link2 size={17} className="mr-2" />
          Invite a friend — <span className="ml-1 font-normal">get a shareable link</span>
        </button>
        <div className="text-center pb-4 pt-2 text-xs text-slate-500">
          One-to-one voice chat connects you instantly — always anonymous.<br />
        </div>
      </div>
    </section>
  );
}