package in.infosys.backend.repository;

import in.infosys.backend.entity.RevokedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

public interface RevokedTokenRepository
        extends JpaRepository<RevokedToken, Long> {

    boolean existsByTokenHash(String tokenHash);

    Optional<RevokedToken> findByTokenHash(String tokenHash);

    @Modifying
    @Transactional
    @Query("""
            DELETE FROM RevokedToken r
            WHERE r.expiresAt < :now
            """)
    void deleteExpiredTokens(
            @Param("now") LocalDateTime now
    );
}