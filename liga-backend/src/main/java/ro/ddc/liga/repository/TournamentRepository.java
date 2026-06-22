package ro.ddc.liga.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import ro.ddc.liga.model.Tournament;

public interface TournamentRepository extends JpaRepository<Tournament, Integer> {
    public static List<Tournament> getLocalTournaments() {
        return MemoryRepository.getTournaments;
    }
    public static void setLocalTournaments(List<Tournament> tournaments) {
        MemoryRepository.getTournaments = tournaments;
    }

    List<Tournament> findById(int id);
}
