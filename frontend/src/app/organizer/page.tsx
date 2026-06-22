"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Trophy, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { Player, Tournament } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function OrganizerDashboard() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTournament, setNewTournament] = useState({
    name: '',
    format: 'SINGLE_ELIMINATION' as 'SINGLE_ELIMINATION' | 'ROUND_ROBIN',
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchTournaments();
    fetchPlayers();
  }, []);

  const fetchTournaments = async () => {
    try {
      const { data } = await api.get('/tournaments/get');
      setTournaments(data);
    } catch (error) {
      console.error('Failed to fetch tournaments', error);
    }
  };

  const fetchPlayers = async () => {
    try {
      const { data } = await api.get('/players/get');
      setPlayers(data);
    } catch (error) {
      console.error('Failed to fetch players', error);
    }
  };

  const getOrganizerId = () => {
    if (!user) return 0;
    const me = players.find(p => p.email === user.email);
    return me?.id ?? 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const organizerId = getOrganizerId();
      if (!organizerId) {
        alert('Could not resolve your organizer profile. Please try again.');
        return;
      }
      await api.post('/tournaments/add', {
        name: newTournament.name,
        status: 'DRAFT',
        format: newTournament.format,
        organizerId,
      });
      setIsCreating(false);
      setNewTournament({ name: '', format: 'SINGLE_ELIMINATION' });
      fetchTournaments();
    } catch (error) {
      console.error('Failed to create tournament', error);
    }
  };

  return (
  <ProtectedRoute requireOrganizer>
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tournaments</h1>
          <p className="text-slate-400 mt-1">Manage your active and completed tournaments.</p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Tournament
        </button>
      </div>

      {isCreating && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
          <h2 className="text-xl font-bold mb-4">New Tournament</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Tournament Name</label>
              <input
                type="text"
                required
                value={newTournament.name}
                onChange={e => setNewTournament({ ...newTournament, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                placeholder="e.g. Summer Padel Cup 2026"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Format</label>
              <select
                value={newTournament.format}
                onChange={e => setNewTournament({
                  ...newTournament,
                  format: e.target.value as 'SINGLE_ELIMINATION' | 'ROUND_ROBIN',
                })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              >
                <option value="SINGLE_ELIMINATION">Single Elimination</option>
                <option value="ROUND_ROBIN">Round Robin</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map(tournament => (
          <Link href={`/organizer/${tournament.id}`} key={tournament.id} className="group block">
            <div className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 h-full flex flex-col relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[30px] group-hover:bg-blue-500/10 transition-colors" />
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="bg-slate-800 p-3 rounded-lg text-blue-400">
                  <Trophy className="w-6 h-6" />
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  tournament.status === 'DRAFT' ? 'bg-slate-800 text-slate-300' :
                  tournament.status === 'ONGOING' ? 'bg-green-500/20 text-green-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {tournament.status}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-1 relative z-10">{tournament.name}</h3>
              <p className="text-slate-400 text-sm mb-6 flex-1 relative z-10">
                Organizer ID: {tournament.organizerId}
              </p>
              <p className="text-xs text-slate-500 mb-2 relative z-10">
                Format: {tournament.format === 'ROUND_ROBIN' ? 'Round Robin' : 'Single Elimination'}
              </p>
              <div className="flex items-center justify-between text-blue-400 text-sm font-medium relative z-10">
                <span>Manage</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
        {tournaments.length === 0 && !isCreating && (
          <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No tournaments yet. Click "Create Tournament" to start.</p>
          </div>
        )}
      </div>
    </div>
  </ProtectedRoute>
  );
}
