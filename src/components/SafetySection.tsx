"use client";
import React from "react";
import { ShieldCheck, UserX, Info } from "lucide-react";

const safetyPoints = [
  { icon: <ShieldCheck className="text-cyan" size={21} />, text: "Respect other users" },
  { icon: <Info className="text-blue" size={21} />, text: "Never share personal information" },
  { icon: <UserX className="text-purple" size={21} />, text: "Use report and block tools when necessary" },
  { icon: <ShieldCheck className="text-cyan" size={21} />, text: "Read and follow our Community Guidelines" },
];

export default function SafetySection() {
  return (
    <section className="section" id="safety">
      <h2 className="text-2xl font-bold gradient-glow-text text-center mb-8">Safety First</h2>
      <div className="glass-card max-w-xl mx-auto p-7">
        <ul className="flex flex-col gap-5">
          {safetyPoints.map((pt, i) => (
            <li key={i} className="flex items-center gap-4 text-slate-100 text-lg">
              {pt.icon}
              <span>{pt.text}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-center mt-5 text-slate-400 text-sm md:text-md">
        Your safety is our top priority. <span className="gradient-glow-text font-semibold">Please do not share any personal information.</span>
      </p>
    </section>
  );
}