package ro.ddc.liga.controller;

import lombok.RequiredArgsConstructor;

import java.util.Random;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ro.ddc.liga.dto.AuthResponse;
import ro.ddc.liga.dto.ForgotPasswordRequest;
import ro.ddc.liga.dto.LoginRequest;
import ro.ddc.liga.dto.RegisterRequest;
import ro.ddc.liga.dto.ResetPasswordRequest;
import ro.ddc.liga.dto.VerifyEmailRequest;
import ro.ddc.liga.model.Player;
import ro.ddc.liga.model.Role;
import ro.ddc.liga.repository.PlayerRepository;
import ro.ddc.liga.security.JwtService;
import ro.ddc.liga.service.EmailService;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final PlayerController playerController;
    private final PlayerRepository playerRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Autowired
    private EmailService emailService;

    /**
     * Generate a 6-digit verification code.
     */
    private String generateVerificationCode() {
        return String.format("%06d", new Random().nextInt(999999));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        if (!playerRepository.findByEmail(request.getEmail()).isEmpty()) {
            return ResponseEntity.badRequest().body(AuthResponse.builder()
                    .message("This email is already in use.")
                    .build());
        }

        // Determine role
        Role role;
        boolean needsApproval = false;
        if ("ADMIN".equalsIgnoreCase(request.getRole()) || "ROLE_ADMIN".equalsIgnoreCase(request.getRole())) {
            // Don't allow self-registration as admin
            return ResponseEntity.badRequest().body(AuthResponse.builder()
                    .message("Cannot register as admin.")
                    .build());
        } else if ("ORGANIZER".equalsIgnoreCase(request.getRole()) || "ROLE_ORGANIZER".equalsIgnoreCase(request.getRole())) {
            role = Role.ROLE_ORGANIZER;
            needsApproval = true;
        } else {
            role = Role.ROLE_PLAYER;
        }

        // Generate email verification code
        String verificationCode = generateVerificationCode();

        var user = Player.builder()
                .email(request.getEmail())
                .fullName(request.getEmail()) // default fullName to email
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .eloRating(1200) // default ELO rating
                .team("") // default empty team
                .emailVerified(false)
                .emailVerificationToken(verificationCode)
                .approved(!needsApproval) // Players are auto-approved, Organizers need admin approval
                .build();
        playerRepository.save(user);

        // Send verification email
        emailService.sendVerificationEmail(user.getEmail(), user.getFullName(), verificationCode);

        String message = "Registration successful! Please check your email to verify your account.";
        if (needsApproval) {
            message += " Your organizer account also needs admin approval before you can create tournaments.";
        }

        return ResponseEntity.ok(AuthResponse.builder()
                .email(user.getEmail())
                .role(user.getRole())
                .emailVerified(false)
                .approved(!needsApproval)
                .message(message)
                .build());
    }

    @PostMapping("/verify-email")
    public ResponseEntity<AuthResponse> verifyEmail(@RequestBody VerifyEmailRequest request) {
        var userList = playerRepository.findByEmail(request.getEmail());
        if (userList.isEmpty()) {
            return ResponseEntity.badRequest().body(AuthResponse.builder()
                    .message("User not found.")
                    .build());
        }

        Player user = userList.get(0);

        if (user.isEmailVerified()) {
            return ResponseEntity.ok(AuthResponse.builder()
                    .email(user.getEmail())
                    .role(user.getRole())
                    .emailVerified(true)
                    .approved(user.isApproved())
                    .message("Email is already verified.")
                    .build());
        }

        if (user.getEmailVerificationToken() == null ||
                !user.getEmailVerificationToken().equals(request.getToken())) {
            return ResponseEntity.badRequest().body(AuthResponse.builder()
                    .message("Invalid verification code.")
                    .build());
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        playerRepository.save(user);

        // Generate JWT token now that email is verified
        var jwtToken = jwtService.generateToken(user);

        return ResponseEntity.ok(AuthResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .role(user.getRole())
                .emailVerified(true)
                .approved(user.isApproved())
                .message("Email verified successfully!")
                .build());
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        // Check if user exists and is verified
        var userList = playerRepository.findByEmail(request.getEmail());
        if (userList.isEmpty()) {
            return ResponseEntity.badRequest().body(AuthResponse.builder()
                    .message("User not found.")
                    .build());
        }

        Player user = userList.get(0);

        if (!user.isEmailVerified()) {
            return ResponseEntity.status(403).body(AuthResponse.builder()
                    .email(user.getEmail())
                    .emailVerified(false)
                    .message("Please verify your email before logging in. Check your inbox for the verification code.")
                    .build());
        }

        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()) 
        );

        var jwtToken = jwtService.generateToken(user);
        var authResponse = AuthResponse.builder()   
            .token(jwtToken)
            .email(user.getEmail())
            .role(user.getRole())
            .emailVerified(true)
            .approved(user.isApproved())
            .build();
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        var userOptional = playerRepository.findByEmail(request.getEmail());
        if (!userOptional.isEmpty()) {
            var user = userOptional.get(0);
            String token = UUID.randomUUID().toString();
            user.setResetPasswordToken(token);
            playerRepository.save(user);

            boolean sent = emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), token);
            if (!sent) {
                return ResponseEntity.status(500).body("Error sending email");
            }
            
            return ResponseEntity.ok("Password reset token generated (check your email)");
        }
        return ResponseEntity.badRequest().body("User not found");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        var userOptional = playerRepository.findByEmail(request.getEmail());
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found.");
        }
        var user = userOptional.get(0);
        if (user.getResetPasswordToken() == null || !user.getResetPasswordToken().equals(request.getToken())) {
            return ResponseEntity.badRequest().body("Invalid token.");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetPasswordToken(null);
        playerRepository.save(user);
        return ResponseEntity.ok("Password successfully reset.");
    }
}
