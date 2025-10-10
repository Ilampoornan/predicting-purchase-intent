"use client";

import Link from "next/link";
import {
  ChartBarIcon,
  DocumentArrowUpIcon,
  UserIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";

export default function Home() {
  // Get today's date
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth(); // 0-indexed
  const currentYear = today.getFullYear();

  // For this demo, calendar is always October 2025
  const calendarMonth = 9; // October (0-indexed)
  const calendarYear = 2025;

  const highlightToday =
    currentMonth === calendarMonth && currentYear === calendarYear;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#000000] via-[#080645] to-[#260c2c]">
      <main className="flex-1 p-4 md:p-8 overflow-x-auto">
        <h1 className="text-4xl font-extrabold text-center text-[#00e6e6] mb-8 tracking-tight drop-shadow-lg">
          Intent Miner
        </h1>
        {/* Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Link href="/upload-dataset" className="block">
            <GlassCard>
              <div className="flex flex-col gap-2 cursor-pointer hover:scale-105 transition-transform">
                <span className="text-xs text-[#ffffff] font-bold">
                  UPLOAD DATASET
                </span>
                <span className="text-2xl font-bold text-[#00e6e6]">
                  <DocumentArrowUpIcon className="h-8 w-8 mt-2" />
                </span>
                <span className="text-sm text-[#ffffff]">
                  Upload your retail dataset for the analysis.
                </span>
              </div>
            </GlassCard>
          </Link>
          <Link href="/visualizations" className="block">
            <GlassCard>
              <div className="flex flex-col gap-2 cursor-pointer hover:scale-105 transition-transform">
                <span className="text-xs text-[#ffffff] font-bold">
                  VISUALIZE DATA
                </span>
                <span className="text-2xl font-bold text-[#a259e6]">
                  <ChartBarIcon className="h-8 w-8 mt-2" />
                </span>
                <span className="text-sm text-[#ffffff]">
                  See trends, patterns, and insights visually.
                </span>
              </div>
            </GlassCard>
          </Link>
          <Link href="/insights-suggestions" className="block">
            <GlassCard>
              <div className="flex flex-col gap-2 cursor-pointer hover:scale-105 transition-transform">
                <span className="text-xs text-[#ffffff] font-bold">
                  INSIGHTS & SUGGESTIONS
                </span>
                <span className="text-2xl font-bold text-[#00e6e6]">
                  <LightBulbIcon className="h-8 w-8 mt-2" />
                </span>
                <span className="text-sm text-[#ffffff]">
                  Get smart recommendations and summaries.
                </span>
              </div>
            </GlassCard>
          </Link>
          <Link href="/settings" className="block">
            <GlassCard>
              <div className="flex flex-col gap-2 cursor-pointer hover:scale-105 transition-transform">
                <span className="text-xs text-[#ffffff] font-bold">
                  PROFILE
                </span>
                <span className="text-2xl font-bold text-[#a259e6]">
                  <UserIcon className="h-8 w-8 mt-2" />
                </span>
                <span className="text-sm text-[#ffffff]">
                  Customize your preferences and configurations.
                </span>
              </div>
            </GlassCard>
          </Link>
        </div>
        {/* World Map & Calendar Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <GlassCard>
            <div className="flex flex-col gap-4 items-start h-full">
              <div className="w-full h-64 md:h-80 lg:h-85 flex justify-center items-center">
                <img
                  src="/worldmap.png"
                  alt="World Map"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex flex-col gap-4">
              <span className="text-lg font-bold text-[#a259e6] mb-2">
                Calendar
              </span>
              <div className="bg-[#23283a]/80 rounded-2xl p-4 shadow flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2">
                    <button className="px-2 py-1 rounded bg-[#a259e6]/60 text-[#f8f6f0] hover:bg-[#a259e6]/80 transition">
                      &#8592;
                    </button>
                    <button className="px-2 py-1 rounded bg-[#a259e6]/60 text-[#f8f6f0] hover:bg-[#a259e6]/80 transition">
                      &#8594;
                    </button>
                  </div>
                  <span className="text-[#f8f6f0] font-semibold text-lg">
                    October 2025
                  </span>
                  <div className="flex gap-2">
                    <button className="px-2 py-1 rounded bg-[#a259e6]/60 text-[#fff]">
                      Month
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (day) => (
                      <span
                        key={day}
                        className="text-[#b0b3b8] text-xs text-center font-bold"
                      >
                        {day}
                      </span>
                    )
                  )}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {[...Array(31)].map((_, i) => {
                    const date = i + 1;
                    // Highlight today if in October 2025, else nothing special
                    const isToday = highlightToday && date === currentDay;
                    return (
                      <button
                        key={date}
                        className={`rounded-full w-8 h-8 flex items-center justify-center font-semibold transition border-2 ${
                          isToday
                            ? "bg-[#00e6e6] border-[#00e6e6] text-[#23283a] shadow-lg"
                            : "bg-[#23283a]/60 border-[#44475a] text-[#b0b3b8] hover:bg-[#a259e6]/30 hover:text-[#f8f6f0]"
                        }`}
                      >
                        {date}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}

function DashboardCard({
  label,
  desc,
  href,
  icon,
}: {
  label: string;
  desc: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link href={href}>
      <div className="rounded-2xl p-8 shadow-lg bg-gradient-to-br from-[#3c1a5b]/80 to-[#2d0b3a]/80 flex flex-col items-center min-h-[170px] relative overflow-hidden cursor-pointer transition hover:scale-105 hover:shadow-2xl group backdrop-blur-md border border-[#a259e6]/40">
        <span className="text-lg font-bold mb-1 group-hover:text-[#00e6e6] transition-colors text-[#f8f6f0] drop-shadow">
          {label}
        </span>
        <span className="text-sm text-[#b0b3b8] text-center">{desc}</span>
        <div className="mt-4">{icon}</div>
      </div>
    </Link>
  );
}

function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-6 shadow-lg backdrop-blur-md bg-gradient-to-br from-[#3c1a5b]/80 to-[#2d0b3a]/80 border border-[#a259e6]/30"
      style={{ boxShadow: "0 8px 32px 0 rgba(162, 89, 230, 0.25)" }}
    >
      {children}
    </div>
  );
}
