package ro.ddc.liga.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import ro.ddc.liga.model.Player;
import ro.ddc.liga.model.Role;
import ro.ddc.liga.repository.PlayerRepository;

@Service
public class AdminService {

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @jakarta.annotation.PostConstruct
    public void setupAdmin() {
        try {
            // Drop constraint just in case it ever returns or wasn't dropped properly
            jdbcTemplate.execute("ALTER TABLE players DROP CONSTRAINT IF EXISTS players_role_check;");
            
            // Normalize old nullable booleans
            jdbcTemplate.update("UPDATE players SET approved = true WHERE approved IS NULL");
            jdbcTemplate.update("UPDATE players SET email_verified = true WHERE email_verified IS NULL");

            // Reset admin password
            int adminUpdated = jdbcTemplate.update("UPDATE players SET password = 'admin123' WHERE email = 'admin@gmail.com'");
            if (adminUpdated == 0) {
                // Insert a brand new admin just in case
                jdbcTemplate.update("INSERT INTO players (full_name, email, password, role, elo_rating, email_verified, approved, team, registration_date) " +
                                    "VALUES ('Administrator', 'admin@gmail.com', 'admin123', 'ROLE_ADMIN', 1200, true, true, '', CURRENT_DATE)");
            }
        } catch(Exception e) {
            System.out.println("Initialize warning: " + e.getMessage());
        }
    }

    /**
     * Get all organizer accounts that are pending approval.
     */
    public List<Player> getPendingOrganizers() {
        return playerRepository.findByRoleAndApproved(Role.ROLE_ORGANIZER, false);
    }

    /**
     * Approve an organizer account.
     */
    public String approveOrganizer(int playerId) {
        List<Player> players = playerRepository.findById(playerId);
        if (players.isEmpty()) {
            return "Player not found!";
        }
        Player player = players.get(0);
        if (player.getRole() != Role.ROLE_ORGANIZER) {
            return "Player is not an organizer!";
        }
        if (player.isApproved()) {
            return "Organizer is already approved!";
        }
        player.setApproved(true);
        playerRepository.save(player);
        return "Organizer approved successfully!";
    }

    /**
     * Reject (delete) an organizer account.
     */
    public String rejectOrganizer(int playerId) {
        List<Player> players = playerRepository.findById(playerId);
        if (players.isEmpty()) {
            return "Player not found!";
        }
        Player player = players.get(0);
        if (player.getRole() != Role.ROLE_ORGANIZER) {
            return "Player is not an organizer!";
        }
        playerRepository.delete(player);
        return "Organizer rejected and removed!";
    }

    /**
     * Get all users (for admin management).
     */
    public List<Player> getAllUsers() {
        return playerRepository.findAll();
    }
}
