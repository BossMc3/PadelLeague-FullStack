package ro.ddc.liga.repository;

import org.springframework.stereotype.Repository;

import ro.ddc.liga.model.Player;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface PlayerRepository extends JpaRepository<Player, Integer> {
    public static List<Player> getLocalPlayers() {
        return MemoryRepository.getPlayers;
    }
    public static void setLocalPlayers(List<Player> players) {
        MemoryRepository.getPlayers = players;
    }
    List<Player> findByfullName(String name);
    List<Player> findById(int id);
    List<Player> findByEmail(String email);
    List<Player> findByEmailVerificationToken(String token);
    List<Player> findByRoleAndApproved(ro.ddc.liga.model.Role role, boolean approved);
}
