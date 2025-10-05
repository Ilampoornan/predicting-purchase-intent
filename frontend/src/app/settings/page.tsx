"use client";

import { useState } from "react";

const uploadFormats = ["CSV", "Excel", "JSON"];
const visualPlatforms = ["Power BI", "Tableau", "Looker Studio"];
const datasetTypes = [
  "With Timestamp (Time Series)",
  "Without Timestamp (Cross Sectional)",
];
const analysisOptions = [
  "Look for Seasonality",
  "Look for Trend",
  "Look for Anomalies",
  "Look for Outliers",
];

export default function SettingsPage() {
  const [uploadFormat, setUploadFormat] = useState(uploadFormats[0]);
  const [visualPlatform, setVisualPlatform] = useState(visualPlatforms[0]);
  const [datasetType, setDatasetType] = useState(datasetTypes[0]);
  const [selectedAnalyses, setSelectedAnalyses] = useState<string[]>([
    analysisOptions[0],
  ]);

  const handleAnalysisChange = (option: string) => {
    setSelectedAnalyses((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2d0b3a] via-[#3c1a5b] to-[#1a0824] flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl p-10 shadow-lg bg-gradient-to-br from-[#3c1a5b]/80 to-[#2d0b3a]/80 border border-[#a259e6]/40 backdrop-blur-md">
        <h2 className="text-3xl font-extrabold text-center text-[#00e6e6] mb-8 drop-shadow-lg">
          Settings
        </h2>
        <form className="space-y-8">
          {/* Upload Format */}
          <div>
            <label className="block text-[#a259e6] font-bold mb-2">
              Upload Format
            </label>
            <select
              className="w-full p-3 rounded-lg bg-[#23283a]/80 text-[#f8f6f0] border border-[#a259e6]/40 focus:outline-none focus:ring-2 focus:ring-[#a259e6]"
              value={uploadFormat}
              onChange={(e) => setUploadFormat(e.target.value)}
            >
              {uploadFormats.map((format) => (
                <option key={format} value={format}>
                  {format}
                </option>
              ))}
            </select>
          </div>
          {/* Visualisation Platform */}
          <div>
            <label className="block text-[#a259e6] font-bold mb-2">
              Visualisation Platform
            </label>
            <select
              className="w-full p-3 rounded-lg bg-[#23283a]/80 text-[#f8f6f0] border border-[#a259e6]/40 focus:outline-none focus:ring-2 focus:ring-[#a259e6]"
              value={visualPlatform}
              onChange={(e) => setVisualPlatform(e.target.value)}
            >
              {visualPlatforms.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
          </div>
          {/* Dataset Type */}
          <div>
            <label className="block text-[#a259e6] font-bold mb-2">
              Type of Dataset
            </label>
            <select
              className="w-full p-3 rounded-lg bg-[#23283a]/80 text-[#f8f6f0] border border-[#a259e6]/40 focus:outline-none focus:ring-2 focus:ring-[#a259e6]"
              value={datasetType}
              onChange={(e) => setDatasetType(e.target.value)}
            >
              {datasetTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
         
        </form>
      </div>
    </div>
  );
}
