package ro.ddc.liga.model;

import java.sql.Date;

import jakarta.annotation.Generated;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "tournaments", indexes = {
    @Index(name = "idx_tournament_name", columnList = "name")
})
public class Tournament {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;

    @Column (name = "name")
    private String name;

    @Column (name = "status")
    private String status;

    @Column(name = "format")
    private String format = "SINGLE_ELIMINATION";

    @Column(name = "championTeamId")
    private Integer championTeamId;

    @Column (name = "organizerId")
    private int organizerId = 0;

    @Column (name = "creationDate")
    private Date creationDate = new Date(System.currentTimeMillis());
}
