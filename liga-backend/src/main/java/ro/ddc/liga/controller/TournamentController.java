package ro.ddc.liga.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ro.ddc.liga.model.Player;
import ro.ddc.liga.model.Tournament;
import ro.ddc.liga.repository.PlayerRepository;
import ro.ddc.liga.repository.TournamentRepository;
import ro.ddc.liga.service.TournamentService;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/tournaments")
public class TournamentController {
    @Autowired
    TournamentService tournamentService;

    @Autowired
    PlayerRepository playerRepository;

    @GetMapping("/get")
    public List<Tournament> getTournaments() {
        return tournamentService.getTournaments();
    }

    @PostMapping("/add")
    public org.springframework.http.ResponseEntity<?> addTournament(@RequestBody Tournament entity, java.security.Principal principal) {
        if (principal == null) {
            return org.springframework.http.ResponseEntity.status(401).body("Unauthorized");
        }
        
        var userList = playerRepository.findByEmail(principal.getName());
        if (userList.isEmpty()) {
            return org.springframework.http.ResponseEntity.status(401).body("User not found");
        }
        
        Player currentUser = userList.get(0);
        if ("ROLE_ORGANIZER".equals(currentUser.getRole().name()) && !currentUser.isApproved()) {
            return org.springframework.http.ResponseEntity.status(403).body("You must be an approved organizer to create tournaments.");
        }
        
        // Also ensure they aren't spoofing the organizerId
        entity.setOrganizerId(currentUser.getId());
        
        String result = tournamentService.addTournament(entity);
        return org.springframework.http.ResponseEntity.ok(result);
    }
}
