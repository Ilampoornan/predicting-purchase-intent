"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function InsightsSuggestions() {
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hi! Ask me for recommendations based on your results.",
    },
  ]);
  const [input, setInput] = useState("");
  const [rfmClusters, setRfmClusters] = useState<any[]>(() => {
    const saved = localStorage.getItem("rfmClusters");
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRfm = async () => {
      const { data } = await supabase.auth.getUser();
      const userId = data?.user?.id;
      if (!userId) {
        setLoading(false);
        return;
      }
      fetch(`http://localhost:8000/rfm-insights?user_id=${userId}`)
        .then((res) => res.json())
        .then((data) => {
          setRfmClusters(data.clusters || []);
          localStorage.setItem(
            "rfmClusters",
            JSON.stringify(data.clusters || [])
          );
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };
    // Only fetch if not already in localStorage
    if (!localStorage.getItem("rfmClusters")) {
      fetchRfm();
    } else {
      setLoading(false);
    }
  }, []);

  const [interpretation, setInterpretation] = useState<string>(() => {
    return localStorage.getItem("rfmInterpretation") || "";
  });
  const [llmLoading, setLlmLoading] = useState(false);
  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { from: "user", text: input }]);
    // Simulate LLM response (replace with real API call)
    setTimeout(() => {
      setMessages((msgs) => [
        ...msgs,
        { from: "bot", text: "Here's a suggestion based on your data!" },
      ]);
    }, 1000);
    setInput("");
  };

  // Call LLM for interpretation when clusters are loaded
  useEffect(() => {
    if (rfmClusters.length > 0) {
      const cached = localStorage.getItem("rfmInterpretation");
      if (cached) {
        setInterpretation(cached);
        setLlmLoading(false);
        return;
      }
      setLlmLoading(true);
      fetch("http://localhost:8000/llm-interpret-rfm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clusters: rfmClusters }),
      })
        .then((res) => res.json())
        .then((data) => {
          setInterpretation(data.interpretation || "");
          localStorage.setItem("rfmInterpretation", data.interpretation || "");
          setLlmLoading(false);
        })
        .catch(() => setLlmLoading(false));
    }
  }, [rfmClusters]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#000000] via-[#080645] to-[#260c2c]">
      <h2 className="text-3xl font-bold text-[#a259e6] p-8">
        Insights and Suggestions
      </h2>
      {/* RFM Cluster Table */}
      <div className="w-full max-w-4xl mx-auto mb-8">
        <div className="bg-[#1a0824]/80 rounded-xl p-6 shadow-lg border border-[#a259e6]/40">
          <h3 className="text-xl font-semibold text-[#00e6e6] mb-4">
            Customer Segments (RFM Clusters)
          </h3>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <svg
                className="animate-spin h-8 w-8 text-[#00e6e6] mb-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#00e6e6"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="#00e6e6"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              <div className="text-[#b0b3b8]">Loading RFM insights...</div>
            </div>
          ) : rfmClusters.length === 0 ? (
            <div className="text-[#b0b3b8]">No RFM cluster data available.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-[#b0b3b8]">
                <thead className="text-xs uppercase bg-[#23283a] text-[#00e6e6]">
                  <tr>
                    <th className="px-4 py-2">Cluster</th>
                    <th className="px-4 py-2">Avg Recency</th>
                    <th className="px-4 py-2">Avg Frequency</th>
                    <th className="px-4 py-2">Avg Monetary</th>
                    <th className="px-4 py-2">Num Customers</th>
                  </tr>
                </thead>
                <tbody>
                  {rfmClusters.map((c, idx) => (
                    <tr key={idx} className="border-b border-[#a259e6]/20">
                      <td className="px-4 py-2 font-bold">{c.Cluster}</td>
                      <td className="px-4 py-2">{c.Recency.toFixed(1)}</td>
                      <td className="px-4 py-2">{c.Frequency.toFixed(1)}</td>
                      <td className="px-4 py-2">{c.Monetary.toFixed(2)}</td>
                      <td className="px-4 py-2">{c.Num_Customers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* LLM Interpretation (moved out of table) */}
          {llmLoading && (
            <div className="mt-6 flex flex-col items-center justify-center">
              <svg
                className="animate-spin h-6 w-6 text-[#a259e6] mb-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#a259e6"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="#a259e6"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              <div className="text-[#b0b3b8] italic">
                Generating interpretation...
              </div>
            </div>
          )}
          {interpretation && !llmLoading && (
            <div className="mt-6 bg-[#23283a] rounded-lg p-4 text-[#00e6e6] shadow-inner">
              <p>{interpretation}</p>
            </div>
          )}
        </div>
      </div>
      {/* Chatbot Section */}
      {/* <div className="w-full max-w-2xl mx-auto mt-8 mb-4">
        <div className="bg-[#23283a] rounded-t-xl p-4 h-64 overflow-y-auto flex flex-col gap-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={msg.from === "user" ? "text-right" : "text-left"}
            >
              <span
                className={
                  msg.from === "user"
                    ? "bg-[#a259e6] text-white"
                    : "bg-[#00e6e6] text-black"
                }
                style={{
                  borderRadius: "1rem",
                  padding: "0.5rem 1rem",
                  display: "inline-block",
                }}
              >
                {msg.text}
              </span>
            </div>
          ))}
        </div>
        <div className="flex bg-[#23283a] rounded-b-xl p-2">
          <input
            className="flex-1 p-2 rounded-l-xl bg-[#1a0824] text-white outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask for recommendations..."
          />
          <button
            className="bg-[#a259e6] text-white px-4 py-2 rounded-r-xl"
            onClick={handleSend}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12l8.954-8.955c.44-.439 1.152-.12 1.196.488l.007.117V7.5a.75.75 0 00.75.75h6.375c.621 0 .934.751.488 1.196l-8.955 8.954a.75.75 0 01-1.06 0l-6.72-6.72a.75.75 0 010-1.06z"
              />
            </svg>
          </button>
        </div>
      </div> */}
    </div>
  );
}
