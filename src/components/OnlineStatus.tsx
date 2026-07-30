"use client";
import React from "react";

export default function OnlineStatus() {
  return (
    <div className="flex items-center gap-3 mt-6 justify-center">
      <span className="block w-3 h-3 rounded-full bg-green-400 animate-pulse shadow-lg mr-1"></span>
      <span className="text-green-300 font-bold text-lg">12,847</span>
      <span className="text-slate-400">people online now</span>
    </div>
  );
}