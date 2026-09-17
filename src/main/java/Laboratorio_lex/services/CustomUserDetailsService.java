package Laboratorio_lex.services;

import Laboratorio_lex.models.Usuario;
import Laboratorio_lex.models.enums.EstadoUsuario;
import Laboratorio_lex.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String documento) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByDocumento(documento)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con documento: " + documento));

        if (usuario.getEstado() != EstadoUsuario.ACTIVO) {
            throw new RuntimeException("El usuario está bloqueado o inactivo");
        }

        return new org.springframework.security.core.userdetails.User(
                usuario.getDocumento(),
                usuario.getPasswordHash(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + usuario.getRol().getNombre()))
        );
    }
}
