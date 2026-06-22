"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, UserCheck, UserX, Users, Home, Clock, CheckCircle, XCircle } from "lucide-react";
import { api } from "@/lib/api";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Player } from "@/types";

export default function AdminDashboard() {
  const [pendingOrganizers, setPendingOrganizers] = useState<Player[]>([]);
  const [allUsers, setAllUsers] = useState<Player[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "users">("pending");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchPending();
    fetchAll();
  }, []);

  const fetchPending = async () => {
    try {
      const { data } = await api.get("/admin/pending-organizers");
      setPendingOrganizers(data);
    } catch (err) {
      console.error("Failed to fetch pending organizers", err);
    }
  };

  const fetchAll = async () => {
    try {
      const { data } = await api.get("/admin/users");
      setAllUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      const { data } = await api.post(`/admin/approve/${id}`);
      setMessage(data);
      fetchPending();
      fetchAll();
    } catch (err) {
      console.error("Failed to approve", err);
    }
  };

  const handleReject = async (id: number) => {
    try {
      const { data } = await api.post(`/admin/reject/${id}`);
      setMessage(data);
      fetchPending();
      fetchAll();
    } catch (err) {
      console.error("Failed to reject", err);
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === "ROLE_ADMIN") return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    if (role === "ROLE_ORGANIZER") return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  };

  const getRoleLabel = (role: string) => {
    if (role === "ROLE_ADMIN") return "Admin";
    if (role === "ROLE_ORGANIZER") return "Organizer";
    return "Player";
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6 md:p-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-500/15 p-3">
                <Shield className="h-7 w-7 text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-slate-400 text-sm mt-0.5">Manage users and approve organizer accounts</p>
              </div>
            </div>
            <Link href="/" className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-slate-200 hover:bg-slate-900 transition-colors">
              <Home className="h-4 w-4" /> Home
            </Link>
          </div>

          {message && (
            <div className="mb-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <p className="text-sm text-emerald-200">{message}</p>
              <button onClick={() => setMessage("")} className="ml-auto text-emerald-400 hover:text-white">✕</button>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-6 flex gap-1 rounded-xl bg-slate-900/60 border border-slate-800 p-1">
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === "pending"
                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Clock className="w-4 h-4" />
              Pending Organizers
              {pendingOrganizers.length > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
                  {pendingOrganizers.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === "users"
                  ? "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" />
              All Users
              <span className="ml-1 px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 text-xs font-bold">
                {allUsers.length}
              </span>
            </button>
          </div>

          {/* Pending Organizers Tab */}
          {activeTab === "pending" && (
            <div className="space-y-4">
              {pendingOrganizers.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-800 p-12 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500/30" />
                  <p className="text-slate-500 text-lg">No pending organizer requests</p>
                  <p className="text-slate-600 text-sm mt-1">All organizer accounts have been reviewed.</p>
                </div>
              ) : (
                pendingOrganizers.map((org) => (
                  <div key={org.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex items-center justify-between group hover:border-amber-500/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-amber-500/10 p-3">
                        <Shield className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{org.email}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getRoleBadge(org.role || "ROLE_ORGANIZER")}`}>
                            {getRoleLabel(org.role || "ROLE_ORGANIZER")}
                          </span>
                          <span className="text-xs text-slate-500">
                            ID: {org.id}
                          </span>
                          {org.emailVerified && (
                            <span className="text-xs text-emerald-400 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Email Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(org.id)}
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <UserCheck className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(org.id)}
                        className="px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/30 text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <UserX className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* All Users Tab */}
          {activeTab === "users" && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/50">
                    <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                    <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</th>
                    <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Verified</th>
                    <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Approved</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((u) => (
                    <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-white">{u.email}</p>
                        <p className="text-xs text-slate-500 mt-0.5">ID: {u.id}</p>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getRoleBadge(u.role || "ROLE_PLAYER")}`}>
                          {getRoleLabel(u.role || "ROLE_PLAYER")}
                        </span>
                      </td>
                      <td className="p-4">
                        {u.emailVerified ? (
                          <span className="text-emerald-400 flex items-center gap-1 text-sm"><CheckCircle className="w-4 h-4" /> Yes</span>
                        ) : (
                          <span className="text-red-400 flex items-center gap-1 text-sm"><XCircle className="w-4 h-4" /> No</span>
                        )}
                      </td>
                      <td className="p-4">
                        {u.approved ? (
                          <span className="text-emerald-400 flex items-center gap-1 text-sm"><CheckCircle className="w-4 h-4" /> Yes</span>
                        ) : (
                          <span className="text-amber-400 flex items-center gap-1 text-sm"><Clock className="w-4 h-4" /> Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
