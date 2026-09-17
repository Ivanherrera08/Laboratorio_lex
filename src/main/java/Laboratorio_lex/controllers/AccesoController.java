package Laboratorio_lex.controllers;

import Laboratorio_lex.dto.VerificarAccesoRequest;
import Laboratorio_lex.dto.VerificarAccesoResponse;
import Laboratorio_lex.services.AccesoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/accesos")
public class AccesoController {

    @Autowired
    private AccesoService accesoService;

    @PostMapping("/verificar")
    public ResponseEntity<VerificarAccesoResponse> verificarAcceso(@Valid @RequestBody VerificarAccesoRequest request) {
        VerificarAccesoResponse response = accesoService.verificarYRegistrarAcceso(request);
        return ResponseEntity.ok(response);
    }
}
