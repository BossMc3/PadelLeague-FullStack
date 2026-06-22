package ro.ddc.liga.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import ro.ddc.liga.model.Player;
import ro.ddc.liga.repository.PlayerRepository;

@Service
public class PlayerService {
    @Autowired
    private PlayerRepository playerRepository;

    public List<Player> getPlayers() {
        List<Player> players = PlayerRepository.getLocalPlayers();
        List<Player> dbPlayers = playerRepository.findAll();
        if (dbPlayers.size() > players.size()) {
            PlayerRepository.setLocalPlayers(dbPlayers);
            players = dbPlayers;
        }
        return players;
    }

    public List<Player> getPlayer(int id) {
        return playerRepository.findById(id);
    }

    public Player addPlayer(Player entity) {
        return playerRepository.save(entity);
    }
}
