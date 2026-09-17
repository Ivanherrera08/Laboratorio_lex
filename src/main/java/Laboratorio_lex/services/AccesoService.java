package Laboratorio_lex.services;

import Laboratorio_lex.dto.VerificarAccesoRequest;
import Laboratorio_lex.dto.VerificarAccesoResponse;
import Laboratorio_lex.models.AreaRestringida;
import Laboratorio_lex.models.AutorizacionZona;
import Laboratorio_lex.models.Empleado;
import Laboratorio_lex.models.HistorialAcceso;
import Laboratorio_lex.models.enums.EstadoEmpleado;
import Laboratorio_lex.models.enums.ResultadoAcceso;
import Laboratorio_lex.repositories.AreaRestringidaRepository;
import Laboratorio_lex.repositories.AutorizacionZonaRepository;
import Laboratorio_lex.repositories.EmpleadoRepository;
import Laboratorio_lex.repositories.HistorialAccesoRepository;
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

        // 2. Buscar al empleado
        Optional<Empleado> empleadoOpt = empleadoRepository.findByNumeroDocumento(request.getDocumento());
        if (empleadoOpt.isEmpty()) {
            historial.setResultadoAcceso(ResultadoAcceso.NO_REGISTRADO);
            historial.setMotivoDenegacion("Documento no encontrado en el sistema");
            historialRepository.save(historial);
            return new VerificarAccesoResponse(false, ResultadoAcceso.NO_REGISTRADO, "Personal no registrado.", null, area.getNombre());
        }

        Empleado empleado = empleadoOpt.get();
        historial.setEmpleado(empleado);

        // 3. Verificar estado del empleado
        if (empleado.getEstado() != EstadoEmpleado.ACTIVO) {
            historial.setResultadoAcceso(ResultadoAcceso.DENEGADO);
            historial.setMotivoDenegacion("El empleado se encuentra " + empleado.getEstado());
            historialRepository.save(historial);
            return new VerificarAccesoResponse(false, ResultadoAcceso.DENEGADO, "Acceso denegado. Empleado Inactivo o Bloqueado.", empleado.getNombres(), area.getNombre());
        }

        // 4. Verificar Autorización en el Área
        Optional<AutorizacionZona> autorizacion = autorizacionRepository.findActiveAutorizacion(empleado.getId(), area.getId());
        if (autorizacion.isEmpty()) {
            historial.setResultadoAcceso(ResultadoAcceso.DENEGADO);
            historial.setMotivoDenegacion("No tiene autorización activa para esta área");
            historialRepository.save(historial);
            return new VerificarAccesoResponse(false, ResultadoAcceso.DENEGADO, "No posee autorización para esta zona.", empleado.getNombres(), area.getNombre());
        }

        // 5. Autorizado
        historial.setResultadoAcceso(ResultadoAcceso.AUTORIZADO);
        historialRepository.save(historial);

        return new VerificarAccesoResponse(true, ResultadoAcceso.AUTORIZADO, "Acceso concedido exitosamente.", empleado.getNombres(), area.getNombre());
    }
}
