"use client";
import React, { useRef, useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import Peer from "simple-peer";
import { PhoneOff, SkipForward } from "lucide-react";

const SERVER_URL = "https://strangerly-server.onrender.com";

export default function VideoChatWindow() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<"connecting" | "waiting" | "calling" | "in-call" | "partner_left">("connecting");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [isInitiator, setIsInitiator] = useState<boolean>(false);
  const [error, setError] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const myVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer.Instance | null>(null);

  useEffect(() => {
    const s = io(SERVER_URL);
    setSocket(s);

    s.on("connect", () => {
      setStatus("connecting");
      s.emit("find_partner");
    });

    s.on("waiting", () => setStatus("waiting"));

    s.on("partner_found", ({ roomId, partnerId, initiator }) => {
      setStatus("calling");
      setRoomId(roomId);
      setPartnerId(partnerId);
      setIsInitiator(initiator);
      setTimeout(() => setupCall(initiator, partnerId, s), 300);
    });

    s.on("partner_left", () => {
      setStatus("partner_left");
      destroyPeer();
    });

    s.on("voice-signal", ({ from, data }) => {
      if (peerRef.current) {
        peerRef.current.signal(data);
      }
    });

    return () => {
      destroyPeer();
      s.disconnect();
    };
  }, [refresh]);

  async function setupCall(initiatorVal: boolean, currentPartnerId: string, activeSocket: Socket) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (myVideo.current) {
        myVideo.current.srcObject = stream;
        myVideo.current.muted = true;
        myVideo.current.play().catch(() => {});
      }

      peerRef.current = new Peer({
        initiator: initiatorVal,
        trickle: false,
        stream,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:global.stun.twilio.com" }
          ]
        }
      });

      peerRef.current.on("signal", (data: any) => {
        if (currentPartnerId) {
          activeSocket.emit("voice-signal", { to: currentPartnerId, data });
        }
      });

      peerRef.current.on("connect", () => {
        setStatus("in-call");
      });

      peerRef.current.on("stream", (remoteStream: MediaStream) => {
        if (remoteVideo.current) {
          remoteVideo.current.srcObject = remoteStream;
          remoteVideo.current.play().catch(() => {});
        }
        setStatus("in-call");
      });

      peerRef.current.on("close", () => setStatus("partner_left"));
      
      peerRef.current.on("error", (err) => {
        setError("Video connection error: " + err?.message);
        setStatus("partner_left");
      });

    } catch (e: any) {
      setError("Could not access camera/mic: " + (e?.message || ""));
      setStatus("partner_left");
    }
  }

  function destroyPeer() {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
  }

  function endCall() {
    destroyPeer();
    setStatus("partner_left");
    if (socket && roomId) {
      socket.emit("leave_chat", { roomId });
    }
  }

  function skipStranger() {
    endCall();
    setConnecting(true);
    setTimeout(() => {
      setRefresh(v => !v);  
      setConnecting(false);
    }, 400);
  }

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center lg:items-stretch gap-4 p-2 sm:p-4">
      {/* Main Video Box */}
      <div className="w-full flex-1 flex flex-col items-center rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#172040] to-[#181d2f] shadow-2xl p-3 sm:p-5 justify-center">
        
        {/* Videos Container: Mobile par stack honge, Desktop par side-by-side */}
        <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-4 py-2">
          {/* Stranger Video */}
          <div className="w-full sm:flex-1 rounded-2xl overflow-hidden flex flex-col items-center">
            <video ref={remoteVideo} autoPlay playsInline
              className="rounded-2xl w-full max-w-[320px] sm:max-w-sm h-[240px] sm:h-[380px] bg-black object-cover border-2 border-fuchsia-400 shadow-lg"
            />
            <span className="font-bold text-sm sm:text-base mt-1 text-fuchsia-300">Stranger</span>
          </div>

          {/* User Video */}
          <div className="w-full sm:flex-1 rounded-2xl overflow-hidden flex flex-col items-center">
            <video ref={myVideo} autoPlay playsInline
              className="rounded-2xl w-full max-w-[320px] sm:max-w-sm h-[240px] sm:h-[380px] bg-black object-cover border-2 border-cyan-400 shadow-lg"
            />
            <span className="font-bold text-sm sm:text-base mt-1 text-cyan-300">You</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex gap-3 justify-center px-2 mt-4">
          <button
            className="flex-1 bg-green-400 hover:bg-green-500 active:scale-95 text-base sm:text-lg font-bold py-3 sm:py-4 rounded-xl shadow focus:outline-none flex items-center justify-center gap-2 transition-all cursor-pointer text-slate-900"
            onClick={skipStranger}
            disabled={status === "connecting" || status === "waiting" || connecting}
          >
            <SkipForward size={20} /> Skip <span className="hidden sm:inline ml-1 text-xs opacity-70">(Esc)</span>
          </button>
          <button
            className="flex-1 bg-black hover:bg-fuchsia-700/80 active:scale-95 text-white font-bold py-3 sm:py-4 rounded-xl shadow border-2 border-zinc-900 focus:outline-none flex items-center justify-center gap-2 transition-all cursor-pointer"
            onClick={endCall}
          >
            <PhoneOff size={20} /> Stop
          </button>
        </div>

        {error && <div className="mt-3 text-red-400 text-sm sm:text-base text-center font-semibold">{error}</div>}
      </div>

      {/* Sidebar Status Box (Responsive width) */}
      <div className="w-full lg:w-[320px] rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#19293a]/95 to-[#151e27]/95 shadow-2xl py-4 px-4 sm:px-6 border border-[#232a3d]/60">
        <div className="bg-[#192c3d] rounded-xl py-2 px-3 shadow border-b-2 border-cyan-700/20 font-semibold text-xs sm:text-sm text-cyan-200 text-center sm:text-left">
          You're now chatting with a stranger <span className="text-[#31e1bc] ml-1">IN</span> — say hi 👋
        </div>
        <div className="text-center mt-3 text-slate-300 italic text-sm sm:text-base">
          {status === "in-call"
            ? "Connected! Say hi."
            : status === "partner_left"
              ? "Stranger left the call."
              : status === "waiting"
                ? "Finding someone..."
                : "Connecting video…"}
        </div>
      </div>
    </div>
  );
}