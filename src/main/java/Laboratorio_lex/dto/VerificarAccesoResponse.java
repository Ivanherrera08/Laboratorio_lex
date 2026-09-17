package Laboratorio_lex.dto;

import Laboratorio_lex.models.enums.ResultadoAcceso;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VerificarAccesoResponse {
    private boolean permitido;
    private ResultadoAcceso resultado;
    private String mensaje;
    private String empleadoNombre;
    private String areaNombre;
}
