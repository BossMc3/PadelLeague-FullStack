package ro.ddc.liga.service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import ro.ddc.liga.dto.TeamStandingDto;
import ro.ddc.liga.model.Match;
import ro.ddc.liga.model.Player;
import ro.ddc.liga.model.Status;
import ro.ddc.liga.model.Team;
import ro.ddc.liga.model.Tournament;
import ro.ddc.liga.repository.MatchRepository;
import ro.ddc.liga.repository.PlayerRepository;
import ro.ddc.liga.repository.TeamRepository;
import ro.ddc.liga.repository.TournamentRepository;

@Service
public class MatchService {
    private static final String FORMAT_SINGLE_ELIMINATION = "SINGLE_ELIMINATION";
    private static final String FORMAT_ROUND_ROBIN = "ROUND_ROBIN";
    private static final int ELO_K_FACTOR = 24;
    private static final int MIN_ELO = 100;

    private final MatchRepository matchRepository;
    private final TeamRepository teamRepository;
    private final TournamentRepository tournamentRepository;
    private final PlayerRepository playerRepository;

    public MatchService(
            MatchRepository matchRepository,
            TeamRepository teamRepository,
            TournamentRepository tournamentRepository,
            PlayerRepository playerRepository
    ) {
        this.matchRepository = matchRepository;
        this.teamRepository = teamRepository;
        this.tournamentRepository = tournamentRepository;
        this.playerRepository = playerRepository;
    }

    public List<Match> getTournamentMatches(int tournamentId) {
        reconcileTournamentState(tournamentId);
        return matchRepository.findByTournamentIdOrderByRoundNumberAscRoundMatchIndexAsc(tournamentId);
    }

    public List<Match> generateMatches(int tournamentId) {
        Tournament tournament = requireTournament(tournamentId);
        String format = normalizeFormat(tournament.getFormat());

        if (FORMAT_ROUND_ROBIN.equals(format)) {
            return generateRoundRobin(tournament);
        }

        return generateSingleElimination(tournament);
    }

    public List<TeamStandingDto> getRoundRobinStandings(int tournamentId) {
        reconcileTournamentState(tournamentId);
        Tournament tournament = requireTournament(tournamentId);
        String format = normalizeFormat(tournament.getFormat());
        if (!FORMAT_ROUND_ROBIN.equals(format)) {
            return List.of();
        }

        return computeRoundRobinStandings(tournamentId);
    }

    public void reconcileTournamentState(int tournamentId) {
        Tournament tournament = requireTournament(tournamentId);
        String format = normalizeFormat(tournament.getFormat());
        List<Match> matches = matchRepository.findByTournamentIdOrderByRoundNumberAscRoundMatchIndexAsc(tournamentId);

        String nextStatus = tournament.getStatus();
        Integer nextChampionTeamId = tournament.getChampionTeamId();

        if (matches.isEmpty()) {
            nextStatus = "DRAFT";
            nextChampionTeamId = null;
        } else if (FORMAT_SINGLE_ELIMINATION.equals(format)) {
            Match finalMatch = matches.stream()
                    .max(Comparator.comparingInt(Match::getRoundNumber)
                            .thenComparingInt(Match::getRoundMatchIndex))
                    .orElse(null);

            if (finalMatch != null && Status.FINISHED.equals(finalMatch.getStatus()) && finalMatch.getWinnerId() != null) {
                nextStatus = "COMPLETED";
                nextChampionTeamId = finalMatch.getWinnerId();
            } else {
                nextStatus = "ONGOING";
                nextChampionTeamId = null;
            }
        } else {
            boolean allFinished = matches.stream().allMatch(match -> Status.FINISHED.equals(match.getStatus()));
            if (allFinished) {
                List<TeamStandingDto> standings = computeRoundRobinStandings(tournamentId);
                nextStatus = "COMPLETED";
                nextChampionTeamId = standings.isEmpty() ? null : standings.get(0).getTeamId();
            } else {
                nextStatus = "ONGOING";
                nextChampionTeamId = null;
            }
        }

        boolean statusChanged = !safeEquals(tournament.getStatus(), nextStatus);
        boolean championChanged = !safeEquals(tournament.getChampionTeamId(), nextChampionTeamId);
        if (statusChanged || championChanged) {
            tournament.setStatus(nextStatus);
            tournament.setChampionTeamId(nextChampionTeamId);
            tournamentRepository.save(tournament);
        }
    }

    private List<Match> generateSingleElimination(Tournament tournament) {
        int tournamentId = tournament.getId();
        List<Team> teams = teamRepository.findByTournamentId(tournamentId);
        if (teams.size() < 2) {
            throw new IllegalArgumentException("At least 2 teams are required to generate bracket.");
        }

        List<Match> existing = matchRepository.findByTournamentId(tournamentId);
        if (!existing.isEmpty()) {
            matchRepository.deleteAll(existing);
        }

        int bracketSize = 1;
        while (bracketSize < teams.size()) {
            bracketSize *= 2;
        }

        int rounds = (int) (Math.log(bracketSize) / Math.log(2));
        List<List<Match>> roundsData = new ArrayList<>();

        // Prepare seeded first round slots with nulls for byes.
        List<Integer> slots = new ArrayList<>();
        for (Team team : teams) {
            slots.add(team.getId().intValue());
        }
        while (slots.size() < bracketSize) {
            slots.add(null);
        }

        // Create matches round by round.
        for (int round = 1; round <= rounds; round++) {
            int matchesInRound = bracketSize / (1 << round);
            List<Match> currentRound = new ArrayList<>();

            for (int i = 0; i < matchesInRound; i++) {
                Match match = Match.builder()
                        .tournamentId(tournamentId)
                        .roundNumber(round)
                        .roundMatchIndex(i)
                        .score1(0)
                        .score2(0)
                        .status(Status.PENDING)
                        .startTime(new Timestamp(System.currentTimeMillis()))
                        .build();

                if (round == 1) {
                    Integer team1 = slots.get(i * 2);
                    Integer team2 = slots.get(i * 2 + 1);
                    match.setTeam1Id(team1);
                    match.setTeam2Id(team2);

                    if (team1 == null && team2 == null) {
                        match.setStatus(Status.FINISHED);
                    }
                }

                currentRound.add(matchRepository.save(match));
            }

            roundsData.add(currentRound);
        }

        // Link matches to their next match and next slot.
        for (int round = 1; round < rounds; round++) {
            List<Match> currentRound = roundsData.get(round - 1);
            List<Match> nextRound = roundsData.get(round);

            for (int i = 0; i < currentRound.size(); i++) {
                Match current = currentRound.get(i);
                Match next = nextRound.get(i / 2);

                current.setNextMatchId(next.getId());
                current.setNextMatchSlot((i % 2 == 0) ? 1 : 2);
                matchRepository.save(current);
            }
        }

        // Auto-advance for bye matches in first round.
        for (Match match : roundsData.get(0)) {
            Integer t1 = match.getTeam1Id();
            Integer t2 = match.getTeam2Id();

            if (t1 != null && t2 == null) {
                finishMatch(match, 1, 0, FORMAT_SINGLE_ELIMINATION);
            } else if (t1 == null && t2 != null) {
                finishMatch(match, 0, 1, FORMAT_SINGLE_ELIMINATION);
            }
        }

        markTournamentOngoing(tournament);
        return getTournamentMatches(tournamentId);
    }

    private List<Match> generateRoundRobin(Tournament tournament) {
        int tournamentId = tournament.getId();
        List<Team> teams = teamRepository.findByTournamentId(tournamentId);
        if (teams.size() < 2) {
            throw new IllegalArgumentException("At least 2 teams are required to generate round robin.");
        }

        List<Match> existing = matchRepository.findByTournamentId(tournamentId);
        if (!existing.isEmpty()) {
            matchRepository.deleteAll(existing);
        }

        List<Integer> rotation = teams.stream()
                .map(team -> team.getId().intValue())
                .collect(Collectors.toCollection(ArrayList::new));

        if (rotation.size() % 2 != 0) {
            rotation.add(null);
        }

        int teamCount = rotation.size();
        int rounds = teamCount - 1;
        int half = teamCount / 2;

        for (int round = 1; round <= rounds; round++) {
            for (int i = 0; i < half; i++) {
                Integer team1Id = rotation.get(i);
                Integer team2Id = rotation.get(teamCount - 1 - i);
                if (team1Id == null || team2Id == null) {
                    continue;
                }

                Match match = Match.builder()
                        .tournamentId(tournamentId)
                        .team1Id(team1Id)
                        .team2Id(team2Id)
                        .score1(0)
                        .score2(0)
                        .roundNumber(round)
                        .roundMatchIndex(i)
                        .status(Status.PENDING)
                        .winnerId(null)
                        .nextMatchId(null)
                        .nextMatchSlot(null)
                        .startTime(new Timestamp(System.currentTimeMillis()))
                        .build();

                matchRepository.save(match);
            }

            // Circle method rotation, keep first fixed.
            Integer last = rotation.remove(rotation.size() - 1);
            rotation.add(1, last);
        }

        markTournamentOngoing(tournament);
        return getTournamentMatches(tournamentId);
    }

    public Match updateScore(int matchId, int score1, int score2) {
        Optional<Match> optionalMatch = matchRepository.findById(matchId);
        if (optionalMatch.isEmpty()) {
            throw new IllegalArgumentException("Match not found.");
        }

        Match match = optionalMatch.get();
        Tournament tournament = requireTournament(match.getTournamentId());
        String format = normalizeFormat(tournament.getFormat());

        if (match.getTeam1Id() == null || match.getTeam2Id() == null) {
            throw new IllegalArgumentException("Both teams must be present before scoring.");
        }
        if (Status.FINISHED.equals(match.getStatus())) {
            throw new IllegalArgumentException("Match score is already finalized.");
        }
        if (FORMAT_SINGLE_ELIMINATION.equals(format) && score1 == score2) {
            throw new IllegalArgumentException("Draw is not allowed in elimination bracket.");
        }

        finishMatch(match, score1, score2, format);
        return matchRepository.findById(matchId).orElse(match);
    }

    private void finishMatch(Match match, int score1, int score2, String format) {
        match.setScore1(score1);
        match.setScore2(score2);
        match.setStatus(Status.FINISHED);

        Integer winnerTeamId = null;
        if (score1 > score2) {
            winnerTeamId = match.getTeam1Id();
        } else if (score2 > score1) {
            winnerTeamId = match.getTeam2Id();
        }
        match.setWinnerId(winnerTeamId);
        matchRepository.save(match);

        updateTeamPlayersElo(match.getTeam1Id(), match.getTeam2Id(), score1, score2);

        if (FORMAT_SINGLE_ELIMINATION.equals(format)) {
            if (winnerTeamId != null) {
                advanceToNext(match, winnerTeamId);
            }
            maybeMarkSingleEliminationCompleted(match.getTournamentId());
        } else {
            maybeMarkRoundRobinCompleted(match.getTournamentId());
        }
    }

    private void updateTeamPlayersElo(Integer team1Id, Integer team2Id, int score1, int score2) {
        if (team1Id == null || team2Id == null) {
            return;
        }

        Optional<Team> team1Optional = teamRepository.findById((long) team1Id);
        Optional<Team> team2Optional = teamRepository.findById((long) team2Id);
        if (team1Optional.isEmpty() || team2Optional.isEmpty()) {
            return;
        }

        Team team1 = team1Optional.get();
        Team team2 = team2Optional.get();
        List<Player> team1Players = team1.getTeamPlayers();
        List<Player> team2Players = team2.getTeamPlayers();

        if (team1Players == null || team1Players.isEmpty() || team2Players == null || team2Players.isEmpty()) {
            return;
        }

        double team1AverageElo = averageElo(team1Players);
        double team2AverageElo = averageElo(team2Players);

        double team1ActualScore = 0.5;
        double team2ActualScore = 0.5;
        if (score1 > score2) {
            team1ActualScore = 1.0;
            team2ActualScore = 0.0;
        } else if (score2 > score1) {
            team1ActualScore = 0.0;
            team2ActualScore = 1.0;
        }

        int team1Delta = calculateEloDelta(team1AverageElo, team2AverageElo, team1ActualScore);
        int team2Delta = calculateEloDelta(team2AverageElo, team1AverageElo, team2ActualScore);

        applyDeltaAndSyncPlayers(team1, team1Delta);
        applyDeltaAndSyncPlayers(team2, team2Delta);
    }

    private double averageElo(List<Player> players) {
        return players.stream().mapToInt(Player::getEloRating).average().orElse(1000);
    }

    private int calculateEloDelta(double teamRating, double opponentRating, double actualScore) {
        double expectedScore = 1.0 / (1.0 + Math.pow(10.0, (opponentRating - teamRating) / 400.0));
        return (int) Math.round(ELO_K_FACTOR * (actualScore - expectedScore));
    }

    private void applyDeltaAndSyncPlayers(Team team, int delta) {
        List<Player> updatedTeamPlayers = team.getTeamPlayers().stream().map(snapshotPlayer -> {
            List<Player> persisted = playerRepository.findById(snapshotPlayer.getId());
            if (persisted.isEmpty()) {
                return snapshotPlayer;
            }

            Player player = persisted.get(0);
            int updatedElo = Math.max(MIN_ELO, player.getEloRating() + delta);
            player.setEloRating(updatedElo);
            Player saved = playerRepository.save(player);

            snapshotPlayer.setEloRating(saved.getEloRating());
            snapshotPlayer.setEmail(saved.getEmail());
            snapshotPlayer.setFullName(saved.getFullName());
            return snapshotPlayer;
        }).collect(Collectors.toList());

        team.setTeamPlayers(updatedTeamPlayers);
        teamRepository.save(team);
    }

    private void advanceToNext(Match sourceMatch, int winnerTeamId) {
        if (sourceMatch.getNextMatchId() == null || sourceMatch.getNextMatchSlot() == null) {
            return;
        }

        Optional<Match> nextOptional = matchRepository.findById(sourceMatch.getNextMatchId());
        if (nextOptional.isEmpty()) {
            return;
        }

        Match next = nextOptional.get();
        if (sourceMatch.getNextMatchSlot() == 1) {
            next.setTeam1Id(winnerTeamId);
        } else {
            next.setTeam2Id(winnerTeamId);
        }

        next.setStatus(Status.PENDING);
        matchRepository.save(next);

        // Handle bye progression recursively.
        Integer t1 = next.getTeam1Id();
        Integer t2 = next.getTeam2Id();
        if (t1 != null && t2 == null) {
            finishMatch(next, 1, 0, FORMAT_SINGLE_ELIMINATION);
        } else if (t1 == null && t2 != null) {
            finishMatch(next, 0, 1, FORMAT_SINGLE_ELIMINATION);
        }
    }

    private void markTournamentOngoing(Tournament tournament) {
        tournament.setStatus("ONGOING");
        tournament.setChampionTeamId(null);
        tournamentRepository.save(tournament);
    }

    private void maybeMarkSingleEliminationCompleted(int tournamentId) {
        List<Match> matches = getTournamentMatches(tournamentId);
        if (matches.isEmpty()) {
            return;
        }

        Match finalMatch = matches.get(matches.size() - 1);
        if (Status.FINISHED.equals(finalMatch.getStatus()) && finalMatch.getWinnerId() != null) {
            Tournament tournament = requireTournament(tournamentId);
            tournament.setStatus("COMPLETED");
            tournament.setChampionTeamId(finalMatch.getWinnerId());
            tournamentRepository.save(tournament);
        }
    }

    private void maybeMarkRoundRobinCompleted(int tournamentId) {
        List<Match> matches = getTournamentMatches(tournamentId);
        if (matches.isEmpty()) {
            return;
        }

        boolean allFinished = matches.stream().allMatch(match -> Status.FINISHED.equals(match.getStatus()));
        if (!allFinished) {
            return;
        }

        List<TeamStandingDto> standings = computeRoundRobinStandings(tournamentId);
        Tournament tournament = requireTournament(tournamentId);
        tournament.setStatus("COMPLETED");
        tournament.setChampionTeamId(standings.isEmpty() ? null : standings.get(0).getTeamId());
        tournamentRepository.save(tournament);
    }

    private List<TeamStandingDto> computeRoundRobinStandings(int tournamentId) {
        List<Team> teams = teamRepository.findByTournamentId(tournamentId);
        List<Match> matches = getTournamentMatches(tournamentId).stream()
                .filter(match -> Status.FINISHED.equals(match.getStatus()))
                .collect(Collectors.toList());

        Map<Integer, StandingAccumulator> acc = new HashMap<>();
        for (Team team : teams) {
            acc.put(team.getId().intValue(), new StandingAccumulator(team.getId().intValue(), team.getName()));
        }

        for (Match match : matches) {
            if (match.getTeam1Id() == null || match.getTeam2Id() == null) {
                continue;
            }

            StandingAccumulator team1 = acc.get(match.getTeam1Id());
            StandingAccumulator team2 = acc.get(match.getTeam2Id());
            if (team1 == null || team2 == null) {
                continue;
            }

            team1.played += 1;
            team2.played += 1;
            team1.scoreFor += match.getScore1();
            team1.scoreAgainst += match.getScore2();
            team2.scoreFor += match.getScore2();
            team2.scoreAgainst += match.getScore1();

            if (match.getScore1() > match.getScore2()) {
                team1.wins += 1;
                team2.losses += 1;
                team1.points += 3;
            } else if (match.getScore2() > match.getScore1()) {
                team2.wins += 1;
                team1.losses += 1;
                team2.points += 3;
            } else {
                team1.draws += 1;
                team2.draws += 1;
                team1.points += 1;
                team2.points += 1;
            }
        }

        List<StandingAccumulator> sorted = new ArrayList<>(acc.values());
        sorted.sort((a, b) -> {
            int byPoints = Integer.compare(b.points, a.points);
            if (byPoints != 0) {
                return byPoints;
            }

            int byDiff = Integer.compare(b.scoreDifference(), a.scoreDifference());
            if (byDiff != 0) {
                return byDiff;
            }

            int byScoreFor = Integer.compare(b.scoreFor, a.scoreFor);
            if (byScoreFor != 0) {
                return byScoreFor;
            }

            return a.teamName.compareToIgnoreCase(b.teamName);
        });

        List<TeamStandingDto> result = new ArrayList<>();
        for (int i = 0; i < sorted.size(); i++) {
            StandingAccumulator row = sorted.get(i);
            result.add(TeamStandingDto.builder()
                    .position(i + 1)
                    .teamId(row.teamId)
                    .teamName(row.teamName)
                    .played(row.played)
                    .wins(row.wins)
                    .draws(row.draws)
                    .losses(row.losses)
                    .points(row.points)
                    .scoreFor(row.scoreFor)
                    .scoreAgainst(row.scoreAgainst)
                    .scoreDifference(row.scoreDifference())
                    .build());
        }

        return result;
    }

    private Tournament requireTournament(int tournamentId) {
        List<Tournament> tournaments = tournamentRepository.findById(tournamentId);
        if (tournaments.isEmpty()) {
            throw new IllegalArgumentException("Tournament not found.");
        }
        return tournaments.get(0);
    }

    private String normalizeFormat(String format) {
        if (format == null) {
            return FORMAT_SINGLE_ELIMINATION;
        }
        return FORMAT_ROUND_ROBIN.equalsIgnoreCase(format.trim()) ? FORMAT_ROUND_ROBIN : FORMAT_SINGLE_ELIMINATION;
    }

    private boolean safeEquals(Object left, Object right) {
        if (left == null) {
            return right == null;
        }
        return left.equals(right);
    }

    private static class StandingAccumulator {
        private final int teamId;
        private final String teamName;
        private int played;
        private int wins;
        private int draws;
        private int losses;
        private int points;
        private int scoreFor;
        private int scoreAgainst;

        private StandingAccumulator(int teamId, String teamName) {
            this.teamId = teamId;
            this.teamName = teamName;
        }

        private int scoreDifference() {
            return scoreFor - scoreAgainst;
        }
    }
}
