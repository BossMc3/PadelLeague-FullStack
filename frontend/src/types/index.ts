export interface Player {
  id: number;
  fullName: string;
  email: string;
  password?: string;
  eloRating: number;
  team?: string;
  role?: string;
  emailVerified?: boolean;
  approved?: boolean;
  registrationDate?: string;
}

export interface Tournament {
  id: number;
  name: string;
  status: string;
  format?: 'SINGLE_ELIMINATION' | 'ROUND_ROBIN';
  championTeamId?: number | null;
  organizerId: number;
  creationDate?: string;
}

export interface TeamStanding {
  position: number;
  teamId: number;
  teamName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  scoreFor: number;
  scoreAgainst: number;
  scoreDifference: number;
}

export interface Team {
  id: number;
  name: string;
  tournamentId: number;
  teamPlayers: Player[];
}

export interface Match {
  id: number;
  tournamentId: number;
  roundNumber: number;
  roundMatchIndex: number;
  team1Id?: number | null;
  team2Id?: number | null;
  score1: number;
  score2: number;
  status: string;
  winnerId?: number | null;
  nextMatchId?: number | null;
  nextMatchSlot?: number | null;
}

export interface TeamApplication {
  id: number;
  playerId: number;
  playerEmail: string;
  teamId: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt?: string;
}
