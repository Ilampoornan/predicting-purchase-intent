"use client";

import React, { useState } from "react";

const insights = [
  { title: "Increase Promotions", detail: "Promotions in Q4 boost sales by 20%." },
  { title: "Top Product", detail: "Product X has the highest conversion rate." },
  { title: "Customer Retention", detail: "Returning customers spend 30% more on average." },
  { title: "Payment Trends", detail: "Mobile payments are increasing among young adults." },
  { title: "Store Performance", detail: "Department stores have the highest total cost per order." },
  { title: "Seasonal Insights", detail: "Sales peak in Winter and Fall seasons." },
];

export default function InsightsSuggestions() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! Ask me for recommendations based on your results." }
  ]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { from: "user", text: input }]);
    // Simulate LLM response (replace with real API call)
    setTimeout(() => {
      setMessages(msgs => [
        ...msgs,
        { from: "bot", text: "Here's a suggestion based on your data!" }
      ]);
    }, 1000);
    setInput("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#000000] via-[#080645] to-[#260c2c]">
      <h2 className="text-3xl font-bold text-[#a259e6] p-8">Insights and Suggestions</h2>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 px-8">
        {insights.map((insight, idx) => (
          <div key={idx} className="bg-[#1a0824]/80 rounded-xl p-6 shadow-lg border border-[#a259e6]/40">
            <h3 className="text-lg font-semibold text-[#00e6e6] mb-2 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#a259e6] mr-2"></span>
              {insight.title}
            </h3>
            <p className="text-[#b0b3b8]">{insight.detail}</p>
          </div>
        ))}
      </div>
      {/* Chatbot Section */}
      <div className="w-full max-w-2xl mx-auto mt-8 mb-4">
        <div className="bg-[#23283a] rounded-t-xl p-4 h-64 overflow-y-auto flex flex-col gap-2">
          {messages.map((msg, idx) => (
            <div key={idx} className={msg.from === "user" ? "text-right" : "text-left"}>
              <span className={msg.from === "user" ? "bg-[#a259e6] text-white" : "bg-[#00e6e6] text-black"} style={{ borderRadius: "1rem", padding: "0.5rem 1rem", display: "inline-block" }}>
                {msg.text}
              </span>
            </div>
          ))}
        </div>
        <div className="flex bg-[#23283a] rounded-b-xl p-2">
          <input
            className="flex-1 p-2 rounded-l-xl bg-[#1a0824] text-white outline-none"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Ask for recommendations..."
          />
          <button
            className="bg-[#a259e6] text-white px-4 py-2 rounded-r-xl"
            onClick={handleSend}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.12 1.196.488l.007.117V7.5a.75.75 0 00.75.75h6.375c.621 0 .934.751.488 1.196l-8.955 8.954a.75.75 0 01-1.06 0l-6.72-6.72a.75.75 0 010-1.06z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
