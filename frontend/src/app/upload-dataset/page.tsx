"use client";
import React, { useEffect, useState, useRef } from "react";
import Papa from "papaparse";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

interface FileInfo {
  file: File;
  valid: boolean;
  error?: string;
}

const EXPECTED_SCHEMAS: Record<string, string[]> = {
  orders: ["order_id", "user_id", "order_date", "Total cost"],
  order_products: ["order_id", "product_id"],
  products: ["product_id", "product_name"],
};

export default function UploadDataset() {
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, FileInfo>>({});
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [complete, setComplete] = useState(false);

  // Get user from Supabase
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id || null);
    };
    getUser();
  }, []);

  // Validate columns in CSV
  const validateCSV = (file: File): Promise<{ valid: boolean; type?: string; error?: string }> => {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        preview: 1,
        complete: (results) => {
          const header = results.meta.fields || [];
          for (const [type, expectedCols] of Object.entries(EXPECTED_SCHEMAS)) {
            const allMatch = expectedCols.every((col) => header.includes(col));
            if (allMatch) return resolve({ valid: true, type });
          }

          // Find closest expected schema for help message
          const closestType = Object.entries(EXPECTED_SCHEMAS).find(([_, cols]) => {
            const overlap = cols.filter((c) => header.includes(c)).length;
            return overlap > 0;
          });

          resolve({
            valid: false,
            error: closestType
              ? `❌ Column mismatch! Your CSV headers are: [${header.join(", ")}]. Expected for ${closestType[0]}.csv → [${closestType[1].join(", ")}].
👉 Please rename columns or upload the correct CSV file.`
              : `❌ Unknown structure. Columns found: [${header.join(", ")}]. Expected one of: orders.csv, order_products.csv, products.csv.`,
          });
        },
      });
    });
  };

  const handleFile = async (file: File) => {
    setStatus("Checking file structure...");
    const check = await validateCSV(file);

    if (!check.valid) {
      setStatus(check.error || "Invalid file.");
      return;
    }

    setUploadedFiles((prev) => ({
      ...prev,
      [check.type!]: { file, valid: true },
    }));
    setStatus(`✅ ${check.type} file validated successfully. Please upload the next file.`);
  };

  const handleUpload = async () => {
    if (!userId) {
      setStatus("❌ User not authenticated. Please log in first.");
      return;
    }

    const missingFiles = Object.keys(EXPECTED_SCHEMAS).filter(
      (key) => !uploadedFiles[key]?.valid
    );
    if (missingFiles.length > 0) {
      setStatus(`⚠️ Please upload these missing files: ${missingFiles.join(", ")}.`);
      return;
    }

    setUploading(true);
    setStatus("Uploading all CSVs to backend...");
    setProgress(40);

    const formData = new FormData();
    Object.values(uploadedFiles).forEach(({ file }) => formData.append("files", file));
    formData.append("user_id", userId);

    try {
      const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setProgress(100);
        setStatus(`✅ Upload complete! Rows: ${data.rows}, Columns: ${data.columns}`);
        setComplete(true);
      } else {
        setStatus("❌ Upload failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Upload failed (network error).");
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Determine next file user should upload
  const nextFileType = Object.keys(EXPECTED_SCHEMAS).find(
    (key) => !uploadedFiles[key]?.valid
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#000000] via-[#080645] to-[#260c2c]">
      <div className="rounded-2xl shadow-lg backdrop-blur-md bg-gradient-to-br from-[#3c1a5b]/80 to-[#2d0b3a]/80 border border-[#a259e6]/40 p-10 w-full max-w-2xl relative">
        <h2 className="text-2xl font-bold mb-6 text-[#00e6e6] text-center">
          Upload Dataset (Step by Step)
        </h2>

        <div
          className="border-2 border-dashed border-[#a259e6] rounded-xl p-6 text-center cursor-pointer mb-4 hover:bg-[#3c1a5b]/30 transition"
          onClick={() => fileInput.current?.click()}
        >
          <input
            type="file"
            ref={fileInput}
            className="hidden"
            onChange={handleFileInput}
            accept=".csv"
          />
          <Image src="/cloud.png" alt="Upload" width={48} height={48} />
          <p className="text-[#00e6e6] font-medium mt-2">
            {nextFileType
              ? `Upload your ${nextFileType}.csv file`
              : "All files uploaded!"}
          </p>
          <p className="text-xs text-[#b0b3b8]">
            Expected columns are auto-checked for correctness.
          </p>
        </div>

        {/* List of required files */}
        <div className="space-y-3">
          {Object.entries(EXPECTED_SCHEMAS).map(([type, cols]) => (
            <div
              key={type}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                uploadedFiles[type]?.valid
                  ? "border-green-500 bg-green-900/20"
                  : "border-[#a259e6]/40 bg-[#3c1a5b]/10"
              }`}
            >
              <span className="text-[#b0b3b8] font-medium">
                {type}.csv
                <span className="text-xs text-[#777] block">
                  Columns: {cols.join(", ")}
                </span>
              </span>
              <span>{uploadedFiles[type]?.valid ? "✅ Validated" : "⬜ Pending"}</span>
            </div>
          ))}
        </div>

        {/* Upload button */}
        <div className="mt-6">
          <button
            className="w-full py-2 rounded-lg bg-[#a259e6] text-white font-semibold hover:bg-[#7c3aed] transition disabled:opacity-50"
            onClick={handleUpload}
            disabled={uploading || complete}
          >
            {uploading ? "Uploading..." : complete ? "Done ✅" : "Upload All"}
          </button>

          <div className="w-full h-2 bg-[#3c1a5b] rounded-full mt-3">
            <div
              className="h-full bg-gradient-to-r from-[#00e6e6] to-[#a259e6] transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="text-sm text-[#a259e6] mt-3 whitespace-pre-wrap">
            {status}
          </div>
        </div>
      </div>
    </div>
  );
}
