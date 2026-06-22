package ro.ddc.liga.configuration;

import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import lombok.RequiredArgsConstructor;
import ro.ddc.liga.repository.PlayerRepository;
import ro.ddc.liga.security.JwtAuthenticationFilter;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   JwtAuthenticationFilter jwtAuthFilter,
                                                   AuthenticationProvider authenticationProvider) throws Exception {
        http
            .cors(withDefaults())
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/error").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                // Public read-only endpoints
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/tournaments/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/teams/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/matches/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/players/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/sse/**").permitAll()
                // Admin-only endpoints
                .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")
                // Tournament management: Admin OR approved Organizer
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/tournaments/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_ORGANIZER")
                .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/tournaments/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_ORGANIZER")
                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/tournaments/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_ORGANIZER")
                // Match management: Admin or Organizer
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/matches/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_ORGANIZER")
                .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/matches/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_ORGANIZER")
                // Team applications: apply is for players, accept/reject is for organizers/admins
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/teams/apply").hasAnyAuthority("ROLE_PLAYER", "ROLE_ADMIN")
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/teams/applications/accept/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_ORGANIZER")
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/teams/applications/reject/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_ORGANIZER")
                // Team management: admin or organizer
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/teams/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_ORGANIZER")
                .anyRequest().authenticated()
            )
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService(PlayerRepository playerRepository, PasswordEncoder passwordEncoder) {
        return username -> playerRepository.findByEmail(username).stream().findFirst()
                .map(player -> {
                    String rawPassword = player.getPassword();
                    String encodedPassword;

                    if (rawPassword == null || rawPassword.isEmpty()) {
                        encodedPassword = "";
                    } else if (rawPassword.startsWith("{")) {
                        // already prefixed (e.g. {bcrypt}, {noop}).
                        encodedPassword = rawPassword;
                    } else if (rawPassword.startsWith("$2a$") || rawPassword.startsWith("$2b$") || rawPassword.startsWith("$2y$")) {
                        encodedPassword = "{bcrypt}" + rawPassword;
                    } else {
                        // For legacy plain-text passwords in DB, use noop to avoid Bcrypt warnings
                        encodedPassword = "{noop}" + rawPassword;
                    }

                    return User.builder()
                            .username(player.getEmail())
                            .password(encodedPassword)
                            .roles(player.getRole().name().replace("ROLE_", ""))
                            .build();
                })
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found"));
    }

    @Bean
    public AuthenticationProvider authenticationProvider(UserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(false);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
