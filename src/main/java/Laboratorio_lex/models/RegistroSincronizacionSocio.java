package Laboratorio_lex.models;

import Laboratorio_lex.models.enums.EstadoSincronizacion;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@Entity
@Table(name = "registro_sincronizacion_socio", schema = "zone_control")
public class RegistroSincronizacionSocio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departamento_id", nullable = false)
    private Departamento departamento;

    @Column(name = "periodo_inicio", nullable = false)
    private OffsetDateTime periodoInicio;

    @Column(name = "periodo_fin", nullable = false)
    private OffsetDateTime periodoFin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoSincronizacion estado = EstadoSincronizacion.EN_REINTENTO;

    @Column(name = "intentos_realizados", nullable = false)
    private Short intentosRealizados = 0;

    @Column(name = "codigo_respuesta_http")
    private Integer codigoRespuestaHttp;

    @Column(name = "fecha_envio")
    private OffsetDateTime fechaEnvio;

    @Column(name = "fecha_proximo_reintento")
    private OffsetDateTime fechaProximoReintento;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
