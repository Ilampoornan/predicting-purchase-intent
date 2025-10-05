"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

import {
  HomeIcon,
  ChartBarIcon,
  DocumentArrowUpIcon,
  LightBulbIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

const sidebarItems = [
  { label: "Dashboard", href: "/", icon: <HomeIcon className="h-5 w-5" /> },
  {
    label: "Upload Dataset",
    href: "/upload-dataset",
    icon: <DocumentArrowUpIcon className="h-5 w-5" />,
  },
  {
    label: "Visualizations",
    href: "/visualizations",
    icon: <ChartBarIcon className="h-5 w-5" />,
  },
  {
    label: "Insights & Suggestions",
    href: "/insights-suggestions",
    icon: <LightBulbIcon className="h-5 w-5" />,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: <Cog6ToothIcon className="h-5 w-5" />,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 bg-gradient-to-b from-[#2d0b3a] via-[#3c1a5b] to-[#1a0824] border-r border-[#23283a] min-h-screen flex flex-col py-6 shadow-xl">
      <div className="flex flex-col items-center mb-8">
        <span className="text-2xl font-extrabold text-[#ffffff] tracking-wide mb-2">
          Dashboard
        </span>
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#a259e6] to-[#23283a] flex items-center justify-center text-white mb-2">
          <span role="img" aria-label="user" className="text-2xl">
            🛒
          </span>
        </div>
        <span className="text-xs text-[#b0b3b8]">IntentMiner</span>
      </div>
      <nav className="flex-1 w-full">
        <ul className="flex flex-col gap-1 w-full px-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-4 px-5 py-3 rounded-lg cursor-pointer transition-colors font-semibold text-[#e2e2e2] text-base ${
                    isActive
                      ? "bg-[#a259e6]/80 text-[#fff] shadow-lg"
                      : "hover:bg-[#a259e6]/40 hover:text-[#fff]"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
       
      </nav>
    </aside>
  );
}
