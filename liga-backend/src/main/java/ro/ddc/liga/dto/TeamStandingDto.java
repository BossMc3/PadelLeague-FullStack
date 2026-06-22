package ro.ddc.liga.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamStandingDto {
    private int position;
    private int teamId;
    private String teamName;
    private int played;
    private int wins;
    private int draws;
    private int losses;
    private int points;
    private int scoreFor;
    private int scoreAgainst;
    private int scoreDifference;
}
