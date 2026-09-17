package Laboratorio_lex.repositories;

import Laboratorio_lex.models.AutorizacionZona;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AutorizacionZonaRepository extends JpaRepository<AutorizacionZona, Long> {

    @Query("SELECT a FROM AutorizacionZona a WHERE a.empleado.id = :empleadoId AND a.area.id = :areaId AND a.activo = true")
    Optional<AutorizacionZona> findActiveAutorizacion(
            @Param("empleadoId") Long empleadoId, 
            @Param("areaId") Integer areaId
    );
}
