package Laboratorio_lex.services;

import Laboratorio_lex.dto.VerificarAccesoRequest;
import Laboratorio_lex.dto.VerificarAccesoResponse;
import Laboratorio_lex.models.AreaRestringida;
import Laboratorio_lex.models.AutorizacionZona;
import Laboratorio_lex.models.Empleado;
import Laboratorio_lex.models.HistorialAcceso;
import Laboratorio_lex.models.Usuario;
import Laboratorio_lex.models.enums.EstadoEmpleado;
import Laboratorio_lex.models.enums.EstadoUsuario;
import Laboratorio_lex.models.enums.ResultadoAcceso;
import Laboratorio_lex.repositories.AreaRestringidaRepository;
import Laboratorio_lex.repositories.AutorizacionZonaRepository;
import Laboratorio_lex.repositories.EmpleadoRepository;
import Laboratorio_lex.repositories.HistorialAccesoRepository;
import Laboratorio_lex.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AccesoService {

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Autowired
    private AreaRestringidaRepository areaRepository;

    @Autowired
    private AutorizacionZonaRepository autorizacionRepository;

    @Autowired
    private HistorialAccesoRepository historialRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Transactional
    public VerificarAccesoResponse verificarYRegistrarAcceso(VerificarAccesoRequest request) {
        HistorialAcceso historial = new HistorialAcceso();
        historial.setNumeroDocumentoIngresado(request.getDocumento());

        // 1. Validar si el área existe
        AreaRestringida area = areaRepository.findById(request.getAreaId()).orElse(null);
        if (area == null) {
            return new VerificarAccesoResponse(false, ResultadoAcceso.DENEGADO, "El área especificada no existe.", null, null);
        }
        historial.setArea(area);

        // 2. Buscar primero en la tabla de empleados (personal de producción)
        Optional<Empleado> empleadoOpt = empleadoRepository.findByNumeroDocumento(request.getDocumento());
        if (empleadoOpt.isPresent()) {
            Empleado empleado = empleadoOpt.get();
            historial.setEmpleado(empleado);

            // Verificar estado del empleado
            if (empleado.getEstado() != EstadoEmpleado.ACTIVO) {
                historial.setResultadoAcceso(ResultadoAcceso.DENEGADO);
                historial.setMotivoDenegacion("El empleado se encuentra " + empleado.getEstado());
                historialRepository.save(historial);
                return new VerificarAccesoResponse(false, ResultadoAcceso.DENEGADO,
                        "Acceso denegado. Empleado " + empleado.getEstado() + ".",
                        empleado.getNombres() + " " + empleado.getApellidos(), area.getNombre());
            }

            // Verificar autorización de área
            Optional<AutorizacionZona> autorizacion = autorizacionRepository.findActiveAutorizacion(empleado.getId(), area.getId());
            if (autorizacion.isEmpty()) {
                historial.setResultadoAcceso(ResultadoAcceso.DENEGADO);
                historial.setMotivoDenegacion("No tiene autorización activa para esta área");
                historialRepository.save(historial);
                return new VerificarAccesoResponse(false, ResultadoAcceso.DENEGADO,
                        "No posee autorización para esta zona.",
                        empleado.getNombres() + " " + empleado.getApellidos(), area.getNombre());
            }

            // Empleado autorizado
            historial.setResultadoAcceso(ResultadoAcceso.AUTORIZADO);
            historialRepository.save(historial);
            return new VerificarAccesoResponse(true, ResultadoAcceso.AUTORIZADO,
                    "Acceso concedido exitosamente.",
                    empleado.getNombres() + " " + empleado.getApellidos(), area.getNombre());
        }

        // 3. Buscar en la tabla de usuarios del sistema (administradores, supervisores, gestores)
        Optional<Usuario> usuarioOpt = usuarioRepository.findByDocumento(request.getDocumento());
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            String nombreCompleto = usuario.getNombres() + " " + usuario.getApellidos();
            String rolNombre = (usuario.getRol() != null) ? usuario.getRol().getNombre() : "SISTEMA";

            // Verificar estado del usuario del sistema
            if (usuario.getEstado() != EstadoUsuario.ACTIVO) {
                historial.setResultadoAcceso(ResultadoAcceso.DENEGADO);
                historial.setMotivoDenegacion("La cuenta de usuario del sistema se encuentra " + usuario.getEstado());
                historialRepository.save(historial);
                return new VerificarAccesoResponse(false, ResultadoAcceso.DENEGADO,
                        "Acceso denegado. Cuenta " + rolNombre + " " + usuario.getEstado() + ".",
                        nombreCompleto, area.getNombre());
            }

            // Los usuarios del sistema (admin/supervisor/gestor) tienen acceso maestro a todas las áreas
            historial.setResultadoAcceso(ResultadoAcceso.AUTORIZADO);
            historialRepository.save(historial);
            return new VerificarAccesoResponse(true, ResultadoAcceso.AUTORIZADO,
                    "Acceso concedido. " + rolNombre + " — Acceso maestro al sistema.",
                    nombreCompleto, area.getNombre());
        }

        // 4. No encontrado en ninguna tabla
        historial.setResultadoAcceso(ResultadoAcceso.NO_REGISTRADO);
        historial.setMotivoDenegacion("Documento no encontrado en el sistema");
        historialRepository.save(historial);
        return new VerificarAccesoResponse(false, ResultadoAcceso.NO_REGISTRADO,
                "Credencial no registrada en el sistema.", null, area.getNombre());
    }
}
