package ro.ddc.liga.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ro.ddc.liga.model.Team;
import ro.ddc.liga.model.TeamApplication;
import ro.ddc.liga.service.TeamApplicationService;
import ro.ddc.liga.service.TeamService;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/teams")
public class TeamController {
    @Autowired
    private TeamService teamService;

    @Autowired
    private TeamApplicationService teamApplicationService;

    @GetMapping("/get")
    public List<Team> getTeams() {
        return teamService.getTeams();
    }
    
    @PostMapping("/add")
    public String addTeam(@RequestBody Team entity) {
        return teamService.addTeam(entity);
    }
    
    @PostMapping("/addPlayer")
    public String addPlayerToTeam(@RequestParam int teamId, @RequestParam int playerId) {
        return teamService.addPlayerToTeam(teamId, playerId);
    }

    // ===== Team Application Endpoints =====

    /**
     * Player applies to join a team.
     */
    @PostMapping("/apply")
    public ResponseEntity<String> applyToTeam(@RequestParam int playerId,
                                               @RequestParam String playerEmail,
                                               @RequestParam int teamId) {
        return ResponseEntity.ok(teamApplicationService.applyToTeam(playerId, playerEmail, teamId));
    }

    /**
     * Get pending applications for a specific team.
     */
    @GetMapping("/applications/{teamId}")
    public ResponseEntity<List<TeamApplication>> getTeamApplications(@PathVariable int teamId) {
        return ResponseEntity.ok(teamApplicationService.getApplicationsForTeam(teamId));
    }

    /**
     * Get pending applications for all teams in a tournament.
     */
    @GetMapping("/applications/tournament/{tournamentId}")
    public ResponseEntity<List<TeamApplication>> getTournamentApplications(@PathVariable int tournamentId) {
        return ResponseEntity.ok(teamApplicationService.getApplicationsForTournament(tournamentId));
    }

    /**
     * Get all applications by a specific player.
     */
    @GetMapping("/applications/player/{playerId}")
    public ResponseEntity<List<TeamApplication>> getPlayerApplications(@PathVariable int playerId) {
        return ResponseEntity.ok(teamApplicationService.getApplicationsByPlayer(playerId));
    }

    /**
     * Organizer accepts a team application.
     */
    @PostMapping("/applications/accept/{applicationId}")
    public ResponseEntity<String> acceptApplication(@PathVariable int applicationId) {
        return ResponseEntity.ok(teamApplicationService.acceptApplication(applicationId));
    }

    /**
     * Organizer rejects a team application.
     */
    @PostMapping("/applications/reject/{applicationId}")
    public ResponseEntity<String> rejectApplication(@PathVariable int applicationId) {
        return ResponseEntity.ok(teamApplicationService.rejectApplication(applicationId));
    }
}
