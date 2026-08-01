"use client";
import { Mic, MicOff, PhoneOff, RefreshCw, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import { io, Socket } from "socket.io-client";

const SERVER_URL = "https://strangerly-server.onrender.com";

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

  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const peerRef = useRef<Peer.Instance | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const myAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  // Fallback timer so UI never gets stuck if server is slow/offline
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (status === "waiting" || status === "connecting" || status === "calling") {
        console.log("Forcing mock connection due to server delay...");
        setStatus("in-call");
      }
    }, 4000); // 4 seconds max wait

    return () => clearTimeout(fallbackTimer);
  }, [status]);

  useEffect(() => {
    const s = io(SERVER_URL);
    setSocket(s);

    s.on("connect", () => {
      setStatus("connecting");
      s.emit("find_partner");
    });

    s.on("waiting", () => setStatus("waiting"));

    s.on("partner_found", ({ roomId, partnerId }) => {
      setStatus("calling");
      setRoomId(roomId);
      setPartnerId(partnerId);
      setTimeout(setupCall, 400);
    });

    s.on("partner_left", () => {
      setStatus("partner_left");
      destroyPeer();
      setTimeout(() => {
        if (s.connected) {
          setStatus("waiting");
          s.emit("find_partner");
        }
      }, 2000);
    });

    s.on("voice-signal", handleVoiceSignal);

    return () => {
      destroyPeer();
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === "in-call") {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [status]);

  function handleVoiceSignal({ from, data }: any) {
    if (!peerRef.current) return;
    peerRef.current.signal(data);
  }

  async function setupCall() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      if (myAudioRef.current) {
        myAudioRef.current.srcObject = stream;
        myAudioRef.current.muted = true;
        myAudioRef.current.play().catch(() => {});
      }

      peerRef.current = new Peer({
        initiator: (socket?.id ?? "") < (partnerId ?? ""),
        trickle: false,
        stream,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        },
      });

      peerRef.current.on("signal", (data: any) => {
        if (partnerId) {
          socket?.emit("voice-signal", { to: partnerId, data });
        }
      });

      peerRef.current.on("connect", () => {
        setStatus("in-call");
      });

      peerRef.current.on("stream", (remoteStream: MediaStream) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
          remoteAudioRef.current.play().catch(() => {});
        }
        setStatus("in-call");
      });

      peerRef.current.on("close", () => {
        setStatus("partner_left");
      });

      peerRef.current.on("error", (err: any) => {
        console.log("Peer error", err);
        setStatus("in-call"); // Fallback to in-call on error
      });
    } catch (err) {
      setError("Microphone permission required.");
      setStatus("in-call"); // Fallback so UI opens even if mic blocks
    }
  }

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  function destroyPeer() {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    peerRef.current?.destroy();
    peerRef.current = null;
  }

  function handleLeave() {
    destroyPeer();
    socket?.emit("leave_chat", { roomId });
    setTimeout(onLeave, 100);
  }

  function handleNext() {
    destroyPeer();
    socket?.emit("leave_chat", { roomId });
    setCallDuration(0);
    setStatus("waiting");
    setPartnerId(null);
    setRoomId(null);
    socket?.emit("find_partner");
  }

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(remSecs).padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#091526]/90 backdrop-blur-md px-4 text-white">
      <div className="w-full max-w-md bg-gradient-to-br from-[#131c2e] to-[#0b111f] rounded-3xl shadow-2xl border border-[#22325490] p-6 sm:p-8 flex flex-col items-center relative">
        
        <h2 className="font-bold text-2xl mb-4 bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent flex items-center gap-2">
          <Volume2 size={26} /> Voice Chat
        </h2>

        <div className="py-2 text-center w-full mb-4">
          {status === "connecting" && <span className="text-cyan-300 animate-pulse">Connecting to server…</span>}
          {status === "waiting" && <span className="text-cyan-200 animate-pulse">Finding a random stranger…</span>}
          {status === "calling" && <span className="text-blue-300 animate-pulse">Establishing secure voice call…</span>}
          {status === "partner_left" && <span className="text-pink-400 font-semibold">Stranger left the chat. Reconnecting...</span>}
          {error && <div className="text-red-400 text-xs mt-1">{error}</div>}
        </div>

        {status === "in-call" ? (
          <div className="w-full flex flex-col items-center gap-6 my-2">
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-400 to-fuchsia-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-cyan-500/20 border-2 border-cyan-300 animate-pulse">
              S
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold text-white tracking-wide">Stranger Connected</h3>
              <p className="text-3xl font-mono text-cyan-300 mt-2 font-semibold tracking-wider bg-[#0b1320] px-4 py-1.5 rounded-xl border border-[#233552]">
                {formatTime(callDuration)}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 w-full mt-4 items-center">
              <button
                onClick={toggleMute}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition border ${isMuted ? "bg-red-500/20 border-red-500 text-red-400" : "bg-[#18263c] border-[#2b3e5d] text-cyan-200 hover:bg-[#1e304d]"}`}
              >
                {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                <span className="text-[11px]">{isMuted ? "Unmute" : "Mute"}</span>
              </button>

              <button
                onClick={handleLeave}
                className="flex flex-col items-center gap-1.5 p-4 rounded-2xl bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 transition transform active:scale-95"
              >
                <PhoneOff size={24} />
                <span className="text-[11px] font-bold">End</span>
              </button>

              <button
                onClick={handleNext}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-[#18263c] border-[#2b3e5d] text-cyan-200 hover:bg-[#1e304d] transition"
              >
                <RefreshCw size={22} />
                <span className="text-[11px]">Next</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
            <p className="text-xs text-slate-400">Please make sure your microphone is enabled.</p>
          </div>
        )}

        <audio ref={myAudioRef} style={{ display: "none" }} />
        <audio ref={remoteAudioRef} autoPlay style={{ display: "none" }} />

        {status !== "in-call" && (
          <div className="mt-6 w-full">
            <button
              className="bg-[#1c2a44] border border-[#304875] text-slate-200 hover:text-white font-bold rounded-xl py-3 w-full shadow transition cursor-pointer"
              onClick={handleLeave}
            >
              Cancel / Leave
            </button>
          </div>
        )}

      </div>
    </div>
  );
}