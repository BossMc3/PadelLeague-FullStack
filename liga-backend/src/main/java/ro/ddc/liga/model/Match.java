package ro.ddc.liga.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Date;
import java.sql.Timestamp;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "matches")
public class Match {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;

    @Column(name = "tournamentId")
    private int tournamentId;
    private Integer team1Id;
    private Integer team2Id;
    
    @Builder.Default
    private int score1 = 0;
    @Column(name = "score2")
    @Builder.Default
    private int score2 = 0;

    @Column(name = "roundNumber")
    private int roundNumber;
    @Column(name = "roundMatchIndex")
    private int roundMatchIndex;

    @Column(name = "status")
    private Status status;
    @Column(name = "winnerId")
    private Integer winnerId;

    private Integer nextMatchId;
    private Integer nextMatchSlot; // 1 or 2
    
    @Builder.Default
    @Column(name = "start_time")
    private Timestamp startTime = new Timestamp(System.currentTimeMillis());
}