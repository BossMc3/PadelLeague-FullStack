"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { User, Trophy, TrendingUp, Activity, ArrowLeft, Users } from 'lucide-react';
import { api } from '@/lib/api';
import { Player, Team, Tournament } from '@/types';

export default function PlayerProfile() {
  const { id } = useParams();
  const playerId = Number(id);
  const [player, setPlayer] = useState<Player | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    api.get(`/players/get/${playerId}`).then(res => {
      const current = Array.isArray(res.data) ? res.data[0] : null;
      setPlayer(current);
    }).catch();

    api.get('/teams/get').then(res => setTeams(res.data)).catch();
    api.get('/tournaments/get').then(res => setTournaments(res.data)).catch();
  }, [playerId]);

  if (!player) return <div className="p-8 text-center animate-pulse">Loading Player Stats...</div>;

  const playerTeams = teams.filter(team => team.teamPlayers.some(member => member.id === player.id));
  const tournamentsParticipated = tournaments.filter(tournament =>
    playerTeams.some(team => Number(team.tournamentId) === tournament.id)
  );
  const teammates = new Set(
    playerTeams
      .flatMap(team => team.teamPlayers)
      .filter(member => member.id !== player.id)
      .map(member => member.fullName)
  );
  const registrationDate = player.registrationDate ? new Date(player.registrationDate) : null;
  
  let rank = "Bronze";
  let rankColor = "text-amber-600 bg-amber-500/10 border-amber-500/20";
  if (player.eloRating > 1400) { rank = "Silver"; rankColor = "text-slate-400 bg-slate-400/10 border-slate-400/20"; }
  if (player.eloRating > 1800) { rank = "Gold"; rankColor = "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"; }
  if (player.eloRating > 2200) { rank = "Diamond"; rankColor = "text-cyan-400 bg-cyan-400/10 border-cyan-400/20"; }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-3xl mb-8">
        <Link href="/" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" /> Back Home
        </Link>
      </div>

      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-20 ${rankColor.split(' ')[0].replace('text', 'bg')}`} />
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="w-32 h-32 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center shadow-inner">
            <User className="w-16 h-16 text-slate-400" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-bold mb-2">{player.fullName}</h1>
            <div className="text-slate-400 text-lg mb-4">{player.email}</div>
            <span className={`px-4 py-1.5 rounded-full font-bold border ${rankColor}`}>
              {rank} Rank
            </span>
            <p className="text-xs text-slate-500 mt-3">
              Registered: {registrationDate ? registrationDate.toLocaleDateString() : 'Unknown'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 relative z-10">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center">
            <Activity className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <div className="text-sm text-slate-400 uppercase font-semibold mb-1">Elo Rating</div>
            <div className="text-3xl font-bold text-white">{player.eloRating}</div>
          </div>
          
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center">
            <Trophy className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
            <div className="text-sm text-slate-400 uppercase font-semibold mb-1">Tournaments</div>
            <div className="text-3xl font-bold text-white">{tournamentsParticipated.length}</div>
            <div className="text-xs text-slate-500 mt-1">Participations</div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center">
            <Users className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <div className="text-sm text-slate-400 uppercase font-semibold mb-1">Unique Teammates</div>
            <div className="text-3xl font-bold text-white">{teammates.size}</div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
            <h2 className="font-semibold mb-3">Teams</h2>
            <div className="space-y-2 text-sm text-slate-300">
              {playerTeams.length === 0 && <p className="text-slate-500">No teams found yet.</p>}
              {playerTeams.map(team => (
                <p key={team.id}>{team.name} (Tournament #{team.tournamentId})</p>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
            <h2 className="font-semibold mb-3">Available Stats</h2>
            <p className="text-sm text-slate-400">
              Wins/losses and match-by-match history are not exposed by the current backend API.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
