package ro.ddc.liga.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ro.ddc.liga.model.Player;
import ro.ddc.liga.repository.PlayerRepository;
import ro.ddc.liga.service.PlayerService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/players")
public class PlayerController {
    @Autowired
    PlayerService playerService;

    @GetMapping("/get")
    public List<Player> getPlayers() {
        return playerService.getPlayers();
    }

    @PostMapping("/add")
    public String addPlayer(@RequestBody Player entity) {
        playerService.addPlayer(entity);
        return "Players updated successfully!";
    }

    @GetMapping("/get/{id}")
    public List<Player> getPlayer(@PathVariable int id) {
        return playerService.getPlayer(id);
    }
}
