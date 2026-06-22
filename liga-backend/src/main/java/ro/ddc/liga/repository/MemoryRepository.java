package ro.ddc.liga.repository;

import java.util.ArrayList;
import java.util.List;

import lombok.experimental.UtilityClass;
import ro.ddc.liga.model.Player;
import ro.ddc.liga.model.Team;
import ro.ddc.liga.model.Tournament;

@UtilityClass
public class MemoryRepository {
    public static List<Player> getPlayers = new ArrayList<>();
    public static List<Tournament> getTournaments = new ArrayList<>();
    public static List<Team> getTeams = new ArrayList<>();
}
