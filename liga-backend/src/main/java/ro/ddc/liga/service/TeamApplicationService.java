package ro.ddc.liga.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import ro.ddc.liga.model.ApplicationStatus;
import ro.ddc.liga.model.Player;
import ro.ddc.liga.model.Team;
import ro.ddc.liga.model.TeamApplication;
import ro.ddc.liga.repository.PlayerRepository;
import ro.ddc.liga.repository.TeamApplicationRepository;
import ro.ddc.liga.repository.TeamRepository;

@Service
public class TeamApplicationService {

    @Autowired
    private TeamApplicationRepository teamApplicationRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private PlayerRepository playerRepository;

    /**
     * A player applies to join a team.
     */
    public String applyToTeam(int playerId, String playerEmail, int teamId) {
        // Check if player exists
        List<Player> players = playerRepository.findById(playerId);
        if (players.isEmpty()) {
            return "Player not found!";
        }

        // Check if team exists
        List<Team> teams = teamRepository.findById(teamId);
        if (teams.isEmpty()) {
            return "Team not found!";
        }

        // Check for duplicate application
        List<TeamApplication> existing = teamApplicationRepository.findByPlayerIdAndTeamId(playerId, teamId);
        for (TeamApplication app : existing) {
            if (app.getStatus() == ApplicationStatus.PENDING) {
                return "You already have a pending application for this team!";
            }
        }

        // Check if player is already in the team
        Team team = teams.get(0);
        for (Player p : team.getTeamPlayers()) {
            if (p.getId() == playerId) {
                return "You are already a member of this team!";
            }
        }

        TeamApplication application = TeamApplication.builder()
                .playerId(playerId)
                .playerEmail(playerEmail)
                .teamId(teamId)
                .status(ApplicationStatus.PENDING)
                .build();

        teamApplicationRepository.save(application);
        return "Application submitted successfully!";
    }

    /**
     * Get all applications for a specific team.
     */
    public List<TeamApplication> getApplicationsForTeam(int teamId) {
        return teamApplicationRepository.findByTeamIdAndStatus(teamId, ApplicationStatus.PENDING);
    }

    /**
     * Get all applications for teams belonging to a specific tournament.
     */
    public List<TeamApplication> getApplicationsForTournament(int tournamentId) {
        List<Team> teams = teamRepository.findByTournamentId(tournamentId);
        return teams.stream()
                .flatMap(team -> teamApplicationRepository.findByTeamIdAndStatus(
                        team.getId().intValue(), ApplicationStatus.PENDING).stream())
                .toList();
    }

    /**
     * Get all applications by a specific player.
     */
    public List<TeamApplication> getApplicationsByPlayer(int playerId) {
        return teamApplicationRepository.findByPlayerId(playerId);
    }

    /**
     * Accept a team application — adds the player to the team.
     */
    public String acceptApplication(int applicationId) {
        var appOpt = teamApplicationRepository.findById(applicationId);
        if (appOpt.isEmpty()) {
            return "Application not found!";
        }

        TeamApplication application = appOpt.get();
        if (application.getStatus() != ApplicationStatus.PENDING) {
            return "Application has already been processed!";
        }

        // Add player to team
        List<Team> teams = teamRepository.findById(application.getTeamId());
        if (teams.isEmpty()) {
            return "Team not found!";
        }
        Team team = teams.get(0);

        List<Player> players = playerRepository.findById(application.getPlayerId());
        if (players.isEmpty()) {
            return "Player not found!";
        }
        Player player = players.get(0);

        // Check if already in team
        boolean alreadyInTeam = team.getTeamPlayers().stream()
                .anyMatch(p -> p.getId() == player.getId());
                
        if (!alreadyInTeam) {
            if (team.getTeamPlayers().size() >= 2) {
                return "Team is already full (max 2 players)!";
            }
            team.getTeamPlayers().add(player);
            teamRepository.save(team);
        }

        application.setStatus(ApplicationStatus.ACCEPTED);
        teamApplicationRepository.save(application);
        return "Application accepted! Player added to team.";
    }

    /**
     * Reject a team application.
     */
    public String rejectApplication(int applicationId) {
        var appOpt = teamApplicationRepository.findById(applicationId);
        if (appOpt.isEmpty()) {
            return "Application not found!";
        }

        TeamApplication application = appOpt.get();
        if (application.getStatus() != ApplicationStatus.PENDING) {
            return "Application has already been processed!";
        }

        application.setStatus(ApplicationStatus.REJECTED);
        teamApplicationRepository.save(application);
        return "Application rejected.";
    }
}
