"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    const normalizedEmail = email.trim().toLowerCase();
    try {
      await api.post("/auth/forgot-password", { email: normalizedEmail });
      setStatus("success");
      setMessage("If an account exists, a reset token has been generated. Check the backend logs.");
    } catch (err: any) {
      setStatus("error");
      setMessage("Failed to process request. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <h2 className="mb-2 text-center text-3xl font-bold text-white">Reset Password</h2>
        <p className="mb-6 text-center text-sm text-gray-400">Enter your email to receive a reset token</p>
        
        {status === "success" && <div className="mb-4 rounded-md bg-green-500/20 p-3 text-sm text-green-200">{message}</div>}
        {status === "error" && <div className="mb-4 rounded-md bg-red-500/20 p-3 text-sm text-red-200">{message}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              required
              className="w-full rounded-lg border border-white/10 bg-black/50 p-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "loading" || status === "success"}
            />
          </div>
          
          <button
            type="submit"
            disabled={status === "loading" || status === "success"}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
          >
            {status === "loading" ? "Processing..." : "Request Reset"}
          </button>
        </form>
        <div className="mt-6 flex justify-between text-sm text-gray-400">
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium pb-2">Back to Login</Link>
          <Link href="/reset-password" className="text-blue-400 hover:text-blue-300 font-medium">I have a token</Link>
        </div>
      </div>
    </div>
  );
}
