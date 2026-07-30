"use client";
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VideoChatWindow from "@/components/VideoChatWindow"; // <-- yahi naam

export default function VideoPage() {
  return (
    <div className="bg-gradient-to-br from-[#101622] via-[#171d28] to-[#1d2028] min-h-screen flex flex-col">
      <Navbar />
      <main className="flex flex-1 items-center justify-center py-6">
        <VideoChatWindow />
      </main>
      <Footer />
    </div>
  );
}