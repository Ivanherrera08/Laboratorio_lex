package Laboratorio_lex.repositories;

import Laboratorio_lex.models.HistorialAcceso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HistorialAccesoRepository extends JpaRepository<HistorialAcceso, Long> {
}
