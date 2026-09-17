package Laboratorio_lex.models;

import Laboratorio_lex.models.enums.ResultadoAcceso;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@Entity
@Table(name = "historial_accesos", schema = "zone_control")
public class HistorialAcceso {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private java.util.UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empleado_id")
    private Empleado empleado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "area_id", nullable = false)
    private AreaRestringida area;

    @Column(name = "numero_documento_ingresado", length = 20)
    private String numeroDocumentoIngresado;

    @Column(name = "codigo_tarjeta_ingresado", length = 50)
    private String codigoTarjetaIngresado;

    @Enumerated(EnumType.STRING)
    @Column(name = "resultado_acceso", nullable = false)
    private ResultadoAcceso resultadoAcceso;

    @Column(name = "motivo_denegacion", length = 255)
    private String motivoDenegacion;

    @Column(nullable = false, updatable = false)
    private OffsetDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = OffsetDateTime.now();
        }
    }
}
