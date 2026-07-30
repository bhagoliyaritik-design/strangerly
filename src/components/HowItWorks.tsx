"use client";
import React from "react";
import { MousePointerClick, RefreshCw, MessageCircle } from 'lucide-react';

const steps = [
  {
    icon: <MousePointerClick size={30} />,
    label: "Choose your chat mode",
    desc: "Select if you want to text, voice, or video chat.",
  },
  {
    icon: <RefreshCw size={30} />,
    label: "Get matched instantly",
    desc: "We connect you with a random person online.",
  },
  {
    icon: <MessageCircle size={30} />,
    label: "Start talking",
    desc: "Say hello, make friends, or just have a quick conversation.",
  },
];

export default function HowItWorks() {
  return (
    <section className="section" id="how">
      <h2 className="text-2xl font-bold gradient-glow-text text-center mb-10">How It Works</h2>
      <div className="flex flex-col md:flex-row gap-8 md:gap-6 justify-center items-center">
        {steps.map((s, i) => (
          <div key={i} className="glass-card flex-1 flex flex-col items-center gap-4 px-8 py-8 text-center shadow-lg hover:shadow-glow transition-all">
            <div className="mb-3 text-cyan">{s.icon}</div>
            <h3 className="font-semibold text-md">{s.label}</h3>
            <p className="text-slate-400 text-sm">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}