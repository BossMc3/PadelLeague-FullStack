package ro.ddc.liga.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import ro.ddc.liga.model.Player;
import ro.ddc.liga.model.Team;
import ro.ddc.liga.repository.PlayerRepository;
import ro.ddc.liga.repository.TeamRepository;

@Service
public class TeamService {
    @Autowired
    private PlayerRepository playerRepository;
    @Autowired
    private TeamRepository teamRepository;

    public List<Team> getTeams() {
        List<Team> teams = TeamRepository.getLocalTeams();
        List<Team> dbTeams = teamRepository.findAll();
        if (dbTeams.size() > teams.size()) {
            TeamRepository.setLocalTeams(dbTeams);
            teams = dbTeams;
        }
        return teams;
    }

    public String addTeam(Team entity) {
        if (entity.getName() == null || entity.getName().isEmpty()) {
            return "Team name is required!";
        }
        if (entity.getTournamentId() == 0) {
            return "Tournament ID is required!";
        }
        teamRepository.save(entity);
        return "Team added successfully!";
    }

    public String addPlayerToTeam(int teamId, int playerId) {
        Team team = teamRepository.findById(teamId).get(0);
        if (team == null) {
            return "Team not found!";
        }
        Player p = playerRepository.findById(playerId).get(0);
        if (p == null) {
            return "Player not found!";
        }
        List<Player> teamPlayers = team.getTeamPlayers();
        if (teamPlayers.size() >= 2) {
            return "Team cannot have more than 2 players!";
        }
        for (Player pl : teamPlayers) {
            if (pl.getId() == playerId) {
                return "Player is already in the team!";
            }
        }   
        teamPlayers.add(p);
        team.setTeamPlayers(teamPlayers);
        teamRepository.save(team);
        return "Player added to team successfully!";
    }
}
