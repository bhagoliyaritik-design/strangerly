"use client";
import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Send } from "lucide-react";

const SERVER_URL = "https://strangerly-server.onrender.com";

type MessageObj = {
  sender: "me" | "partner" | "system";
  text: string;
};

export default function ChatWindow({ onLeave }: { onLeave: () => void }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<"idle" | "connecting" | "waiting" | "chatting" | "partner_left">("idle");
  const [messages, setMessages] = useState<MessageObj[]>([]);
  const [input, setInput] = useState("");
  const [roomId, setRoomId] = useState<string | null>(null);

  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight });
  }, [messages]);

  useEffect(() => {
    const s = io(SERVER_URL, { autoConnect: false });
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  const fullReset = () => {
    setStatus("idle");
    setMessages([]);
    setInput("");
    setRoomId(null);
  };

  const startChat = () => {
    if (!socket) return;

    setStatus("connecting");
    setMessages([]);
    setInput("");
    setRoomId(null);

    socket.off("waiting");
    socket.off("partner_found");
    socket.off("chat_message");
    socket.off("partner_left");
    socket.off("connect");
    socket.off("disconnect");

    socket.connect();

    socket.on("connect", () => {
      setStatus("connecting");
      socket.emit("find_partner");
    });

    socket.on("waiting", () => {
      setStatus("waiting");
    });

    socket.on("partner_found", (data: { roomId: string, partnerId: string }) => {
      setStatus("chatting");
      setRoomId(data.roomId);
      setMessages([
        { sender: "system", text: "You're now chatting with a stranger 👋 — say hi 👋" }
      ]);
    });

    socket.on("chat_message", ({ message }) => {
      setMessages(m => [...m, { sender: "partner", text: message }]);
    });

    socket.on("partner_left", () => {
      setStatus("partner_left");
      setMessages(m => [...m, { sender: "system", text: "Stranger left the chat." }]);
    });

    socket.on("disconnect", () => {
      setStatus("idle");
      setMessages([{ sender: "system", text: "Chat disconnected." }]);
      setRoomId(null);
    });
  };

  const sendMessage = () => {
    if (input.trim() === "" || !roomId || !socket) return;
    socket.emit("chat_message", { roomId, message: input });
    setMessages(m => [...m, { sender: "me", text: input }]);
    setInput("");
  };

  const skipStranger = () => {
    if (roomId && socket) {
      socket.emit("leave_chat", { roomId });
      socket.disconnect();
    }
    setTimeout(() => {
      fullReset();
      setTimeout(() => {
        startChat();
      }, 300);
    }, 100);
  };

  const handleClose = () => {
    if (roomId && socket) {
      socket.emit("leave_chat", { roomId });
      socket.disconnect();
    }
    fullReset();
    if (typeof onLeave === "function") onLeave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10151e]/92 backdrop-blur">
      <div className="w-full max-w-2xl rounded-2xl bg-[#181d29] mx-auto p-0 flex flex-col min-h-[600px] shadow-[0_0_80px_#00e6d955] border border-[#283449] relative"
        style={{ boxShadow: "0 6px 48px 0 #0c2e3eAA" }}>
        
        {/* Top info is optional, can keep like before */}
        <div className="rounded-t-2xl">
          <div className="p-2 px-7 bg-[#26333f] text-xs flex items-center rounded-t-2xl gap-2 font-semibold text-blue-100 border-b border-[#24455a]/60">
            <span className="text-[#d5e7f3] tracking-wide flex items-center gap-2">
              <span className="pr-1">🌐</span>Female only <span className="font-bold text-yellow-400 uppercase text-xs">Premium</span>
            </span>
          </div>
          {(status === "chatting" || status === "partner_left") && (
            <div className="w-full px-7 py-2 bg-cyan-950/70 border-b border-[#2c5a6d]/80 text-teal-200 text-sm font-bold tracking-wide shadow-[0_2px_14px_#2186a822]">
              {messages[0]?.text || "You're now chatting with a stranger!"}
            </div>
          )}
        </div>

        {/* -- Chat messages area -- */}
        <div className="flex-1 flex flex-col bg-transparent w-full py-3 overflow-hidden">
          {(status === "idle" || status === "connecting" || status === "waiting") && (
            <div className="flex-1 flex flex-col justify-center items-center px-8">
              {status === "idle" && (
                <>
                  <div className="text-lg text-cyan-200 mb-3 mt-12 font-medium text-center">
                    Welcome! <br />
                    <span className="font-bold text-cyan-300">Strangerly's</span> anonymous text chat.
                  </div>
                  <button
                    className="bg-gradient-to-tr from-cyan-400 to-fuchsia-500 hover:from-blue-400 hover:to-pink-400 shadow-xl text-lg px-12 py-3 rounded-xl font-bold text-white tracking-tight mt-1"
                    onClick={startChat}>
                    Start Chat
                  </button>
                  <button className="text-xs mt-7 opacity-60 underline" onClick={handleClose}>
                    Back to Homepage
                  </button>
                </>
              )}
              {(status === "connecting" || status === "waiting") && (
                <>
                  <div className="w-10 h-10 rounded-full animate-pulse bg-gradient-to-tr from-cyan-400 to-indigo-700 mb-4"></div>
                  <div className="text-cyan-100 text-lg font-semibold">
                    {status === "connecting" ? "Connecting..." : "Looking for another stranger..."}
                  </div>
                  <button className="mt-8 bg-gray-800 px-8 py-2 rounded-xl text-slate-200 font-semibold shadow hover:bg-red-500/80 transition" onClick={handleClose}>
                    Cancel
                  </button>
                </>
              )}
            </div>
          )}

          {(status === "chatting" || status === "partner_left") && (
            <>
              {/* Messages */}
              <div ref={chatRef} className="flex-1 overflow-y-auto w-full px-2 py-4 flex flex-col gap-2 min-h-[240px] max-h-[380px]">
                {messages.slice(1).length === 0 && (
                  <div className="text-center text-slate-400 italic py-5">Connected! Say hi.</div>
                )}
                {messages.slice(1).map((msg, i) => (
                  <div
                    key={i}
                    className={
                      msg.sender === "me"
                        ? "flex w-full justify-end"
                        : msg.sender === "partner"
                          ? "flex w-full justify-start"
                          : "flex w-full justify-center"
                    }>
                    <div
                      className={
                        msg.sender === "me"
                          ? "bg-cyan-400/90 text-gray-900 px-5 py-2 rounded-2xl rounded-tr-md shadow-lg max-w-xs break-words font-medium"
                          : msg.sender === "partner"
                            ? "bg-[#212a34]/90 text-cyan-100 px-5 py-2 rounded-2xl rounded-tl-md shadow max-w-xs break-words font-medium"
                            : "text-xs text-cyan-300 bg-transparent font-semibold mt-3 text-center w-full"
                      }>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              {/* ---- Bottom input fixed+responsive ---- */}
              <div className="fixed bottom-0 left-0 w-full z-40 bg-gradient-to-t from-[#1b2432]/80 to-[#191d2d]/60 px-2 py-2 md:relative md:bg-transparent md:p-0">
                <div className="flex w-full gap-2 items-end">
                  <button
                    className="bg-green-400 hover:bg-green-500 transition font-bold text-[#153233] px-4 py-2 rounded-xl shadow-lg active:scale-95 text-base flex-1"
                    onClick={skipStranger}
                    style={{ minWidth: 85 }}
                  >
                    Skip
                    <span className="text-xs block font-normal mt-1 opacity-60">(Esc)</span>
                  </button>
                  <button
                    className="bg-neutral-950 hover:bg-red-600/80 transition text-white px-4 py-2 rounded-xl shadow-lg font-bold text-base flex-1 border-2 border-[#242a3a]/70"
                    onClick={handleClose}
                    style={{ minWidth: 80 }}
                  >
                    Leave
                    <span className="text-xs block opacity-40 font-normal mt-1">end chat</span>
                  </button>
                  <form
                    className="flex flex-1 gap-2 items-end"
                    onSubmit={e => { e.preventDefault(); sendMessage(); }}>
                    <input
                      type="text"
                      className="flex-1 px-4 py-2 rounded-xl bg-[#132130]/80 text-cyan-200 border border-[#2ea5b8]/10 focus:outline-none font-semibold placeholder:text-slate-400 shadow"
                      value={input}
                      autoFocus
                      onChange={e => setInput(e.target.value)}
                      placeholder="Type a message..."
                      disabled={status !== "chatting"}
                      maxLength={1000}
                    />
                    <button
                      type="submit"
                      className="bg-cyan-400/90 hover:bg-cyan-300 transition rounded-xl w-12 h-12 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ml-1 shadow-lg"
                      disabled={input.trim() === "" || status !== "chatting"}>
                      <Send size={25} className="mx-auto text-[#181d29]" />
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}