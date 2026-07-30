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

  // Socket Connection & Listeners
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
    console.log("SETTING UP CALL. Initiator:", initiatorVal);
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
            { urls: "stun:global.stun.twilio.com:3478?transport=udp" }
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
        console.log("REMOTE STREAM RECEIVED");
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
    <div className="max-w-6xl w-full flex flex-col md:flex-row items-stretch min-h-[520px] gap-7">
      <div className="flex-1 flex flex-col items-center rounded-3xl bg-gradient-to-br from-[#172040] to-[#181d2f] shadow-2xl justify-center pb-5">
        <div className="flex w-full h-auto justify-center gap-6 py-6 px-2 md:px-9">
          {/* Stranger Video */}
          <div className="flex-1 rounded-2xl overflow-hidden flex flex-col items-center">
            <video ref={remoteVideo} autoPlay playsInline
              className="rounded-2xl w-full max-w-sm h-[340px] md:h-[420px] bg-black object-cover border-2 border-fuchsia-400 shadow-lg transition-all"
              style={{ aspectRatio: "4/3" }} />
            <span className="font-bold text-md mt-2 text-fuchsia-300">Stranger</span>
          </div>
          {/* User Video */}
          <div className="flex-1 rounded-2xl overflow-hidden flex flex-col items-center">
            <video ref={myVideo} autoPlay playsInline
              className="rounded-2xl w-full max-w-sm h-[340px] md:h-[420px] bg-black object-cover border-2 border-cyan-400 shadow-lg transition-all"
              style={{ aspectRatio: "4/3" }} />
            <span className="font-bold text-md mt-2 text-cyan-300">You</span>
          </div>
        </div>
        <div className="flex w-full gap-4 justify-center px-4 mt-8">
          <button
            className="flex-1 bg-green-400 hover:bg-green-500 active:scale-95 text-lg font-bold py-4 rounded-xl shadow focus:outline-none flex items-center justify-center gap-2 transition-all cursor-pointer"
            onClick={skipStranger}
            disabled={status === "connecting" || status === "waiting" || connecting}
          >
            <SkipForward size={22} /> Skip <span className="hidden md:inline ml-2 text-xs opacity-60">(Esc)</span>
          </button>
          <button
            className="flex-1 bg-black hover:bg-fuchsia-700/80 active:scale-95 text-white font-bold py-4 rounded-xl shadow border-2 border-zinc-900 focus:outline-none flex items-center justify-center gap-2 transition-all cursor-pointer"
            onClick={endCall}
          >
            <PhoneOff size={22} /> Stop
          </button>
        </div>
        {error && <div className="mt-4 text-red-400 text-base text-center font-semibold">{error}</div>}
      </div>
      <div className="md:block hidden w-[340px] rounded-3xl bg-gradient-to-br from-[#19293a]/95 to-[#151e27]/95 shadow-2xl pt-5 pb-8 px-6 border border-[#232a3d]/60">
        <div className="mb-3 bg-[#192c3d] rounded-xl py-2 px-3 shadow border-b-2 border-cyan-700/20 font-semibold text-sm text-cyan-200">
          You're now chatting with a stranger <span className="text-[#31e1bc] ml-1">IN</span> — say hi 👋
        </div>
        <div className="text-center mt-4 text-slate-300 italic">
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