"use client";
import React, { useState } from "react";
import VoiceLanding from "@/components/VoiceLanding";
import VoiceChatWindow from "@/components/VoiceChatWindow";

export default function VoicePage() {
  const [showVoice, setShowVoice] = useState(false);

  return (
    <>
      {/* Always land on main card */}
      <VoiceLanding onStart={() => setShowVoice(true)} />

      {/* Jab showVoice true ho, tab VoiceChatWindow dikhao */}
      {showVoice && (
        <VoiceChatWindow onLeave={() => setShowVoice(false)} />
      )}
    </>
  );
}