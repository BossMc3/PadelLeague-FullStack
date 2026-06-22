"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import axios from "axios";
import { Mail, ShieldCheck, ArrowRight } from "lucide-react";

export default function VerifyEmailPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { verifyEmail } = useAuth();

  useEffect(() => {
    const pendingEmail = localStorage.getItem("pendingVerificationEmail");
    if (pendingEmail) {
      setEmail(pendingEmail);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      await verifyEmail({ email, token: code });
      setSuccess("Email verified! Redirecting...");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg = typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.message;
        setError(msg || "Verification failed. Please try again.");
      } else {
        setError("Verification failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-blue-500/10 p-4">
            <Mail className="w-10 h-10 text-blue-400" />
          </div>
        </div>
        <h2 className="mb-2 text-center text-3xl font-bold text-white">Verify Your Email</h2>
        <p className="mb-6 text-center text-sm text-gray-400">
          We sent a 6-digit verification code to your email. Enter it below to activate your account.
        </p>

        {error && <div className="mb-4 rounded-md bg-red-500/20 p-3 text-sm text-red-200">{error}</div>}

        {success && (
          <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <p className="text-sm text-emerald-200 font-medium">{success}</p>
            </div>
          </div>
        )}

        {!success && (
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
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">Verification Code</label>
              <input
                type="text"
                required
                maxLength={6}
                className="w-full rounded-lg border border-white/10 bg-black/50 p-3 text-white text-center text-2xl tracking-[0.5em] font-mono placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || code.length < 6}
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? "Verifying..." : <>Verify <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-400">
          Already verified?{" "}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
