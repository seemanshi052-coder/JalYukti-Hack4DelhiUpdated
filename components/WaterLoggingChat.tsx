"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";   // ✅ correct
import { Input } from "@/components/ui/input";     // ✅ correct

type Role = "citizen" | "commuter" | "official" | "admin";

interface WaterLoggingChatProps {
  role: Role;
}

export function WaterLoggingChat({ role }: WaterLoggingChatProps) {
  const [messages, setMessages] = useState<{ text: string; role: "user" | "bot" }[]>([]);
  const [input, setInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(true);

  // Different welcome message per role
  useEffect(() => {
    const welcome =
      role === "citizen"
        ? "Namaste! Ask me about water‑logging risk and safe options in your ward."
        : role === "commuter"
        ? "Hi! Ask about flooded roads, route safety, and delays on your daily commute."
        : role === "official"
        ? "Good day. Ask which wards, pumps, and incidents you should prioritize right now."
        : "Welcome, City Admin. Ask for city‑wide summaries, hotspots, and resource allocation.";

    setMessages([{ text: welcome, role: "bot" }]);
  }, [role]);

  async function handleSend() {
    if (!input.trim()) return;
    const userText = input.trim();

    setMessages((prev) => [...prev, { text: userText, role: "user" }]);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, role }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { text: data.reply ?? "Sorry, I could not generate a reply.", role: "bot" },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { text: "Network error while contacting the JalYukti assistant.", role: "bot" },
      ]);
    }
  }

  const title =
    role === "citizen"
      ? "Citizen Assistant"
      : role === "commuter"
      ? "Commuter Assistant"
      : role === "official"
      ? "Officer Assistant"
      : "City Admin Assistant";

  return (
    <>
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-4 right-4 rounded-full bg-blue-600 text-white px-3 py-2 text-sm shadow-lg"
        >
          💬 Chat
        </button>
      )}

      {isChatOpen && (
        <div className="fixed bottom-4 right-4 w-80 bg-slate-900 text-white rounded-lg shadow-xl flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700">
            <span className="text-sm font-semibold">{title}</span>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              ✕
            </button>
          </div>

          <div className="max-h-64 min-h-[160px] overflow-y-auto px-3 py-2 space-y-1 text-xs">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "text-right"
                    : "text-left text-slate-300"
                }
              >
                <span
                  className={
                    m.role === "user"
                      ? "inline-block bg-blue-600 px-2 py-1 rounded-lg mb-1"
                      : "inline-block bg-slate-700 px-2 py-1 rounded-lg mb-1"
                  }
                >
                  {m.text}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 px-3 py-2 border-t border-slate-700">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                role === "admin"
                  ? "Ask for summary…"
                  : "Ask about water‑logging…"
              }
              className="text-xs bg-slate-800 border-slate-700"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
            />
            <Button size="sm" className="text-xs" onClick={handleSend}>
              Send
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
