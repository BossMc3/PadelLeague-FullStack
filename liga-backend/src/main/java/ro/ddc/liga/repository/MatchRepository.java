package ro.ddc.liga.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ro.ddc.liga.model.Match;
import java.util.List;

@Repository
public interface MatchRepository extends JpaRepository<Match, Integer> {
    List<Match> findByTournamentId(int tournamentId);
    List<Match> findByTournamentIdOrderByRoundNumberAscRoundMatchIndexAsc(int tournamentId);
}