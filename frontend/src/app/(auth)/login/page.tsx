"use client";

import React, { useState } from "react";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  return (
    <div
      className="min-h-screen flex items-stretch bg-cover bg-center"
      style={{ backgroundImage: "url('/bg.png')" }}
    >
      {/* Left Section */}
      <div className="hidden md:flex flex-col justify-center items-start w-1/2 pl-30 pr-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2b193c] to-[#23283a] flex items-center justify-center">
            <img
            src="/logo.png"
            alt="Logo"
            className="w-10 h-10 object-contain"
          />
          </div>
          <span className="text-2xl font-bold text-white tracking-wide">
            IntentMiner
          </span>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Unlock Purchase Intent Insights
        </h2>
        <p className="text-white/80 max-w-md mb-8">
          Welcome to IntentMiner, your intelligent platform for predicting and
          analyzing customer purchase intent. Empower your business with
          actionable insights, data-driven recommendations, and a seamless
          experience for your team. Discover trends, optimize strategies, and
          stay ahead in the market with IntentMiner.
        </p>
      </div>
      {/* Right Section (Login Form) */}
      <div className="flex flex-1 items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-10 w-full max-w-md border border-white/20">
          <h3 className="text-center text-white/80 text-lg mb-6 tracking-widest">
            WELCOME BACK EXCLUSIVE MEMBER
          </h3>
          <form className="space-y-6">
            <div>
              <div className="flex items-center bg-white/10 rounded-md px-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-white/50 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 12l-4 4-4-4m8-4H4a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2v-8a2 2 0 00-2-2z"
                  />
                </svg>
                <input
                  type="email"
                  className="bg-transparent outline-none py-3 w-full text-white placeholder-white/60 text-base"
                  placeholder="company@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center bg-white/10 rounded-md px-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-white/50 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 11c-1.657 0-3 1.343-3 3v3a3 3 0 003 3 3 3 0 003-3v-3c0-1.657-1.343-3-3-3zm0 0V7a4 4 0 118 0v4"
                  />
                </svg>
                <input
                  type="password"
                  className="bg-transparent outline-none py-3 w-full text-white placeholder-white/60 text-base"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </div>
            </div>
            <button
              type="button"
              className="w-full py-3 mt-2 rounded bg-black/80 text-white font-bold text-lg shadow-md hover:bg-black transition"
            >
              Proceed to My Account
            </button>
          </form>
          <p className="text-center text-white/80 text-xs mt-6">
            Not a member?{" "}
            <a href="/signup" className="text-blue-200 hover:underline">
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
