package ro.ddc.liga.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import ro.ddc.liga.model.Team;

public interface TeamRepository extends JpaRepository<Team, Long> {
    public static List<Team> getLocalTeams() {
        return MemoryRepository.getTeams;
    }

    public static void setLocalTeams(List<Team> teams) {
        MemoryRepository.getTeams = teams;
    }

    public List<Team> findById(int id);
    public List<Team> findByTournamentId(int tournamentId);
}
