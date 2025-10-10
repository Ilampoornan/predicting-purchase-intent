"use client";

import React, { useState, useRef } from "react";

export default function InferIntentsPage() {
  const [selected, setSelected] = useState<null | "full" | "sample">(null);
  const [progress, setProgress] = useState<{
    batch: number;
    total: number;
  } | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const options = [
    {
      key: "full",
      label: "Full Dataset",
      desc: "Infer intents for the entire dataset.",
      icon: (
        <svg
          className="h-10 w-10"
          fill="none"
          stroke="#00e6e6"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <rect
            x="4"
            y="4"
            width="16"
            height="16"
            rx="3"
            stroke="#00e6e6"
            strokeWidth="2"
          />
          <path d="M8 8h8v8H8z" stroke="#00e6e6" strokeWidth="2" />
        </svg>
      ),
    },
    {
      key: "sample",
      label: "Sample",
      desc: "Infer intents for a random sample.",
      icon: (
        <svg
          className="h-10 w-10"
          fill="none"
          stroke="#a259e6"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <rect
            x="4"
            y="4"
            width="16"
            height="16"
            rx="3"
            stroke="#a259e6"
            strokeWidth="2"
          />
          <circle cx="12" cy="12" r="4" stroke="#a259e6" strokeWidth="2" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#000000] via-[#080645] to-[#260c2c] p-8">
      <div className="max-w-xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-[#a259e6] mb-10 text-center">
          Select Inference Mode
        </h2>
        <p className="text-[#b0b3b8] text-base mb-10 text-center">
          Choose how you want to infer customer intents from your dataset.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
          {options.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSelected(opt.key as "full" | "sample")}
              className={`flex-1 flex flex-col items-center gap-3 px-6 py-8 rounded-2xl border-2 transition-all shadow-lg font-semibold text-lg focus:outline-none
                ${
                  selected === opt.key
                    ? "bg-[#1a0824] border-[#00e6e6] text-[#00e6e6] scale-105"
                    : "bg-[#23283a]/60 border-[#44475a] text-[#b0b3b8] hover:border-[#a259e6] hover:text-[#a259e6]"
                }
              `}
            >
              {opt.icon}
              <span>{opt.label}</span>
              <span className="text-xs font-normal text-[#b0b3b8] text-center">
                {opt.desc}
              </span>
            </button>
          ))}
        </div>
        <div className="flex flex-col items-center mt-4 gap-4">
          <button
            className={`px-8 py-3 rounded-lg font-bold text-base shadow transition ${
              selected && !running
                ? "bg-[#00e6e6] text-[#23283a] hover:bg-[#00b3b3]"
                : "bg-[#23283a]/60 text-[#b0b3b8] cursor-not-allowed"
            }`}
            disabled={!selected || running}
            onClick={() => {
              setProgress(null);
              setError(null);
              setRunning(true);
              // Example: dataset param is hardcoded, sample_size based on selection
              const dataset = "my_dataset"; // TODO: replace with actual dataset name or user input
              const sample_size = selected === "sample" ? 200 : 0;
              const url = `http://localhost:8000/intent/infer/stream?dataset=${dataset}${
                sample_size ? `&sample_size=${sample_size}` : ""
              }`;
              const es = new EventSource(url);
              eventSourceRef.current = es;
              es.onmessage = (event) => {
                try {
                  const data = JSON.parse(event.data);
                  if (data.type === "batch") {
                    setProgress({ batch: data.batch, total: data.total });
                  } else if (data.type === "done") {
                    setRunning(false);
                    es.close();
                  } else if (data.type === "error") {
                    setError(data.text || "Unknown error");
                    setRunning(false);
                    es.close();
                  }
                } catch (e) {
                  // ignore
                }
              };
              es.onerror = () => {
                setError("Connection error");
                setRunning(false);
                es.close();
              };
            }}
          >
            {running ? "Running..." : "Start"}
          </button>
          {progress && (
            <div className="w-full max-w-md mt-2">
              <div className="flex justify-between text-xs text-[#b0b3b8] mb-1">
                <span>
                  Progress: Batch {progress.batch} / {progress.total}
                </span>
              </div>
              <div className="w-full bg-[#23283a]/60 rounded-full h-4">
                <div
                  className="bg-[#00e6e6] h-4 rounded-full transition-all"
                  style={{
                    width: `${(progress.batch / progress.total) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          )}
          {error && <div className="text-red-400 mt-2">{error}</div>}
        </div>
      </div>
    </div>
  );
}
