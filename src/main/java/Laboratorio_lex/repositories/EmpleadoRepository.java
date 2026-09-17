package Laboratorio_lex.repositories;

import Laboratorio_lex.models.Empleado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmpleadoRepository extends JpaRepository<Empleado, Long> {
    Optional<Empleado> findByNumeroDocumento(String numeroDocumento);
    Optional<Empleado> findByCodigoTarjetaRfid(String codigoTarjetaRfid);
}
