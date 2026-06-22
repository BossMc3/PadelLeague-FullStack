package ro.ddc.liga.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import ro.ddc.liga.model.Player;
import ro.ddc.liga.model.Tournament;
import ro.ddc.liga.repository.TournamentRepository;

@Service
public class TournamentService {
    private static final String FORMAT_SINGLE_ELIMINATION = "SINGLE_ELIMINATION";
    private static final String FORMAT_ROUND_ROBIN = "ROUND_ROBIN";

    @Autowired
    TournamentRepository tournamentRepository;

    @Autowired
    PlayerService playerService;

    @Autowired
    MatchService matchService;

    public List<Tournament> getTournaments() {
        List<Tournament> tournaments = TournamentRepository.getLocalTournaments();
        List<Tournament> dbTournaments = tournamentRepository.findAll();

        for (Tournament tournament : dbTournaments) {
            matchService.reconcileTournamentState(tournament.getId());
        }
        dbTournaments = tournamentRepository.findAll();

        if (dbTournaments.size() > tournaments.size()) {
            TournamentRepository.setLocalTournaments(dbTournaments);
            tournaments = dbTournaments;
        }
        return tournaments;
    }

    public String addTournament(@RequestBody Tournament entity) {
        if (entity.getOrganizerId() == 0) {
            return "Tournament organizer ID is required!";
        }
        List<Player> players = playerService.getPlayers();
        boolean organizerExists = players.stream()
            .anyMatch(player -> player.getId() == entity.getOrganizerId());
        if (!organizerExists) {
            return "Tournament organizer ID does not exist!";
        }

        if (entity.getStatus() == null || entity.getStatus().isBlank()) {
            entity.setStatus("DRAFT");
        }

        String requestedFormat = entity.getFormat();
        if (requestedFormat == null || requestedFormat.isBlank()) {
            entity.setFormat(FORMAT_SINGLE_ELIMINATION);
        } else if (FORMAT_ROUND_ROBIN.equalsIgnoreCase(requestedFormat.trim())) {
            entity.setFormat(FORMAT_ROUND_ROBIN);
        } else {
            entity.setFormat(FORMAT_SINGLE_ELIMINATION);
        }

        entity.setChampionTeamId(null);
        tournamentRepository.save(entity);
        return "Tournaments updated successfully!";
    }
}
