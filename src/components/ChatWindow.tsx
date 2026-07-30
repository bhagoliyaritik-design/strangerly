"use client";
import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Send, Lock, Crown, X } from "lucide-react";

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
  const [showPaywall, setShowPaywall] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"1h" | "3h" | "1d">("3h");

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

  // --- RAZORPAY PAYMENT FUNCTION ---
  const handleRazorpayPayment = () => {
    const plansData = {
      "1h": { amount: 199 * 100, name: "1 Hour Premium Pass" },
      "3h": { amount: 299 * 100, name: "3 Hours Premium Pass" },
      "1d": { amount: 399 * 100, name: "1 Day Premium Pass" }
    };

    const currentPlan = plansData[selectedPlan];

    const options = {
      key: "rzp_test_TJk6JTmSVnNpPj",
      amount: currentPlan.amount,
      currency: "INR",
      name: "Strangerly",
      description: currentPlan.name,
      handler: function (response: any) {
        alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);
        setShowPaywall(false);
      },
      prefill: {
        name: "Strangerly User",
        email: "user@strangerly.app",
      },
      theme: {
        color: "#00f0ff",
      },
    };

    if (typeof window !== "undefined" && (window as any).Razorpay) {
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } else {
      alert("Razorpay SDK script is missing in layout. Ensure checkout.js is included.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#091526]/95 backdrop-blur-md p-2 sm:p-4">
      <div className="w-full max-w-2xl rounded-2xl sm:rounded-3xl bg-[#131c2e] mx-auto p-0 flex flex-col h-[90vh] sm:h-[620px] shadow-2xl border border-[#233351] relative overflow-hidden">
        
        {/* Top Header */}
        <div className="rounded-t-2xl sm:rounded-t-3xl flex-shrink-0">
          <div className="p-2 sm:px-6 bg-[#1a263b] text-xs flex items-center justify-between rounded-t-2xl sm:rounded-t-3xl gap-2 font-semibold text-blue-100 border-b border-[#283959]">
            <button 
              onClick={() => setShowPaywall(true)}
              className="flex items-center gap-1.5 bg-[#141d2e] hover:bg-[#1f2d45] border border-[#2d4368] px-3 py-1 rounded-full cursor-pointer transition shadow"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-slate-200">Female only</span>
              <span className="text-amber-400 font-bold">Premium</span>
              <Lock size={12} className="text-amber-400 ml-0.5" />
            </button>

            <button onClick={handleClose} className="text-slate-400 hover:text-white text-sm px-2 py-0.5 cursor-pointer">✕</button>
          </div>

          {(status === "chatting" || status === "partner_left") && (
            <div className="w-full px-4 sm:px-6 py-2 bg-cyan-950/80 border-b border-[#23435c] text-teal-200 text-xs sm:text-sm font-bold tracking-wide">
              {messages[0]?.text || "You're now chatting with a stranger!"}
            </div>
          )}
        </div>

        {/* Chat / Content Area */}
        <div className="flex-1 flex flex-col bg-transparent w-full overflow-hidden relative">
          {(status === "idle" || status === "connecting" || status === "waiting") && (
            <div className="flex-1 flex flex-col justify-center items-center px-6 text-center">
              {status === "idle" && (
                <>
                  <div className="text-base sm:text-lg text-cyan-200 mb-3 font-medium">
                    Welcome! <br />
                    <span className="font-bold text-cyan-300">Strangerly's</span> anonymous text chat.
                  </div>
                  <button
                    className="bg-gradient-to-tr from-cyan-400 to-fuchsia-500 hover:from-blue-400 hover:to-pink-400 shadow-xl text-base sm:text-lg px-10 py-3 rounded-xl font-bold text-white tracking-tight mt-2 cursor-pointer"
                    onClick={startChat}>
                    Start Chat
                  </button>
                  <button className="text-xs mt-6 text-slate-400 underline cursor-pointer" onClick={handleClose}>
                    Back to Homepage
                  </button>
                </>
              )}
              {(status === "connecting" || status === "waiting") && (
                <>
                  <div className="w-10 h-10 rounded-full animate-pulse bg-gradient-to-tr from-cyan-400 to-indigo-700 mb-4"></div>
                  <div className="text-cyan-100 text-base sm:text-lg font-semibold">
                    {status === "connecting" ? "Connecting..." : "Looking for another stranger..."}
                  </div>
                  <button className="mt-6 bg-slate-800 px-6 py-2 rounded-xl text-slate-200 font-semibold shadow hover:bg-red-500/80 transition cursor-pointer" onClick={handleClose}>
                    Cancel
                  </button>
                </>
              )}
            </div>
          )}

          {(status === "chatting" || status === "partner_left") && (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div ref={chatRef} className="flex-1 overflow-y-auto w-full px-3 py-3 flex flex-col gap-2">
                {messages.slice(1).length === 0 && (
                  <div className="text-center text-slate-400 italic py-4 text-sm">Connected! Say hi.</div>
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
                          ? "bg-cyan-400 text-slate-950 px-4 py-2 rounded-2xl rounded-tr-md shadow max-w-[80%] break-words font-medium text-sm"
                          : msg.sender === "partner"
                            ? "bg-[#1c293d] text-cyan-100 px-4 py-2 rounded-2xl rounded-tl-md shadow max-w-[80%] break-words font-medium text-sm border border-[#2b3e5d]"
                            : "text-xs text-cyan-300 bg-transparent font-semibold my-1 text-center w-full"
                      }>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Actions & Input */}
              <div className="flex-shrink-0 bg-[#0e1624] border-t border-[#233351] p-2.5 sm:p-3 flex flex-col gap-2">
                <div className="flex w-full gap-2">
                  <button
                    className="flex-1 bg-green-500 hover:bg-green-600 transition font-bold text-slate-950 py-2.5 px-3 rounded-xl shadow active:scale-95 text-xs sm:text-sm flex items-center justify-center gap-1 cursor-pointer"
                    onClick={skipStranger}
                  >
                    Skip <span className="text-[10px] opacity-70 hidden sm:inline">(Esc)</span>
                  </button>
                  <button
                    className="flex-1 bg-slate-900 hover:bg-red-600/80 transition text-white py-2.5 px-3 rounded-xl shadow font-bold text-xs sm:text-sm border border-slate-700 flex items-center justify-center gap-1 cursor-pointer"
                    onClick={handleClose}
                  >
                    Leave <span className="text-[10px] opacity-60 hidden sm:inline">chat</span>
                  </button>
                </div>

                <form
                  className="flex w-full gap-2 items-center"
                  onSubmit={e => { e.preventDefault(); sendMessage(); }}>
                  <input
                    type="text"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#172338] text-cyan-100 border border-[#2a3c5c] focus:outline-none text-sm placeholder:text-slate-400 shadow"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Type a message..."
                    disabled={status !== "chatting"}
                    maxLength={1000}
                  />
                  <button
                    type="submit"
                    className="bg-cyan-400 hover:bg-cyan-300 transition rounded-xl w-11 h-11 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow cursor-pointer flex-shrink-0"
                    disabled={input.trim() === "" || status !== "chatting"}>
                    <Send size={20} className="text-[#131c2e]" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* --- PREMIUM PAYWALL MODAL --- */}
        {showPaywall && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-[#162032] border border-[#2a3b5c] rounded-3xl p-6 shadow-2xl relative flex flex-col items-center text-center">
              
              <button 
                onClick={() => setShowPaywall(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white bg-[#1e2c44] p-1.5 rounded-full cursor-pointer transition"
              >
                <X size={18} />
              </button>

              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20 mb-4 mt-2">
                <Crown size={30} className="text-slate-950" />
              </div>

              <h3 className="text-xl font-bold text-white mb-1">Unlock female-only matches</h3>
              <p className="text-xs text-slate-300 mb-5 px-2">
                Premium lets you filter who you match with. One-time pass, no auto-renewal.
              </p>

              <div className="flex flex-wrap gap-1.5 justify-center mb-6 text-[11px] font-medium text-slate-300">
                <span className="bg-[#1e2c44] border border-[#2d4368] px-2.5 py-1 rounded-lg">♀️ Gender</span>
                <span className="bg-[#1e2c44] border border-[#2d4368] px-2.5 py-1 rounded-lg">🌐 Region</span>
                <span className="bg-[#1e2c44] border border-[#2d4368] px-2.5 py-1 rounded-lg">⚡ Priority</span>
                <span className="bg-[#1e2c44] border border-[#2d4368] px-2.5 py-1 rounded-lg">🚫 No ads</span>
              </div>

              <div className="grid grid-cols-3 gap-2 w-full mb-6">
                <div 
                  onClick={() => setSelectedPlan("1h")}
                  className={`cursor-pointer rounded-2xl p-3 border transition flex flex-col items-center justify-center ${selectedPlan === "1h" ? "bg-[#182d3b] border-cyan-400 shadow-md shadow-cyan-500/20" : "bg-[#121926] border-[#22324a] hover:border-slate-500"}`}
                >
                  <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">1 Hour</span>
                  <span className="text-base sm:text-lg font-extrabold text-white mb-0.5">₹199</span>
                  <span className="text-[9px] text-slate-400">₹199/day</span>
                </div>

                <div 
                  onClick={() => setSelectedPlan("3h")}
                  className={`cursor-pointer rounded-2xl p-3 border transition flex flex-col items-center justify-center relative ${selectedPlan === "3h" ? "bg-[#14333b] border-cyan-400 shadow-md shadow-cyan-500/20" : "bg-[#121926] border-[#22324a] hover:border-slate-500"}`}
                >
                  <span className="absolute -top-2.5 bg-cyan-400 text-slate-950 font-extrabold text-[8px] px-2 py-0.5 rounded-full tracking-wider shadow">BEST VALUE</span>
                  <span className="text-[10px] uppercase font-bold text-cyan-200 mb-1 mt-1">3 Hours</span>
                  <span className="text-base sm:text-lg font-extrabold text-white mb-0.5">₹299</span>
                  <span className="text-[9px] text-cyan-300/70">₹299/day</span>
                </div>

                <div 
                  onClick={() => setSelectedPlan("1d")}
                  className={`cursor-pointer rounded-2xl p-3 border transition flex flex-col items-center justify-center ${selectedPlan === "1d" ? "bg-[#182d3b] border-cyan-400 shadow-md shadow-cyan-500/20" : "bg-[#121926] border-[#22324a] hover:border-slate-500"}`}
                >
                  <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">1 Day</span>
                  <span className="text-base sm:text-lg font-extrabold text-white mb-0.5">₹399</span>
                  <span className="text-[9px] text-slate-400">₹399/day</span>
                </div>
              </div>

              <button 
                onClick={handleRazorpayPayment}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-fuchsia-500 hover:from-blue-500 hover:to-pink-500 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg cursor-pointer transition active:scale-95 mb-4"
              >
                Proceed to Pay ({selectedPlan === "1h" ? "₹199" : selectedPlan === "3h" ? "₹299" : "₹399"})
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <span className="text-amber-400">🔒</span> Secured by Razorpay &bull; <span className="underline cursor-pointer hover:text-white">Restore purchase</span>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}