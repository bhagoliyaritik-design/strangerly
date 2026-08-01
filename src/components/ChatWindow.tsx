"use client";
import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Send, Lock, Crown, X, CornerUpLeft, Smile } from "lucide-react";

const SERVER_URL = "https://strangerly-server.onrender.com";

type MessageObj = {
  id: string;
  sender: "me" | "partner" | "system";
  text: string;
  replyTo?: string;
  reactions: { [emoji: string]: number };
};

export default function ChatWindow({ onLeave }: { onLeave: () => void }) {
  const [status, setStatus] = useState<"idle" | "connecting" | "waiting" | "chatting" | "partner_left">("idle");
  const [messages, setMessages] = useState<MessageObj[]>([]);
  const [input, setInput] = useState("");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"1h" | "3h" | "1d">("3h");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [activeEmojiMenu, setActiveEmojiMenu] = useState<string | null>(null);

  const chatRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const EMOJI_LIST = ["❤️", "😂", "😮", "😢", "😡", "👍", "👎", "🔥", "🎉"];

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight });
  }, [messages]);

  useEffect(() => {
    const s = io(SERVER_URL, { autoConnect: false });
    socketRef.current = s;

    s.on("connect", () => {
      console.log("Connected to server");
    });

    s.on("waiting", () => {
      setStatus("waiting");
    });

    s.on("partner_found", (data: { roomId: string, partnerId: string }) => {
      setStatus("chatting");
      setRoomId(data.roomId);
      setMessages([
        { id: "sys-0", sender: "system", text: "You're now chatting with a stranger 👋 — say hi 👋", reactions: {} }
      ]);
      setReplyingTo(null);
      setActiveEmojiMenu(null);
    });

    s.on("chat_message", (data: { id?: string, message: string, replyTo?: string }) => {
      const msgId = data.id || Math.random().toString(36).substr(2, 9);
      setMessages(m => [...m, { id: msgId, sender: "partner", text: data.message, replyTo: data.replyTo, reactions: {} }]);
    });

    s.on("message_reaction", (data: { messageId: string, emoji: string }) => {
      setMessages(m => m.map(msg => {
        if (msg.id === data.messageId) {
          const updatedReactions = { ...msg.reactions };
          updatedReactions[data.emoji] = (updatedReactions[data.emoji] || 0) + 1;
          return { ...msg, reactions: updatedReactions };
        }
        return msg;
      }));
    });

    s.on("partner_left", () => {
      setStatus("partner_left");
      setMessages(m => [...m, { id: Math.random().toString(36), sender: "system", text: "Stranger left the chat.", reactions: {} }]);
      setReplyingTo(null);
      setActiveEmojiMenu(null);
      
      setTimeout(() => {
        if (socketRef.current) {
          setStatus("waiting");
          setRoomId(null);
          setMessages([]);
          socketRef.current.emit("find_partner");
        }
      }, 1500);
    });

    s.on("disconnect", () => {
      setStatus("idle");
      setMessages([{ id: Math.random().toString(36), sender: "system", text: "Chat disconnected.", reactions: {} }]);
      setRoomId(null);
      setReplyingTo(null);
      setActiveEmojiMenu(null);
    });

    return () => {
      s.disconnect();
    };
  }, []);

  const startChat = () => {
    const s = socketRef.current;
    if (!s) return;

    setStatus("waiting");
    setMessages([]);
    setInput("");
    setRoomId(null);
    setReplyingTo(null);
    setActiveEmojiMenu(null);

    if (!s.connected) {
      s.connect();
    }
    s.emit("find_partner");
  };

  const sendMessage = () => {
    if (input.trim() === "" || !roomId || !socketRef.current) return;
    
    const msgId = Math.random().toString(36).substr(2, 9);
    const messageData = { 
      id: msgId,
      roomId, 
      message: input, 
      replyTo: replyingTo 
    };

    socketRef.current.emit("chat_message", messageData);

    setMessages(m => [...m, { id: msgId, sender: "me", text: input, replyTo: replyingTo || undefined, reactions: {} }]);
    setInput("");
    setReplyingTo(null);
  };

  const addReaction = (msgId: string, emoji: string) => {
    setMessages(m => m.map(msg => {
      if (msg.id === msgId) {
        const updatedReactions = { ...msg.reactions };
        updatedReactions[emoji] = (updatedReactions[emoji] || 0) + 1;
        return { ...msg, reactions: updatedReactions };
      }
      return msg;
    }));

    if (socketRef.current && roomId) {
      socketRef.current.emit("message_reaction", { roomId, messageId: msgId, emoji });
    }
    setActiveEmojiMenu(null);
  };

  const skipStranger = () => {
    const s = socketRef.current;
    if (!s) return;

    if (roomId) {
      s.emit("leave_chat", { roomId });
    }

    setStatus("waiting");
    setRoomId(null);
    setMessages([]);
    setInput("");
    setReplyingTo(null);
    setActiveEmojiMenu(null);

    s.emit("find_partner");
  };

  const handleClose = () => {
    const s = socketRef.current;
    if (roomId && s) {
      s.emit("leave_chat", { roomId });
    }
    if (s) {
      s.disconnect();
    }
    setStatus("idle");
    setMessages([]);
    setInput("");
    setRoomId(null);
    setReplyingTo(null);
    setActiveEmojiMenu(null);
    if (typeof onLeave === "function") onLeave();
  };

  const handleRazorpayPayment = async () => {
    const plansData = {
      "1h": { amount: 199 * 100, name: "1 Hour Premium Pass" },
      "3h": { amount: 299 * 100, name: "3 Hours Premium Pass" },
      "1d": { amount: 399 * 100, name: "1 Day Premium Pass" }
    };

    const currentPlan = plansData[selectedPlan];

    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: currentPlan.amount,
          currency: "INR",
          receipt: "rcpt_" + selectedPlan + "_" + Date.now(),
        }),
      });

      const orderData = await res.json();
      if (!res.ok) {
        alert("Error creating order: " + (orderData.error || "Unknown error"));
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TKRqzJZpanXoiS",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Strangerly",
        description: currentPlan.name,
        order_id: orderData.order_id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              alert("Payment Successful & Verified! ID: " + response.razorpay_payment_id);
              setShowPaywall(false);
            } else {
              alert("Payment verification failed: " + (verifyData.error || "Signature mismatch"));
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert("An error occurred during payment verification.");
          }
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
        alert("Razorpay SDK script is missing.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Could not initiate payment.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#091526]/95 backdrop-blur-md p-2 sm:p-4">
      <div className="w-full max-w-2xl rounded-2xl sm:rounded-3xl bg-[#131c2e] mx-auto p-0 flex flex-col h-[90vh] sm:h-[620px] shadow-2xl border border-[#233351] relative overflow-hidden">
        
        {/* Top Header */}
        <div className="rounded-t-2xl sm:rounded-t-3xl flex-shrink-0">
          <div className="p-2 sm:px-6 bg-[#1a263b] text-xs flex items-center justify-between rounded-t-2xl sm:rounded-3xl gap-2 font-semibold text-blue-100 border-b border-[#283959]">
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

        {/* Content Area */}
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
              <div ref={chatRef} className="flex-1 overflow-y-auto w-full px-3 py-3 flex flex-col gap-3">
                {messages.slice(1).length === 0 && (
                  <div className="text-center text-slate-400 italic py-4 text-sm">Connected! Say hi.</div>
                )}
                {messages.slice(1).map((msg) => (
                  <div
                    key={msg.id}
                    className={
                      msg.sender === "me"
                        ? "flex w-full justify-end relative my-2 group"
                        : msg.sender === "partner"
                          ? "flex w-full justify-start relative my-2 group"
                          : "flex w-full justify-center"
                    }
                  >
                    {msg.sender !== "system" ? (
                      <div className={`relative max-w-[85%] sm:max-w-[80%] flex flex-col ${msg.sender === "me" ? "items-end" : "items-start"}`}>
                        
                        {/* Message Bubble */}
                        <div
                          className={
                            msg.sender === "me"
                              ? "bg-cyan-400 text-slate-950 px-4 py-2 rounded-2xl rounded-tr-md shadow font-medium text-sm break-words relative"
                              : "bg-[#1c293d] text-cyan-100 px-4 py-2 rounded-2xl rounded-tl-md shadow font-medium text-sm border border-[#2b3e5d] break-words relative"
                          }
                        >
                          {msg.replyTo && (
                            <div className={`mb-1.5 p-1.5 rounded-lg text-xs border-l-2 ${msg.sender === "me" ? "bg-cyan-600/20 border-slate-950 text-slate-900" : "bg-black/30 border-cyan-400 text-cyan-300"}`}>
                              <p className="font-semibold text-[10px] opacity-70">Reply to message</p>
                              <p className="truncate">{msg.replyTo}</p>
                            </div>
                          )}
                          {msg.text}

                          {/* Reactions Display Badge */}
                          {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                            <div className="absolute -bottom-2.5 right-2 flex items-center gap-1 bg-[#131d2e] border border-[#2b3e5d] px-2 py-0.5 rounded-full shadow text-xs">
                              {Object.entries(msg.reactions).map(([emoji, count]) => (
                                <span key={emoji} className="flex items-center gap-0.5 text-[11px]">
                                  {emoji} <span className="text-slate-300 font-semibold text-[10px]">{count}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Action buttons (Reply & React) nicely placed below the bubble */}
                        <div className="flex items-center gap-2 mt-1 px-1 text-[11px] text-slate-400 opacity-80 hover:opacity-100">
                          <button 
                            onClick={() => setReplyingTo(msg.text)}
                            className="flex items-center gap-1 hover:text-cyan-400 cursor-pointer bg-[#162235]/80 px-2 py-0.5 rounded-md border border-[#2b3e5d]"
                          >
                            <CornerUpLeft size={10} /> Reply
                          </button>
                          <button 
                            onClick={() => setActiveEmojiMenu(activeEmojiMenu === msg.id ? null : msg.id)}
                            className="flex items-center gap-1 hover:text-amber-400 cursor-pointer bg-[#162235]/80 px-2 py-0.5 rounded-md border border-[#2b3e5d]"
                          >
                            <Smile size={10} /> React
                          </button>
                        </div>

                        {/* Emoji Picker Popup */}
                        {activeEmojiMenu === msg.id && (
                          <div className="absolute z-25 top-full mt-1 bg-[#19263a] border border-[#2e456b] shadow-2xl rounded-xl p-2 flex flex-wrap items-center gap-2 w-max max-w-[240px]">
                            {EMOJI_LIST.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => addReaction(msg.id, emoji)}
                                className="hover:scale-125 transition text-lg cursor-pointer"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}

                      </div>
                    ) : (
                      <div className="text-xs text-cyan-300 bg-transparent font-semibold my-1 text-center w-full">
                        {msg.text}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Bottom Actions & Input */}
              <div className="flex-shrink-0 bg-[#0e1624] border-t border-[#233351] p-2.5 sm:p-3 flex flex-col gap-2">
                
                {replyingTo && (
                  <div className="flex items-center justify-between bg-[#172338] border-l-4 border-cyan-400 px-3 py-1.5 rounded-r-xl text-xs text-cyan-100 shadow">
                    <div className="truncate">
                      <span className="text-[10px] text-cyan-400 block font-bold">Replying to message</span>
                      <span className="truncate">{replyingTo}</span>
                    </div>
                    <button 
                      onClick={() => setReplyingTo(null)}
                      className="text-slate-400 hover:text-white p-1 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

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
                    placeholder={replyingTo ? "Type your reply..." : "Type a message..."}
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