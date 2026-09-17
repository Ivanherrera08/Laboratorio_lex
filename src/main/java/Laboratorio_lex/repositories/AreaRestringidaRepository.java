package Laboratorio_lex.repositories;

import Laboratorio_lex.models.AreaRestringida;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AreaRestringidaRepository extends JpaRepository<AreaRestringida, Integer> {
}
