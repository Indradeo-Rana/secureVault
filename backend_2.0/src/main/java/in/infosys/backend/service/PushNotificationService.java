package in.infosys.backend.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import in.infosys.backend.entity.User;
import in.infosys.backend.entity.UserDeviceToken;
import in.infosys.backend.repository.UserDeviceTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PushNotificationService {

    private final UserDeviceTokenRepository userDeviceTokenRepository;

    @Value("${notification.push.enabled:false}")
    private boolean enabled;

    public PushNotificationService(
            UserDeviceTokenRepository userDeviceTokenRepository
    ) {
        this.userDeviceTokenRepository =
                userDeviceTokenRepository;
    }

    // =========================================================
    // SEND PUSH TO ALL USER DEVICES
    // =========================================================

    public boolean send(
            User user,
            String title,
            String message
    ) {

        if (user == null) {
            return false;
        }

        if (!enabled) {

            System.out.println(
                    "[PUSH DISABLED] User: "
                            + user.getUsername()
                            + " | "
                            + title
                            + " | "
                            + message
            );

            return false;
        }

        List<UserDeviceToken> deviceTokens =
                userDeviceTokenRepository.findAllByUser(user);

        if (deviceTokens == null || deviceTokens.isEmpty()) {

            System.out.println(
                    "[PUSH SKIPPED] No registered FCM token for user: "
                            + user.getUsername()
            );

            return false;
        }

        boolean atLeastOneSuccess = false;

        for (UserDeviceToken deviceToken : deviceTokens) {

            try {

                sendToToken(
                        deviceToken.getToken(),
                        title,
                        message
                );

                atLeastOneSuccess = true;

                System.out.println(
                        "[PUSH SUCCESS] User: "
                                + user.getUsername()
                                + " | Device: "
                                + deviceToken.getDeviceType()
                );

            } catch (Exception e) {

                System.err.println(
                        "[PUSH FAILED] User: "
                                + user.getUsername()
                                + " | Device: "
                                + deviceToken.getDeviceType()
                                + " | Error: "
                                + e.getMessage()
                );

                /*
                 * Invalid Firebase tokens should not remain
                 * in the database forever.
                 */
                if (isInvalidTokenError(e)) {

                    userDeviceTokenRepository
                            .deleteByToken(
                                    deviceToken.getToken()
                            );
                }
            }
        }

        return atLeastOneSuccess;
    }

    // =========================================================
    // SEND TO ONE FCM TOKEN
    // =========================================================

    private void sendToToken(
            String token,
            String title,
            String message
    ) throws Exception {

        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException(
                    "FCM token is empty"
            );
        }

        Notification notification =
                Notification.builder()
                        .setTitle(title)
                        .setBody(message)
                        .build();

        Message firebaseMessage =
                Message.builder()
                        .setToken(token)
                        .setNotification(notification)
                        .build();

        FirebaseMessaging
                .getInstance()
                .send(firebaseMessage);
    }

    // =========================================================
    // INVALID TOKEN DETECTION
    // =========================================================

    private boolean isInvalidTokenError(
            Exception exception
    ) {

        String error =
                exception.getMessage();

        if (error == null) {
            return false;
        }

        String lower =
                error.toLowerCase();

        return lower.contains("registration-token-not-registered")
                || lower.contains("unregistered")
                || lower.contains("invalid-registration-token")
                || lower.contains("invalid argument");
    }
}

