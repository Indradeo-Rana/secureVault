package in.infosys.backend.service;

import in.infosys.backend.entity.RevokedToken;
import in.infosys.backend.repository.RevokedTokenRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

@Service
public class TokenRevocationService {

    private final RevokedTokenRepository revokedTokenRepository;

    public TokenRevocationService(
            RevokedTokenRepository revokedTokenRepository
    ) {
        this.revokedTokenRepository = revokedTokenRepository;
    }

    @Transactional
    public void revokeToken(String token, Date expiration) {
        if (token == null || token.isBlank()) {
            return;
        }
        if (expiration == null) {
            return;
        }
        String tokenHash = hashToken(token);

        LocalDateTime expiresAt =
                expiration.toInstant()
                        .atZone(ZoneId.systemDefault())
                        .toLocalDateTime();

        // don't add duplicate revoked tokens
        if (!revokedTokenRepository.existsByTokenHash(tokenHash)) {

            RevokedToken revokedToken =
                    new RevokedToken(tokenHash, expiresAt);

            revokedTokenRepository.save(revokedToken);
        }
    }

    // checking whether Token is revoked or not
    public boolean isRevoked(String token) {

        if (token == null || token.isBlank()) { return false; }
        String tokenHash = hashToken(token);

        return revokedTokenRepository
                .existsByTokenHash(tokenHash);
    }

    // delete the expired revoked tokens from the database
    @Scheduled(fixedRate = 3600000) // every hour
    @Transactional
    public void cleanExpiredRevokedTokens() {

        revokedTokenRepository.deleteExpiredTokens(LocalDateTime.now());
    }

    // SHA-256 hashing of the token to store in the database
    private String hashToken(String token) {

        try {

            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hash =
                    digest.digest(
                            token.getBytes(StandardCharsets.UTF_8)
                    );

            StringBuilder hexString =
                    new StringBuilder();

            for (byte b : hash) {

                String hex =
                        Integer.toHexString(0xff & b);

                if (hex.length() == 1) {
                    hexString.append('0');
                }

                hexString.append(hex);
            }

            return hexString.toString();

        } catch (Exception e) {

            throw new RuntimeException(
                    "Unable to hash token",
                    e
            );
        }
    }
}