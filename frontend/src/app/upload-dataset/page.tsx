"use client";
import React, { useEffect } from "react";
import { useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

export default function UploadDataset() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  // Restore upload state from localStorage on mount
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id || null);
    };
    getUser();
    // Restore upload state
    const saved = localStorage.getItem("uploadState");
    if (saved) {
      const { fileName, progress, status, uploadComplete } = JSON.parse(saved);
      setFileName(fileName);
      setProgress(progress);
      setStatus(status);
      setUploadComplete(uploadComplete);
    }
  }, []);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setStatus("Uploading...");
    setProgress(0);
    // Save state to localStorage
    localStorage.setItem(
      "uploadState",
      JSON.stringify({
        fileName: file.name,
        progress: 0,
        status: "Uploading...",
        uploadComplete: false,
      })
    );
    if (!userId) {
      setStatus("User not authenticated. Please log in.");
      setProgress(0);
      localStorage.removeItem("uploadState");
      console.log("DEBUG: userId is not set");
      return;
    }
    console.log("DEBUG: userId before upload", userId);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", userId);
    // Log FormData keys for debugging
    for (let pair of formData.entries()) {
      console.log(`FormData field: ${pair[0]} = ${pair[1]}`);
    }
    try {
      const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setStatus(
          `Upload complete! Rows: ${data.rows}, Columns: ${data.columns}`
        );
        setProgress(100);
        setUploadComplete(true);
        localStorage.setItem(
          "uploadState",
          JSON.stringify({
            fileName: file.name,
            progress: 100,
            status: `Upload complete! Rows: ${data.rows}, Columns: ${data.columns}`,
            uploadComplete: true,
          })
        );
      } else {
        setStatus("Upload failed.");
        setProgress(0);
        localStorage.removeItem("uploadState");
      }
    } catch (err) {
      setStatus("Upload failed.");
      setProgress(0);
      localStorage.removeItem("uploadState");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#000000] via-[#080645] to-[#260c2c]">
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
            ...(uploadComplete ? { opacity: 0.5, pointerEvents: "none" } : {}),
          }}
          onDrop={uploadComplete ? undefined : handleDrop}
          onDragOver={uploadComplete ? undefined : (e) => e.preventDefault()}
          onClick={
            uploadComplete ? undefined : () => fileInput.current?.click()
          }
        >
          <input
            type="file"
            ref={fileInput}
            className="hidden"
            onChange={handleChange}
            accept=".csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            disabled={uploadComplete}
          />
          <div className="mb-2">
            <Image src="/cloud.png" alt="Upload" width={48} height={48} />
          </div>
          <span className="text-[#00e6e6] font-medium mb-1">
            {fileName ? fileName : "Drag & drop or click to upload"}
          </span>
          <span className="text-xs text-[#b0b3b8]">Supported type: CSV</span>
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
        {uploadComplete && (
          <button
            className="mt-6 w-full py-2 rounded-lg bg-[#a259e6] text-white font-semibold hover:bg-[#7c3aed] transition"
            onClick={() => {
              setFileName(null);
              setProgress(0);
              setStatus("");
              setUploadComplete(false);
              localStorage.removeItem("uploadState");
            }}
          >
            Upload a New Dataset
          </button>
        )}
      </div>
    </div>
  );
}
