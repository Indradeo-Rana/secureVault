package in.infosys.backend.service;

import in.infosys.backend.dto.ForgotPasswordRequestDto;
import in.infosys.backend.dto.ResetPasswordRequestDto;
import in.infosys.backend.entity.PasswordRecoveryToken;
import in.infosys.backend.entity.User;
import in.infosys.backend.repository.PasswordRecoveryTokenRepository;
import in.infosys.backend.repository.UserRepository;
import in.infosys.backend.util.TokenHashUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class PasswordRecoveryService {

    private static final int TOKEN_MINUTES = 15;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordRecoveryTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordRecoveryDeliveryService deliveryService;
    private final NotificationService notificationService;

    @Transactional
    public void initiate(ForgotPasswordRequestDto request) {

        // Empty request par kuch bhi reveal nahi karna
        if (request == null ||
                request.getIdentifier() == null ||
                request.getIdentifier().isBlank()) {
            return;
        }

        String email = request.getIdentifier().trim();

        // Forgot Password ab sirf EMAIL se work karega
        User user = userRepository.findByEmail(email)
                .orElse(null);

        // Security ke liye generic behaviour
        if (user == null) {
            return;
        }

        // Purane unused recovery tokens invalidate kar sakte hain
        // agar repository me suitable method available ho.
        // Abhi existing structure ko change nahi kar rahe.

        String rawToken = generateToken();

        PasswordRecoveryToken entity =
                new PasswordRecoveryToken(
                        user,
                        TokenHashUtil.sha256(rawToken),
                        LocalDateTime.now().plusMinutes(TOKEN_MINUTES)
                );

        tokenRepository.save(entity);

        // Raw token sirf email delivery service ko jayega.
        // Database me raw token save nahi hota.
        deliveryService.deliver(
                user.getEmail(),
                rawToken
        );
    }

    @Transactional
    public void reset(ResetPasswordRequestDto request) {

        if (request == null ||
                request.getToken() == null ||
                request.getToken().isBlank()) {

            throw new IllegalArgumentException(
                    "Invalid recovery token"
            );
        }

        validateNewPassword(request.getNewPassword());

        String tokenHash =
                TokenHashUtil.sha256(request.getToken());

        PasswordRecoveryToken token =
                tokenRepository
                        .findByTokenHashAndUsedFalse(tokenHash)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Invalid or expired recovery token"
                                )
                        );

        if (token.getExpiresAt()
                .isBefore(LocalDateTime.now())) {

            throw new IllegalArgumentException(
                    "Invalid or expired recovery token"
            );
        }

        User user = token.getUser();

        // Old password ko read/decrypt nahi karna.
        // Directly new BCrypt hash save karna hai.
        user.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );

        user.setPasswordChangedAt(
                LocalDateTime.now()
        );

        userRepository.save(user);

        // Token ko one-time use banao
        token.setUsed(true);
        tokenRepository.save(token);

        notificationService.securityNotification(
                user,
                "Password changed successfully",
                "Your password has been changed successfully. " +
                        "If you did not initiate this change, " +
                        "please contact support immediately."
        );
    }

    private void validateNewPassword(String password) {

        if (password == null ||
                password.isBlank() ||
                password.length() < 8) {

            throw new IllegalArgumentException(
                    "New password must contain at least 8 characters"
            );
        }
    }

    private String generateToken() {

        byte[] bytes = new byte[32];

        RANDOM.nextBytes(bytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);
    }
}