package in.infosys.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_device_tokens",
        indexes = {
                @Index(name = "idx_user_device_token_user", columnList = "user_id"),
                @Index(name = "idx_user_device_token_token", columnList = "token") }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDeviceToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true, length = 1000)
    private String token;

    @Column(length = 100)
    private String deviceType;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false) private LocalDateTime lastUsedAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() { lastUsedAt = LocalDateTime.now(); }
}