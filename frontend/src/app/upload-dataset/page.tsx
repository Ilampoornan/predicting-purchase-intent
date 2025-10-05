"use client";

import React from "react";
import { useRef, useState } from "react";
import Image from "next/image";

export default function UploadDataset() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<string>("");
  const fileInput = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setStatus("Uploading...");
    setProgress(0);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
  const data = await res.json();
  setStatus(`Upload complete! Rows: ${data.rows}, Columns: ${data.columns}`);
  setProgress(100);
      } else {
        setStatus("Upload failed.");
        setProgress(0);
      }
    } catch (err) {
      setStatus("Upload failed.");
      setProgress(0);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#2d0b3a] via-[#3c1a5b] to-[#1a0824]">
      <div
        className="rounded-2xl shadow-lg backdrop-blur-md bg-gradient-to-br from-[#3c1a5b]/80 to-[#2d0b3a]/80 border border-[#a259e6]/40 p-10 w-full max-w-xl relative"
        style={{ boxShadow: "0 8px 32px 0 rgba(162, 89, 230, 0.25)" }}
      >
        <button className="absolute top-4 right-4 text-2xl text-[#b0b3b8] hover:text-[#a259e6]">
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-[#00e6e6]">Upload Files</h2>
        <div
          className="border-2 border-dashed border-[#a259e6] rounded-xl flex flex-col items-center justify-center p-8 mb-6 cursor-pointer hover:bg-[#3c1a5b]/40 transition backdrop-blur-md bg-[#23283a]/60"
          style={{
            boxShadow: "0 4px 16px 0 rgba(162, 89, 230, 0.10)",
            border: "2px dashed #a259e6",
          }}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInput.current?.click()}
        >
          <input
            type="file"
            ref={fileInput}
            className="hidden"
            onChange={handleChange}
            accept=".csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          />
          <div className="mb-2">
            <Image src="/cloud.png" alt="Upload" width={48} height={48} />
          </div>
          <span className="text-[#00e6e6] font-medium mb-1">
            {fileName ? fileName : "Drag & drop or click to upload"}
          </span>
          <span className="text-xs text-[#b0b3b8]">Supported: CSV, Excel</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#b0b3b8]">Upload Progress</span>
            <span className="text-[#a259e6] font-semibold">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-[#3c1a5b] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00e6e6] to-[#a259e6] transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-right text-xs text-[#a259e6] mt-1">{status}</div>
        </div>
      </div>
    </div>
  );
}
