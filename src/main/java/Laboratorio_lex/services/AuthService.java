package Laboratorio_lex.services;

import Laboratorio_lex.dto.LoginRequest;
import Laboratorio_lex.dto.LoginResponse;
import Laboratorio_lex.models.Usuario;
import Laboratorio_lex.repositories.UsuarioRepository;
import Laboratorio_lex.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public LoginResponse authenticate(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getDocumento(), request.getPassword())
        );

        final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getDocumento());
        Usuario usuario = usuarioRepository.findByDocumento(request.getDocumento()).orElseThrow();
        
        final String jwt = jwtUtil.generateToken(userDetails, usuario.getRol().getNombre());

        return new LoginResponse(
                jwt,
                usuario.getId(),
                usuario.getNombres(),
                usuario.getApellidos(),
                usuario.getRol().getNombre()
        );
    }
}
