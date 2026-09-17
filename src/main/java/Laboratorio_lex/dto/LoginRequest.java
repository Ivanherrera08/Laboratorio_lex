package Laboratorio_lex.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "El documento es obligatorio")
    private String documento;

    @NotBlank(message = "La contraseña es obligatoria")
    private String password;
}
