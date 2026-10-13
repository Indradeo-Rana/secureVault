package in.infosys.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailPasswordRecoveryDeliveryService
        implements PasswordRecoveryDeliveryService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    public void deliver(String destination, String token) {

        String resetLink = frontendUrl +
                        "/reset-password?token=" +
                        token;

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(fromEmail);

        message.setTo(destination);

        message.setSubject(
                "SecureVault - Password Reset"
        );

        message.setText(
                "Hello,\n\n" +

                        "We received a request to reset your " +
                        "SecureVault password.\n\n" +

                        "Use the link below to create a new password:\n\n" +

                        resetLink +
                        "\n\n" +

                        "This password reset link will expire " +
                        "in 15 minutes and can only be used once.\n\n" +

                        "If you did not request a password reset, " +
                        "you can safely ignore this email.\n\n" +

                        "Regards,\n" +
                        "SecureVault Team"
        );

        mailSender.send(message);
    }
}