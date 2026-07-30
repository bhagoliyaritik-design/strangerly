"use client";
import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import Peer from "simple-peer";

const SERVER_URL = "https://strangerly-server.onrender.com"; // Use your backend URL if on web!

// Simple random match — identical as ChatWindow logic!
function randomRoomId(a: string, b: string) {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

export default function VoiceChatWindow({
  onLeave,
}: {
  onLeave: () => void;
}) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<
    "connecting" | "waiting" | "calling" | "in-call" | "partner_left"
  >("connecting");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  // WebRTC
  const peerRef = useRef<Peer.Instance | null>(null);

  // Audio refs
  const myAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const s = io(SERVER_URL);

    setSocket(s);

    // Find a stranger!
    s.on("connect", () => {
      setStatus("connecting");
      s.emit("find_partner");
    });

    s.on("waiting", () => setStatus("waiting"));

    s.on("partner_found", ({ roomId, partnerId }) => {
      setStatus("calling");
      setRoomId(roomId);
      setPartnerId(partnerId);

      // Delay to give browser time to allow audio/mic UI
      setTimeout(setupCall, 400);
    });

    s.on("partner_left", () => {
      setStatus("partner_left");
      destroyPeer();
    });

    // WebRTC: relay signaling
    s.on("voice-signal", handleVoiceSignal);

    return () => {
      destroyPeer();
      s.disconnect();
    };

    // eslint-disable-next-line
  }, []);

  function handleVoiceSignal({ from, data }: any) {
    if (!peerRef.current) {
      // Only one peer can be alive at a time
      return;
    }
    peerRef.current.signal(data);
  }

  // Setup PeerJS call
  async function setupCall() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio: true});
      // Show own audio muted, just in case (for debug, not required)
      if (myAudioRef.current) {
        myAudioRef.current.srcObject = stream;
        myAudioRef.current.muted = true; // To prevent echo on local
        myAudioRef.current.play().catch(()=>{});
      }

 
       peerRef.current = new Peer({
  initiator: (socket?.id ?? "") < (partnerId ?? ""),
  trickle: false,
  stream,
      });

      peerRef.current.on("signal", (data: any) => {
        // Send signaling data to partner
        if (partnerId) {
          socket?.emit("voice-signal", { to: partnerId, data });
        }
      });

      peerRef.current.on("connect", () => {
        setStatus("in-call");
      });

      peerRef.current.on("stream", (remoteStream: MediaStream) => {
        // Attach the remote audio to second <audio>
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
          remoteAudioRef.current.play().catch(()=>{});
        }
        setStatus("in-call");
      });

      peerRef.current.on("close", () => {
        setStatus("partner_left");
      });

      peerRef.current.on("error", (err: any) => {
        console.log("Peer error", err);
        setError("Voice chat connection error.");
        setStatus("partner_left");
      });
    } catch (err) {
      setError("Could not access mic. Please allow mic permission.");
      setStatus("partner_left");
    }
  }

  function destroyPeer() {
    peerRef.current?.destroy();
    peerRef.current = null;
  }

  function handleLeave() {
    destroyPeer();
    socket?.emit("leave_chat", { roomId });
    setTimeout(onLeave, 100);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#181f2d]/90 backdrop-blur">
      <div className="w-full max-w-sm min-h-[370px] bg-gradient-to-br from-[#161f2c]/90 via-[#142036]/80 to-[#16172b]/80 rounded-2xl shadow-2xl border border-[#2b426a] p-7 flex flex-col items-center relative">
        <h2 className="font-bold text-2xl mb-2 bg-gradient-to-r from-cyan-300 to-fuchsia-400 bg-clip-text text-transparent">Voice Chat</h2>
        <div className="py-4 text-center">
          {status === "connecting" && <span className="text-cyan-300">Connecting…</span>}
          {status === "waiting" && <span className="text-cyan-200">Finding a random stranger…</span>}
          {status === "calling" && <span className="text-blue-200">Connecting call…</span>}
          {status === "in-call" && <span className="text-green-200 font-bold">Connected! Talk with your partner ✨</span>}
          {status === "partner_left" && <span className="text-pink-400 font-semibold">Stranger left the chat</span>}
          {error && (<div className="text-red-400 text-xs">{error}</div>)}
        </div>
        {/* Audio players */}
        <audio ref={myAudioRef} style={{ display: "none" }} />
        <audio ref={remoteAudioRef} autoPlay controls className="mt-2 rounded bg-zinc-700 w-full" />
        {/* Controls */}
        <div className="mt-8 flex w-full flex-col gap-3">
          <button
            className="bg-pink-300 text-zinc-900 font-bold rounded-lg py-3 w-full shadow hover:bg-pink-400 transition"
            onClick={handleLeave}
          >
            End Chat
          </button>
        </div>
      </div>
    </div>
  );
}