"use client";

import { useState, Suspense } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";
  
  const [email, setEmail] = useState(emailParam);
  const [token, setToken] = useState(tokenParam);
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedToken = token.trim();
    const normalizedPassword = newPassword.trim();

    try {
      await api.post("/auth/reset-password", {
        email: normalizedEmail,
        token: normalizedToken,
        newPassword: normalizedPassword,
      });

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setStatus("success");
      setMessage("Password successfully reset! Redirecting to login...");
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      setStatus("error");
      const backendMessage = err?.response?.data;
      setMessage(typeof backendMessage === "string" ? backendMessage : "Invalid or expired token. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status === "success" && <div className="mb-4 rounded-md bg-green-500/20 p-3 text-sm text-green-200">{message}</div>}
      {status === "error" && <div className="mb-4 rounded-md bg-red-500/20 p-3 text-sm text-red-200">{message}</div>}
      
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Email</label>
        <input
          type="email"
          required
          className="w-full rounded-lg border border-white/10 bg-black/50 p-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 mb-4"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading" || status === "success"}
        />

        <label className="mb-1 block text-sm font-medium text-gray-300">Reset Token</label>
        <input
          type="text"
          required
          className="w-full rounded-lg border border-white/10 bg-black/50 p-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 mb-4"
          placeholder="Paste your token here"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          disabled={status === "loading" || status === "success"}
        />
        <label className="mb-1 block text-sm font-medium text-gray-300">New Password</label>
        <input
          type="password"
          required
          className="w-full rounded-lg border border-white/10 bg-black/50 p-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="••••••••"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={status === "loading" || status === "success"}
        />
      </div>
      
      <button
        type="submit"
        disabled={status === "loading" || status === "success"}
        className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
      >
        {status === "loading" ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <h2 className="mb-6 text-center text-3xl font-bold text-white">Choose New Password</h2>
        <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
        <p className="mt-6 text-center text-sm text-gray-400">
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
