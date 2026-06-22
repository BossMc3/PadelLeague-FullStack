package ro.ddc.liga.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ro.ddc.liga.dto.TeamStandingDto;
import ro.ddc.liga.model.Match;
import ro.ddc.liga.service.MatchService;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/matches")
public class MatchController {
    private final MatchService matchService;

    public MatchController(MatchService matchService) {
        this.matchService = matchService;
    }

    @GetMapping("/tournament/{tournamentId}")
    public List<Match> getTournamentMatches(@PathVariable int tournamentId) {
        return matchService.getTournamentMatches(tournamentId);
    }

    @GetMapping("/tournament/{tournamentId}/standings")
    public List<TeamStandingDto> getRoundRobinStandings(@PathVariable int tournamentId) {
        return matchService.getRoundRobinStandings(tournamentId);
    }

    @PostMapping("/generate/{tournamentId}")
    public ResponseEntity<?> generate(@PathVariable int tournamentId) {
        try {
            return ResponseEntity.ok(matchService.generateMatches(tournamentId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{matchId}/score")
    public ResponseEntity<?> updateScore(
            @PathVariable int matchId,
            @RequestParam int score1,
            @RequestParam int score2
    ) {
        try {
            Match updated = matchService.updateScore(matchId, score1, score2);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
