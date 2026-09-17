package Laboratorio_lex.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /** Orígenes permitidos — configurados por perfil en application-*.properties */
    @Value("${cors.allowed-origins:http://localhost:3000}")
    private String allowedOrigins;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Deshabilitar CSRF (API stateless JWT)
                .csrf(AbstractHttpConfigurer::disable)

                // 2. Configurar CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 3. Permitir que H2 Console se renderice en iFrames (solo en dev)
                .headers(headers -> headers
                        .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin))

                // 4. Política de sesión Stateless (JWT — sin cookies de sesión)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 5. Permisos de rutas
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()     // Login público
                        .requestMatchers("/h2-console/**").permitAll()   // Consola H2 (solo dev)
                        .requestMatchers("/actuator/health").permitAll() // Health check
                        .anyRequest().authenticated()                    // Resto requiere JWT
                )

                // 6. Registrar filtro JWT antes del filtro por defecto
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Orígenes permitidos: el frontend Next.js + cualquier subdominio local
        configuration.setAllowedOriginPatterns(List.of(
                allowedOrigins,
                "http://localhost:*",
                "http://127.0.0.1:*"
        ));

        // Métodos HTTP permitidos
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // Cabeceras permitidas
        configuration.setAllowedHeaders(List.of(
                "Authorization", "Content-Type", "Accept",
                "X-Requested-With", "Cache-Control", "Origin"
        ));

        // Exponer cabecera Authorization en la respuesta (para que el cliente pueda leerla)
        configuration.setExposedHeaders(List.of("Authorization"));

        // Permitir envío de credenciales (cookies, Authorization header)
        configuration.setAllowCredentials(true);

        // Cache del preflight request: 1 hora
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}