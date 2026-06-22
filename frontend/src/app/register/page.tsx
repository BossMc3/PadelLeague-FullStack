"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Mail, Shield, UserCheck, AlertTriangle } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("PLAYER");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const result = await register({ email, password, role });
      setSuccess(result.message);
      // Redirect to verification page after 2 seconds
      setTimeout(() => {
        router.push("/verify-email");
      }, 2000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const backendMessage = typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.message;

        if (err.response?.status === 400) {
          setError(backendMessage || "This email is already in use.");
          return;
        }
        if (err.response?.status === 403) {
          setError(backendMessage || "Registration was denied (403 Forbidden).");
          return;
        }
        setError(`Register failed (${err.response?.status ?? 'network'}).`);
        return;
      }
      setError("Failed to register. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <h2 className="mb-6 text-center text-3xl font-bold text-white">Create Account</h2>

        {error && <div className="mb-4 rounded-md bg-red-500/20 p-3 text-sm text-red-200">{error}</div>}

        {success && (
          <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-emerald-200 font-medium">{success}</p>
                <p className="text-xs text-emerald-300/70 mt-1">Redirecting to verification page...</p>
              </div>
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
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">Account Type</label>
              <select
                className="w-full rounded-lg border border-white/10 bg-black/50 p-3 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="PLAYER">Player</option>
                <option value="ORGANIZER">Tournament Organizer</option>
              </select>
            </div>

            {/* Info banners based on role */}
            {role === "PLAYER" && (
              <div className="flex items-start gap-3 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
                <UserCheck className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-300/80">
                  As a Player, you can browse tournaments, apply to join teams, and track your ELO rating.
                </p>
              </div>
            )}

            {role === "ORGANIZER" && (
              <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-300/80">
                  Organizer accounts require <strong>admin approval</strong> before you can create and manage tournaments. You will be notified once approved.
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-500"
            >
              Sign Up
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
