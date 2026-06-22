"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { Tournament } from '@/types';

const LIVE_REFRESH_MS = 3000;

export default function PublicTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    const loadTournaments = () => {
      api.get('/tournaments/get').then(({ data }) => setTournaments(data)).catch(() => {});
    };

    loadTournaments();
    const intervalId = window.setInterval(loadTournaments, LIVE_REFRESH_MS);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white">Public Tournaments</h1>
        <p className="text-slate-400 mt-1">Select a tournament to view live results and brackets.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map(tournament => (
          <Link href={`/tournaments/${tournament.id}`} key={tournament.id} className="group block">
            <div className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 h-full flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[30px] group-hover:bg-emerald-500/10 transition-colors" />
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="bg-slate-800 p-3 rounded-lg text-emerald-400">
                  <Trophy className="w-6 h-6" />
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  tournament.status === 'DRAFT' ? 'bg-slate-800 text-slate-300' :
                  tournament.status === 'ONGOING' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {tournament.status}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-1 relative z-10 text-white">{tournament.name}</h3>
              <p className="text-slate-400 text-sm mb-6 flex-1 relative z-10">
                Format: {tournament.format === 'ROUND_ROBIN' ? 'Round Robin' : 'Single Elimination'}
              </p>
              <div className="flex items-center justify-between text-emerald-400 text-sm font-medium relative z-10">
                <span>View Results</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
        {tournaments.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No active tournaments available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
