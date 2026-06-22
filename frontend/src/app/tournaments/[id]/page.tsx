"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Trophy, Activity, Users, UserPlus, CheckCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Match, Team, TeamApplication, TeamStanding, Tournament } from '@/types';
import TournamentBracket from '@/components/TournamentBracket';
import { useAuth } from '@/context/AuthContext';

const LIVE_REFRESH_MS = 3000;

export default function PublicTournamentDetail() {
  const { id } = useParams();
  const tournamentId = Number(id);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [myApplications, setMyApplications] = useState<TeamApplication[]>([]);
  const [applyingTo, setApplyingTo] = useState<number | null>(null);
  const [applyMessage, setApplyMessage] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const loadTournamentData = () => {
      api.get('/tournaments/get').then(res => {
        const current = res.data.find((item: Tournament) => item.id === tournamentId) ?? null;
        setTournament(current);
      }).catch(() => {});

      api.get('/teams/get').then(res => {
        const list = res.data.filter((team: Team) => Number(team.tournamentId) === tournamentId);
        setTeams(list);
      }).catch(() => {});

      api.get(`/matches/tournament/${tournamentId}`).then(res => setMatches(res.data)).catch(() => {});
      api.get(`/matches/tournament/${tournamentId}/standings`).then(res => setStandings(Array.isArray(res.data) ? res.data : [])).catch(() => {});
    };

    loadTournamentData();
    const intervalId = window.setInterval(loadTournamentData, LIVE_REFRESH_MS);
    return () => window.clearInterval(intervalId);
  }, [tournamentId]);

  // Fetch player's own applications
  useEffect(() => {
    if (user) {
      api.get('/players/get').then(res => {
        const me = res.data.find((p: { email: string }) => p.email === user.email);
        if (me) {
          api.get(`/teams/applications/player/${me.id}`)
            .then(appRes => setMyApplications(appRes.data))
            .catch(() => {});
        }
      }).catch(() => {});
    }
  }, [user, applyMessage]);

  const handleApplyToTeam = async (teamId: number) => {
    if (!user) return;
    setApplyingTo(teamId);
    setApplyMessage('');
    try {
      const playersRes = await api.get('/players/get');
      const me = playersRes.data.find((p: { email: string }) => p.email === user.email);
      if (!me) {
        setApplyMessage('Player profile not found.');
        setApplyingTo(null);
        return;
      }
      const { data } = await api.post(`/teams/apply?playerId=${me.id}&playerEmail=${me.email}&teamId=${teamId}`);
      setApplyMessage(data);
    } catch (err) {
      setApplyMessage('Failed to submit application.');
    } finally {
      setApplyingTo(null);
    }
  };

  const hasAppliedToTeam = (teamId: number) => {
    return myApplications.some(app => app.teamId === teamId && app.status === 'PENDING');
  };

  const isAcceptedInTeam = (teamId: number) => {
    return myApplications.some(app => app.teamId === teamId && app.status === 'ACCEPTED');
  };

  const teamById = new Map<number, Team>(teams.map((team) => [team.id, team]));
  const resolveTeamName = (teamId?: number | null) => {
    if (!teamId) {
      return 'TBD';
    }
    return teamById.get(teamId)?.name ?? `Team #${teamId}`;
  };

  const matchesByRound = matches.reduce<Record<number, Match[]>>((acc, match) => {
    if (!acc[match.roundNumber]) {
      acc[match.roundNumber] = [];
    }
    acc[match.roundNumber].push(match);
    return acc;
  }, {});

  Object.keys(matchesByRound).forEach((key) => {
    const round = Number(key);
    matchesByRound[round].sort((a, b) => a.roundMatchIndex - b.roundMatchIndex);
  });

  const isRoundRobin = tournament?.format === 'ROUND_ROBIN';
  const finalMatch = matches.length > 0 ? matches[matches.length - 1] : null;
  const championTeam = tournament?.championTeamId
    ? teamById.get(tournament.championTeamId) ?? null
    : (finalMatch?.winnerId ? teamById.get(finalMatch.winnerId) ?? null : null);

  if (!tournament) return <div className="p-8 text-center animate-pulse text-slate-400">Loading tournament...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Navigation aid */}
      <div className="flex">
        <Link href="/" className="text-slate-400 hover:text-emerald-400 flex items-center gap-2 transition-colors font-medium text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Homepage
        </Link>
      </div>

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-[50%] h-[200%] bg-emerald-500/5 rotate-12 blur-3xl" />
        <div className="flex items-center gap-4 mb-4 relative z-10">
          <div className="bg-emerald-500/20 p-4 rounded-xl">
            <Trophy className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{tournament.name}</h1>
            <div className="flex gap-3 mt-2 text-sm">
              <span className="bg-emerald-900/40 text-emerald-400 px-3 py-1 rounded-full flex items-center gap-1">
                <Activity className="w-3 h-3" /> {tournament.status}
              </span>
              <span className="bg-slate-800 text-slate-200 px-3 py-1 rounded-full">
                {isRoundRobin ? 'ROUND ROBIN' : 'SINGLE ELIMINATION'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bracket */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
          <Trophy className="w-5 h-5 text-emerald-400" /> Bracket
        </h2>
        <TournamentBracket teams={teams} championName={championTeam?.name ?? null} />
      </div>

      {/* Tournament Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-6 border-b border-slate-800 pb-4 text-white">Tournament Overview</h2>
        <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300">
          <p className="font-medium">Status: {tournament.status}</p>
          <p className="font-medium mt-2">Champion: {championTeam?.name ?? 'TBD'}</p>
          <p className="text-sm text-slate-500 mt-2">
            Status and champion are synced live from match results.
          </p>
        </div>
      </div>

      {/* Match Winners */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-6 border-b border-slate-800 pb-4 text-white">Match Winners</h2>
        <div className="space-y-2">
          {matches.filter((match) => match.status === 'FINISHED').length === 0 && (
            <p className="text-sm text-slate-500">No finished matches yet.</p>
          )}
          {matches
            .filter((match) => match.status === 'FINISHED')
            .map((match) => (
              <p key={match.id} className="text-sm text-slate-300">
                Round {match.roundNumber}, Match {match.roundMatchIndex + 1}: {match.winnerId ? resolveTeamName(match.winnerId) : 'Draw'}
              </p>
            ))}
        </div>
      </div>

      {/* Teams list */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-6 border-b border-slate-800 pb-4 flex items-center gap-2 text-white">
          <Users className="w-5 h-5 text-emerald-400" /> Registered Teams ({teams.length})
        </h2>

        {applyMessage && (
          <div className="mb-4 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <p className="text-sm text-blue-200">{applyMessage}</p>
            <button onClick={() => setApplyMessage('')} className="ml-auto text-blue-400 hover:text-white text-sm">✕</button>
          </div>
        )}

        {teams.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-700 rounded-lg text-slate-500">
            No teams registered in this tournament yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.map(team => (
              <div key={team.id} className="p-4 border border-slate-800 rounded-lg bg-slate-800/40">
                <p className="font-semibold text-white">{team.name}</p>
                <div className="mt-2 text-sm text-slate-400 space-y-1">
                  {team.teamPlayers.map(player => (
                    <Link key={player.id} href={`/players/${player.id}`} className="block hover:text-emerald-400 hover:underline">
                      {player.fullName} • ELO {player.eloRating}
                    </Link>
                  ))}
                  {team.teamPlayers.length === 0 && <span>No players assigned yet</span>}
                </div>

                {/* Apply to Team button for Players */}
                {user && user.role === 'ROLE_PLAYER' && (
                  <div className="mt-3">
                    {isAcceptedInTeam(team.id) ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                        <CheckCircle className="w-3 h-3" /> You are a member
                      </span>
                    ) : hasAppliedToTeam(team.id) ? (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-400">
                        <Loader2 className="w-3 h-3" /> Application pending
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApplyToTeam(team.id)}
                        disabled={applyingTo === team.id}
                        className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors disabled:opacity-50"
                      >
                        <UserPlus className="w-3 h-3" />
                        {applyingTo === team.id ? 'Applying...' : 'Apply to Join'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
