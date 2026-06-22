package ro.ddc.liga.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import ro.ddc.liga.model.ApplicationStatus;
import ro.ddc.liga.model.TeamApplication;

@Repository
public interface TeamApplicationRepository extends JpaRepository<TeamApplication, Integer> {
    List<TeamApplication> findByTeamId(int teamId);
    List<TeamApplication> findByPlayerId(int playerId);
    List<TeamApplication> findByTeamIdAndStatus(int teamId, ApplicationStatus status);
    List<TeamApplication> findByPlayerIdAndTeamId(int playerId, int teamId);
    List<TeamApplication> findByStatus(ApplicationStatus status);
}
