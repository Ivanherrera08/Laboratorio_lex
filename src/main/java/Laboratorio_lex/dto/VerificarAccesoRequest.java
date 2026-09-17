package Laboratorio_lex.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VerificarAccesoRequest {

    @NotBlank(message = "El documento es obligatorio")
    private String documento;

    @NotNull(message = "El ID del área es obligatorio")
    private Integer areaId;
}
