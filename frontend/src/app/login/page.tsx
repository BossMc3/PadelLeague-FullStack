"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Mail } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNeedsVerification(false);

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    try {
      await login({ email: normalizedEmail, password: normalizedPassword });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const backendMessage = typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.message;

        // Check if the user needs email verification
        if (err.response?.status === 403 && err.response?.data?.emailVerified === false) {
          setNeedsVerification(true);
          localStorage.setItem('pendingVerificationEmail', normalizedEmail);
          setError(backendMessage || "Please verify your email before logging in.");
          return;
        }

        if (err.response?.status === 403 || err.response?.status === 401) {
          setError(backendMessage || "Invalid email or password.");
          return;
        }
        setError(backendMessage || `Login failed (${err.response?.status ?? 'network'}).`);
        return;
      }
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <h2 className="mb-6 text-center text-3xl font-bold text-white">Welcome Back</h2>
        {error && (
          <div className="mb-4 rounded-md bg-red-500/20 p-3 text-sm text-red-200">
            {error}
            {needsVerification && (
              <div className="mt-2">
                <button
                  onClick={() => router.push("/verify-email")}
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium text-xs underline"
                >
                  <Mail className="w-3 h-3" /> Go to verification page
                </button>
              </div>
            )}
          </div>
        )}
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
            <label className="mb-1 block text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              required
              className="w-full rounded-lg border border-white/10 bg-black/50 p-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm text-gray-300">
              <input type="checkbox" className="mr-2 rounded border-gray-600 bg-black/50" />
              Remember me
            </label>
            <Link href="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-500"
          >
            Sign In
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
