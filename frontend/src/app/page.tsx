"use client";

import Link from 'next/link';
import { Trophy, Settings, Users, User, LogIn, UserPlus, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, isLoading, logout } = useAuth();
  const canSeeOrganizerDashboard = !isLoading && (user?.role === 'ROLE_ADMIN' || (user?.role === 'ROLE_ORGANIZER' && user.approved));
  const canSeeAdminDashboard = !isLoading && user?.role === 'ROLE_ADMIN';

  const getGridCols = () => {
    let count = 2; // Tournaments + Profile always shown
    if (canSeeOrganizerDashboard) count++;
    if (canSeeAdminDashboard) count++;
    if (count >= 4) return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl z-10';
    if (count === 3) return 'grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl z-10';
    return 'grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl z-10';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col relative overflow-hidden">
      {/* Top navigation bar */}
      <nav className="w-full px-6 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-blue-400" />
          <span className="font-bold text-lg tracking-tight">Padel<span className="text-blue-500">League</span></span>
        </div>
        <div className="flex items-center gap-3">
          {!isLoading && !user && (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" /> Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" /> Sign Up
              </Link>
            </>
          )}
          {!isLoading && user && (
            <>
              <Link href="/profile" className="px-3 py-2 text-sm text-slate-300 hover:text-white transition-colors">
                {user.email}
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/20 blur-[100px]" />

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="z-10 text-center mb-12">
          <Trophy className="w-20 h-20 text-blue-400 mx-auto mb-6" />
          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
            Padel<span className="text-blue-500">League</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-xl mx-auto">
            The ultimate platform to organize, manage, and follow your padel tournaments in real-time.
          </p>
        </div>

        <div className={getGridCols()}>
          {canSeeAdminDashboard && (
            <Link href="/admin" className="group">
              <div className="glass-dark hover:bg-slate-800/80 transition-all duration-300 rounded-2xl p-8 h-full border border-slate-700 hover:border-purple-500/50 flex flex-col items-center text-center">
                <div className="bg-purple-500/10 p-4 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-10 h-10 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Admin Panel</h2>
                <p className="text-slate-400">
                  Approve organizer accounts, manage users, and oversee the platform.
                </p>
              </div>
            </Link>
          )}

          {canSeeOrganizerDashboard && (
            <Link href="/organizer" className="group">
              <div className="glass-dark hover:bg-slate-800/80 transition-all duration-300 rounded-2xl p-8 h-full border border-slate-700 hover:border-blue-500/50 flex flex-col items-center text-center">
                <div className="bg-blue-500/10 p-4 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Settings className="w-10 h-10 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Organizer Dashboard</h2>
                <p className="text-slate-400">
                  Create tournaments, manage teams, and review player applications.
                </p>
              </div>
            </Link>
          )}

          <Link href="/tournaments" className="group">
            <div className="glass-dark hover:bg-slate-800/80 transition-all duration-300 rounded-2xl p-8 h-full border border-slate-700 hover:border-emerald-500/50 flex flex-col items-center text-center">
              <div className="bg-emerald-500/10 p-4 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Tournaments</h2>
              <p className="text-slate-400">
                View live brackets, standings, and match results. No login required.
              </p>
            </div>
          </Link>

          <Link href="/profile" className="group">
            <div className="glass-dark hover:bg-slate-800/80 transition-all duration-300 rounded-2xl p-8 h-full border border-slate-700 hover:border-cyan-500/50 flex flex-col items-center text-center">
              <div className="bg-cyan-500/10 p-4 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                <User className="w-10 h-10 text-cyan-300" />
              </div>
              <h2 className="text-2xl font-bold mb-3">My Profile</h2>
              <p className="text-slate-400">
                View your account after login/register and manage your current session.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
