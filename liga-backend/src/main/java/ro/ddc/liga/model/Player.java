package ro.ddc.liga.model;

import java.sql.Date;

import org.springframework.boot.context.properties.bind.DefaultValue;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;    

@Data
@Builder
@Entity
@Table(name = "players", indexes = {
    @Index(name = "idx_player_fullName", columnList = "fullName"),
    @Index(name = "idx_player_team", columnList = "team")
})
@AllArgsConstructor
@NoArgsConstructor
public class Player {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;

    @Column(name = "email")
    private String email;

    @Column(name = "fullName")
    private String fullName;

    @Column(name = "password")
    private String password;

    @Column(name = "eloRating")
    private int eloRating;

    @Column(name = "team")
    private String team;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "resetPasswordToken")
    private String resetPasswordToken;

    // Email verification
    @Builder.Default
    @Column(name = "emailVerified")
    private boolean emailVerified = false;

    @Column(name = "emailVerificationToken")
    private String emailVerificationToken;

    // Admin approval (only relevant for ROLE_ORGANIZER)
    @Builder.Default
    @Column(name = "approved")
    private boolean approved = true;

    @Builder.Default
    @Column(name = "registrationDate")
    private Date registrationDate = new Date(System.currentTimeMillis());
}
