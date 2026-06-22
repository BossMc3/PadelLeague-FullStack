"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Trophy, Users, Plus, Swords, Save, UserCheck, UserX, Inbox } from 'lucide-react';
import axios from 'axios';
import { api } from '@/lib/api';
import { Match, Player, Team, TeamApplication, TeamStanding, Tournament } from '@/types';

const LIVE_REFRESH_MS = 3000;

export default function TournamentDetail() {
  const { id } = useParams();
  const tournamentId = Number(id);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [applications, setApplications] = useState<TeamApplication[]>([]);

  const [isRegistering, setIsRegistering] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');

  useEffect(() => {
    fetchTournament();
    fetchPlayers();
    fetchTeams();
    fetchMatches();
    fetchStandings();
    fetchApplications();
  }, [tournamentId]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      fetchTournament();
      fetchMatches();
      fetchStandings();
    }, LIVE_REFRESH_MS);

    return () => window.clearInterval(intervalId);
  }, [tournamentId]);

  const fetchTournament = async () => {
    const { data } = await api.get('/tournaments/get');
    const current = data.find((item: Tournament) => item.id === tournamentId) ?? null;
    setTournament(current);
  };

  const fetchPlayers = async () => {
    const { data } = await api.get('/players/get');
    setPlayers(data);
  };

  const fetchTeams = async () => {
    const { data } = await api.get('/teams/get');
    const tournamentTeams = data.filter((team: Team) => Number(team.tournamentId) === tournamentId);
    setTeams(tournamentTeams);
  };

  const fetchMatches = async () => {
    const { data } = await api.get(`/matches/tournament/${tournamentId}`);
    setMatches(data);
  };

  const fetchStandings = async () => {
    const { data } = await api.get(`/matches/tournament/${tournamentId}/standings`);
    setStandings(Array.isArray(data) ? data : []);
  };

  const fetchApplications = async () => {
    try {
      const { data } = await api.get(`/teams/applications/tournament/${tournamentId}`);
      setApplications(data);
    } catch (error) {
      console.error('Failed to fetch applications', error);
    }
  };

  const handleAcceptApplication = async (applicationId: number) => {
    try {
      await api.post(`/teams/applications/accept/${applicationId}`);
      fetchApplications();
      fetchTeams();
    } catch (error) {
      console.error('Failed to accept application', error);
    }
  };

  const handleRejectApplication = async (applicationId: number) => {
    try {
      await api.post(`/teams/applications/reject/${applicationId}`);
      fetchApplications();
    } catch (error) {
      console.error('Failed to reject application', error);
    }
  };

  const findPlayerIdByEmail = (list: Player[], email: string) => {
    const normalized = email.trim().toLowerCase();
    const found = list.find((player) => player.email?.trim().toLowerCase() === normalized);
    return found?.id;
  };

  const createPlayerAndResolveId = async (fullName: string, email: string) => {
    const existingFromState = findPlayerIdByEmail(players, email);
    if (existingFromState) {
      return existingFromState;
    }

    const { data: playersBeforeCreate } = await api.get('/players/get');
    const existingFromApi = findPlayerIdByEmail(playersBeforeCreate, email);
    if (existingFromApi) {
      return existingFromApi;
    }

    try {
      await api.post('/players/add', {
        fullName,
        email,
        password: 'player',
        eloRating: 1200,
        team: '',
        role: 'ROLE_PLAYER',
      });
    } catch (error: unknown) {
      if (!(axios.isAxiosError(error) && error.response?.status === 400)) {
        throw error;
      }
      // For 400 (most often duplicate email), resolve existing player below.
    }

    const { data } = await api.get('/players/get');
    const created = [...data].reverse().find((player: Player) => player.email === email);
    if (!created) {
      throw new Error(`Unable to resolve player for email ${email} after create/fallback.`);
    }

    return created.id;
  };

  const handleRegisterTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newTeamName.trim()) {
        alert('Please provide a team name.');
        return;
      }

      await api.post('/teams/add', {
        name: newTeamName.trim(),
        tournamentId,
        teamPlayers: [],
      });

      setIsRegistering(false);
      setNewTeamName('');
      fetchTeams();
      fetchMatches();
      fetchStandings();
    } catch (error: unknown) {
      console.error('Failed to register team', error);
      alert('Failed to register empty team. Make sure the backend server is running correctly.');
    }
  };

  const handleGenerateBracket = async () => {
    try {
      await api.post(`/matches/generate/${tournamentId}`);
      fetchMatches();
      fetchTournament();
      fetchStandings();
    } catch (error) {
      console.error('Failed to generate bracket', error);
      alert('Failed to generate matches. Make sure you have at least 2 teams.');
    }
  };

  const handleScoreSave = async (matchId: number, score1: number, score2: number) => {
    try {
      await api.put(`/matches/${matchId}/score?score1=${score1}&score2=${score2}`);
      fetchMatches();
      fetchTournament();
      fetchStandings();
    } catch (error) {
      console.error('Failed to update score', error);
      if (tournament?.format === 'ROUND_ROBIN') {
        alert('Failed to save score for round robin match.');
      } else {
        alert('Failed to save score. Draw is not allowed in elimination bracket.');
      }
    }
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

  const sortedRounds = Object.keys(matchesByRound).map(Number).sort((a, b) => a - b);
  const isRoundRobin = tournament?.format === 'ROUND_ROBIN';

  if (!tournament) return <div className="p-8 text-center animate-pulse">Loading tournament...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Navigation aid */}
      <div className="flex">
        <Link href="/organizer" className="text-slate-400 hover:text-emerald-400 flex items-center gap-2 transition-colors font-medium text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-[50%] h-[200%] bg-blue-500/5 rotate-12 blur-3xl" />
        <div className="flex items-center gap-4 mb-4 relative z-10">
          <div className="bg-blue-500/20 p-4 rounded-xl">
            <Trophy className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{tournament.name}</h1>
            <div className="flex gap-3 mt-2 text-sm">
              <span className="bg-blue-900/40 text-blue-400 px-3 py-1 rounded-full">
                {tournament.status}
              </span>
              <span className="bg-slate-800 text-slate-200 px-3 py-1 rounded-full">
                {isRoundRobin ? 'ROUND ROBIN' : 'SINGLE ELIMINATION'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Users className="text-blue-400 w-6 h-6" /> Teams ({teams.length})
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setIsRegistering(!isRegistering)}
                className="bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Team
              </button>
            </div>
          </div>

          {isRegistering && (
            <form onSubmit={handleRegisterTeam} className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
              <div>
                <label className="text-sm text-slate-300 font-semibold mb-2 block">Team Name</label>
                <input 
                  placeholder="e.g. Real Madrid Padel" 
                  required 
                  value={newTeamName} 
                  onChange={e => setNewTeamName(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" 
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsRegistering(false)} 
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
                >
                  Create Empty Team
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {teams.map(team => (
              <div key={team.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">{team.name}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {team.teamPlayers.length > 0 ? team.teamPlayers.map(player => player.fullName).join(' & ') : 'No players in this team yet'}
                  </div>
                </div>
                <div className="text-sm font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded">Team #{team.id}</div>
              </div>
            ))}
            {teams.length === 0 && !isRegistering && (
              <div className="text-center p-8 border-2 border-dashed border-slate-800 rounded-xl text-slate-500">
                No teams registered.
              </div>
            )}
          </div>
        </div>

        {/* Team Applications Section */}
        {applications.length > 0 && (
          <div className="space-y-4 col-span-full">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Inbox className="w-6 h-6 text-amber-400" /> Player Applications
              <span className="ml-2 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-sm font-bold">
                {applications.length}
              </span>
            </h2>
            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app.id} className="bg-slate-900/50 border border-amber-500/20 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{app.playerEmail}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Wants to join: <strong className="text-slate-300">{teamById.get(app.teamId)?.name ?? `Team #${app.teamId}`}</strong>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptApplication(app.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      <UserCheck className="w-4 h-4" /> Accept
                    </button>
                    <button
                      onClick={() => handleRejectApplication(app.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/30 text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      <UserX className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Swords className="w-6 h-6 text-emerald-400" /> {isRoundRobin ? 'Match Schedule' : 'Bracket'}
            </h2>
            <button
              type="button"
              disabled={teams.length < 2}
              onClick={handleGenerateBracket}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm font-medium"
            >
              Generate / Regenerate
            </button>
          </div>

          {matches.length === 0 ? (
            <div className="text-center p-8 border-2 border-dashed border-slate-800 rounded-xl text-slate-500">
              Generate matches after registering teams.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <div className="flex gap-4 min-w-max pb-2">
                  {sortedRounds.map((round) => (
                    <div key={round} className="w-72">
                      <h3 className="font-semibold mb-3 text-slate-200">Round {round}</h3>
                      <div className="space-y-3">
                        {matchesByRound[round].map((match) => (
                          <div key={match.id} className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                            <div className="text-xs text-slate-400 mb-2">Match #{match.roundMatchIndex + 1}</div>
                            <div className="text-sm text-slate-100">{resolveTeamName(match.team1Id)}</div>
                            <div className="text-xs text-slate-500">{match.score1}</div>
                            <div className="my-1 border-t border-slate-800" />
                            <div className="text-sm text-slate-100">{resolveTeamName(match.team2Id)}</div>
                            <div className="text-xs text-slate-500">{match.score2}</div>
                            <div className="mt-2 text-xs text-emerald-400">
                              {match.winnerId ? `Winner: ${resolveTeamName(match.winnerId)}` : (match.status === 'FINISHED' && isRoundRobin ? 'Draw' : match.status)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Score Entry</h3>
                {matches.filter((match) => match.team1Id && match.team2Id).map((match) => (
                  <MatchScoreEditor
                    key={match.id}
                    match={match}
                    team1Name={resolveTeamName(match.team1Id)}
                    team2Name={resolveTeamName(match.team2Id)}
                    allowDraw={isRoundRobin}
                    onSave={handleScoreSave}
                  />
                ))}
              </div>

              {isRoundRobin && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Standings</h3>
                  <div className="overflow-x-auto rounded-lg border border-slate-800">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-900/80 text-slate-300">
                        <tr>
                          <th className="text-left px-3 py-2">#</th>
                          <th className="text-left px-3 py-2">Team</th>
                          <th className="text-right px-3 py-2">P</th>
                          <th className="text-right px-3 py-2">W</th>
                          <th className="text-right px-3 py-2">D</th>
                          <th className="text-right px-3 py-2">L</th>
                          <th className="text-right px-3 py-2">PF</th>
                          <th className="text-right px-3 py-2">PA</th>
                          <th className="text-right px-3 py-2">GD</th>
                          <th className="text-right px-3 py-2">Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings.map((row) => (
                          <tr key={row.teamId} className="border-t border-slate-800 text-slate-100">
                            <td className="px-3 py-2">{row.position}</td>
                            <td className="px-3 py-2">{row.teamName}</td>
                            <td className="px-3 py-2 text-right">{row.played}</td>
                            <td className="px-3 py-2 text-right">{row.wins}</td>
                            <td className="px-3 py-2 text-right">{row.draws}</td>
                            <td className="px-3 py-2 text-right">{row.losses}</td>
                            <td className="px-3 py-2 text-right">{row.scoreFor}</td>
                            <td className="px-3 py-2 text-right">{row.scoreAgainst}</td>
                            <td className="px-3 py-2 text-right">{row.scoreDifference}</td>
                            <td className="px-3 py-2 text-right font-semibold">{row.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <h3 className="text-lg font-semibold mb-2">Registered Players ({players.length})</h3>
            <p className="text-sm text-slate-400">Players are shared globally in the current backend implementation.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MatchScoreEditor({
  match,
  team1Name,
  team2Name,
  allowDraw,
  onSave,
}: {
  match: Match;
  team1Name: string;
  team2Name: string;
  allowDraw: boolean;
  onSave: (matchId: number, score1: number, score2: number) => void;
}) {
  const [score1, setScore1] = useState<number>(match.score1 ?? 0);
  const [score2, setScore2] = useState<number>(match.score2 ?? 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3 text-sm">
        <span className="text-slate-300">Round {match.roundNumber}</span>
        <span className="text-slate-500">{match.status}</span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="text-sm">
          <p className="text-slate-100 mb-1">{team1Name}</p>
          <input
            type="number"
            value={score1}
            min={0}
            onChange={(e) => setScore1(Number(e.target.value))}
            className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1"
          />
        </div>
        <span className="text-slate-600">VS</span>
        <div className="text-sm text-right">
          <p className="text-slate-100 mb-1">{team2Name}</p>
          <input
            type="number"
            value={score2}
            min={0}
            onChange={(e) => setScore2(Number(e.target.value))}
            className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1"
          />
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          disabled={!allowDraw && score1 === score2}
          onClick={() => onSave(match.id, score1, score2)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg text-sm"
        >
          <Save className="w-4 h-4" /> Save
        </button>
      </div>
    </div>
  );
}
