"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { User, Shield, LogOut, Trophy, Home, AlertTriangle, CheckCircle, Clock, Calendar, Activity, Loader2 } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Player, TeamApplication, Team } from "@/types";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [playerDetails, setPlayerDetails] = useState<Player | null>(null);
  const [applications, setApplications] = useState<TeamApplication[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    if (user?.email) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    setIsLoadingProfile(true);
    try {
      // Fetch full player list to find current user
      const playersRes = await api.get('/players/get');
      const currentUser = playersRes.data.find((p: Player) => p.email === user?.email);
      setPlayerDetails(currentUser || null);

      if (currentUser) {
        // Fetch applications history
        const applicationsRes = await api.get(`/teams/applications/player/${currentUser.id}`);
        setApplications(applicationsRes.data);

        // Fetch teams to map names securely
        const teamsRes = await api.get('/teams/get');
        setTeams(teamsRes.data);
      }
    } catch (error) {
      console.error("Failed to load profile details", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const getRoleLabel = () => {
    if (user?.role === "ROLE_ADMIN") return "Administrator";
    if (user?.role === "ROLE_ORGANIZER") return "Tournament Organizer";
    return "Player";
  };

  const getRoleColor = () => {
    if (user?.role === "ROLE_ADMIN") return "text-purple-400";
    if (user?.role === "ROLE_ORGANIZER") return "text-amber-400";
    return "text-blue-400";
  };

  const getTeamName = (teamId: number) => {
    const team = teams.find(t => t.id === teamId);
    return team?.name || `Team #${teamId}`;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6 md:p-10">
        <div className="mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Profile Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold flex items-center gap-3">
                My Profile
                {isLoadingProfile && <Loader2 className="w-5 h-5 animate-spin text-slate-500" />}
              </h1>
              <Link href="/" className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-slate-200 hover:bg-slate-900 transition-colors">
                <Home className="h-4 w-4" /> Home
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-[-50%] right-[-10%] w-[50%] h-[200%] bg-blue-500/5 rotate-12 blur-3xl pointer-events-none" />
              
              <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
                <div className="rounded-full bg-slate-800/80 border border-slate-700 p-6 flex-shrink-0">
                  <User className="h-12 w-12 text-slate-300" />
                </div>
                <div className="flex-1 space-y-1">
                  <h2 className="text-2xl font-bold">{playerDetails?.fullName || user?.email}</h2>
                  <p className="text-slate-400">{user?.email}</p>
                  
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-800/50">
                    <span className="flex items-center gap-1.5 text-sm">
                      <Shield className={`h-4 w-4 ${getRoleColor()}`} />
                      <span className={getRoleColor()}>{getRoleLabel()}</span>
                    </span>
                    {playerDetails?.registrationDate && (
                      <span className="flex items-center gap-1.5 text-sm text-slate-500">
                        <Calendar className="h-4 w-4" />
                        Joined {new Date(playerDetails.registrationDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <Link href="/tournaments" className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-medium hover:bg-emerald-500 transition-colors">
                <Trophy className="h-4 w-4" /> View Tournaments
              </Link>

              {(user?.role === "ROLE_ADMIN" || (user?.role === "ROLE_ORGANIZER" && user?.approved)) && (
                <Link href="/organizer" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium hover:bg-blue-500 transition-colors">
                  <Shield className="h-4 w-4" /> Organizer Dashboard
                </Link>
              )}

              {user?.role === "ROLE_ADMIN" && (
                <Link href="/admin" className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 font-medium hover:bg-purple-500 transition-colors">
                  <Shield className="h-4 w-4" /> Admin Panel
                </Link>
              )}

              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 px-4 py-2 font-medium text-red-300 hover:bg-red-500/10 transition-colors ml-auto"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>

            {/* Application History */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-sm mt-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
                <Activity className="h-5 w-5 text-blue-400" /> Team Applications History
              </h3>
              
              {isLoadingProfile ? (
                <div className="py-8 text-center text-slate-500"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading data...</div>
              ) : applications.length === 0 ? (
                <div className="py-8 text-center border-2 border-dashed border-slate-800 rounded-xl text-slate-500">
                  <p>You haven't applied to any teams yet.</p>
                  <Link href="/tournaments" className="text-blue-400 hover:underline mt-2 inline-block text-sm">Browse Tournaments</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.map((app) => (
                    <div key={app.id} className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl flex items-center justify-between hover:border-slate-700 transition-colors">
                      <div>
                        <div className="font-semibold text-white">Applied to {getTeamName(app.teamId)}</div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                          <Activity className="w-3 h-3" />
                          {new Date(app.createdAt || '').toLocaleString()}
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        app.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        app.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {app.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Side Panel (Stats & Status) */}
          <div className="space-y-6">
            
            {/* Player Stats */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-sm">
              <h3 className="text-lg font-bold mb-4 text-slate-200">Player Stats</h3>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-sm text-slate-400 uppercase tracking-widest font-semibold">ELO Rating</p>
                <div className="text-4xl font-black text-white mt-1">
                  {isLoadingProfile ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-700" /> : playerDetails?.eloRating || 1200}
                </div>
              </div>
            </div>

            {/* Account Status Flags */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Security Status</h3>
              
              {/* Email Verification Status */}
              <div className={`flex items-center gap-3 rounded-xl border p-4 shadow-sm ${
                user?.emailVerified
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-red-500/20 bg-red-500/5"
              }`}>
                {user?.emailVerified ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                    <p className="text-sm text-emerald-300 font-medium">Email verified</p>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <div>
                      <p className="text-sm text-red-300 font-medium">Email not verified</p>
                      <Link href="/verify-email" className="text-xs text-red-400 hover:text-red-300 underline">Verify now</Link>
                    </div>
                  </>
                )}
              </div>

              {/* Approval Status (Organizer-only) */}
              {user?.role === "ROLE_ORGANIZER" && (
                <div className={`flex items-center gap-3 rounded-xl border p-4 shadow-sm ${
                  user.approved
                    ? "border-emerald-500/20 bg-emerald-500/5"
                    : "border-amber-500/20 bg-amber-500/5"
                }`}>
                  {user.approved ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                      <p className="text-sm text-emerald-300 font-medium">Account approved</p>
                    </>
                  ) : (
                    <>
                      <Clock className="h-5 w-5 text-amber-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-amber-300 font-medium">Pending approval</p>
                        <p className="text-[11px] text-amber-400/70 mt-1 leading-tight">Admin needs to approve your organizer account.</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
