package in.infosys.backend.service;

import in.infosys.backend.cache.RedisCacheService;
import in.infosys.backend.dto.RecentSecurityActivityDto;
import in.infosys.backend.dto.SecurityAnalyticsRequestDto;
import in.infosys.backend.dto.SecurityAnalyticsResponseDto;
import in.infosys.backend.entity.AuditLog;
import in.infosys.backend.entity.LoginActivity;
import in.infosys.backend.entity.SecurityAlert;
import in.infosys.backend.repository.AuditLogRepository;
import in.infosys.backend.repository.LoginActivityRepository;
import in.infosys.backend.repository.SecurityAlertRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class SecurityAnalyticsService {

    private final LoginActivityRepository loginActivityRepository;
    private final SecurityAlertRepository securityAlertRepository;
    private final AuditLogRepository auditLogRepository;
    private final RedisCacheService redisCacheService;

    private final long cacheTtlSeconds;

    public SecurityAnalyticsService(
            LoginActivityRepository loginActivityRepository,
            SecurityAlertRepository securityAlertRepository,
            AuditLogRepository auditLogRepository,
            RedisCacheService redisCacheService,
            @Value("${securevault.cache.security-analytics-ttl-seconds:120}")
            long cacheTtlSeconds) {

        this.loginActivityRepository = loginActivityRepository;
        this.securityAlertRepository = securityAlertRepository;
        this.auditLogRepository = auditLogRepository;
        this.redisCacheService = redisCacheService;
        this.cacheTtlSeconds = cacheTtlSeconds;
    }

    /**
     * Backwards-compatible method used by existing callers.
     */
    public SecurityAnalyticsResponseDto getSecurityAnalytics(
            SecurityAnalyticsRequestDto request) {

        return getSecurityAnalyticsWithCacheStatus(request).data();
    }

    /**
     * Returns the analytics result and whether Redis supplied it.
     */
    public AnalyticsResult getSecurityAnalyticsWithCacheStatus(
            SecurityAnalyticsRequestDto request) {

        String username = getCurrentUsername();
        DateRange dateRange = calculateDateRange(request);

        long version = redisCacheService.getVersion(username);

        String cacheKey = buildCacheKey(
                username,
                dateRange,
                version
        );

        Optional<SecurityAnalyticsResponseDto> cached =
                redisCacheService.get(
                        cacheKey,
                        SecurityAnalyticsResponseDto.class
                );

        if (cached.isPresent()) {
            return new AnalyticsResult(
                    cached.get(),
                    true
            );
        }

        SecurityAnalyticsResponseDto result =
                loadFromPostgres(
                        username,
                        dateRange
                );

        redisCacheService.put(
                cacheKey,
                result,
                Duration.ofSeconds(cacheTtlSeconds)
        );

        return new AnalyticsResult(
                result,
                false
        );
    }

    private SecurityAnalyticsResponseDto loadFromPostgres(
            String username,
            DateRange dateRange) {

        LocalDateTime startDateTime =
                dateRange.startDateTime();

        LocalDateTime endDateTime =
                dateRange.endDateTime();

        List<LoginActivity> loginActivities =
                loginActivityRepository
                        .findAllByUsernameAndTimestampBetweenOrderByTimestampDesc(
                                username,
                                startDateTime,
                                endDateTime
                        );

        long successfulLogins =
                loginActivities
                        .stream()
                        .filter(LoginActivity::isSuccess)
                        .count();

        long failedLogins =
                loginActivities
                        .stream()
                        .filter(activity -> !activity.isSuccess())
                        .count();

        List<SecurityAlert> securityAlerts =
                securityAlertRepository
                        .findAllByUsernameAndCreatedAtBetweenOrderByCreatedAtDesc(
                                username,
                                startDateTime,
                                endDateTime
                        );

        long suspiciousActivities = securityAlerts.size();

        long activeSecurityAlerts =
                securityAlerts
                        .stream()
                        .filter(alert -> !alert.isRead())
                        .count();

        List<AuditLog> auditLogs =
                auditLogRepository
                        .findAllByUsernameAndTimestampBetweenOrderByTimestampDesc(
                                username,
                                startDateTime,
                                endDateTime
                        );

        List<RecentSecurityActivityDto> recentActivity =
                buildRecentSecurityActivity(
                        loginActivities,
                        securityAlerts,
                        auditLogs
                );

        return new SecurityAnalyticsResponseDto(
                dateRange.startDate(),
                dateRange.endDate(),
                successfulLogins,
                failedLogins,
                suspiciousActivities,
                activeSecurityAlerts,
                recentActivity
        );
    }

    private String getCurrentUsername() {

        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            throw new IllegalStateException("Authentication is required");
        }

        return SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();
    }

    private String buildCacheKey(
            String username,
            DateRange range,
            long version) {

        return "securevault:security-analytics:v1:"
                + username
                + ":"
                + range.startDate()
                + ":"
                + range.endDate()
                + ":v"
                + version;
    }

    private DateRange calculateDateRange(
            SecurityAnalyticsRequestDto request) {

        if (request == null ||
                request.getRange() == null ||
                request.getRange().isBlank()) {

            LocalDate today = LocalDate.now();

            return new DateRange(
                    today,
                    today,
                    today.atStartOfDay(),
                    today.atTime(LocalTime.MAX)
            );
        }

        String range =
                request.getRange()
                        .trim()
                        .toUpperCase();

        LocalDate today = LocalDate.now();

        if ("TODAY".equals(range)) {

            return new DateRange(
                    today,
                    today,
                    today.atStartOfDay(),
                    today.atTime(LocalTime.MAX)
            );
        }

        if ("LAST_7_DAYS".equals(range)) {

            LocalDate startDate =
                    today.minusDays(6);

            return new DateRange(
                    startDate,
                    today,
                    startDate.atStartOfDay(),
                    today.atTime(LocalTime.MAX)
            );
        }

        if ("CUSTOM".equals(range)) {

            if (request.getStartDate() == null ||
                    request.getEndDate() == null) {

                throw new IllegalArgumentException(
                        "Start date and end date are required for CUSTOM range"
                );
            }

            if (request.getStartDate()
                    .isAfter(request.getEndDate())) {

                throw new IllegalArgumentException(
                        "Start date cannot be after end date"
                );
            }

            LocalDate startDate = request.getStartDate();
            LocalDate endDate = request.getEndDate();

            return new DateRange(
                    startDate,
                    endDate,
                    startDate.atStartOfDay(),
                    endDate.atTime(LocalTime.MAX)
            );
        }

        throw new IllegalArgumentException(
                "Invalid analytics range. Use TODAY, LAST_7_DAYS or CUSTOM"
        );
    }

    private List<RecentSecurityActivityDto> buildRecentSecurityActivity(
            List<LoginActivity> loginActivities,
            List<SecurityAlert> securityAlerts,
            List<AuditLog> auditLogs) {

        List<RecentSecurityActivityDto> activity =
                new ArrayList<>();

        loginActivities.forEach(login ->
                activity.add(
                        new RecentSecurityActivityDto(
                                login.isSuccess()
                                        ? "LOGIN_SUCCESS"
                                        : "LOGIN_FAILURE",
                                login.isSuccess()
                                        ? "Successful login"
                                        : "Failed login attempt",
                                login.getTimestamp()
                        )
                )
        );

        securityAlerts.forEach(alert ->
                activity.add(
                        new RecentSecurityActivityDto(
                                "SECURITY_ALERT",
                                alert.getMessage(),
                                alert.getCreatedAt()
                        )
                )
        );

        auditLogs.forEach(log ->
                activity.add(
                        new RecentSecurityActivityDto(
                                "AUDIT",
                                log.getDescription(),
                                log.getTimestamp()
                        )
                )
        );

        return activity
                .stream()
                .sorted(
                        Comparator.comparing(
                                RecentSecurityActivityDto::getTimestamp
                        ).reversed()
                )
                .limit(10)
                .toList();
    }

    public record AnalyticsResult(
            SecurityAnalyticsResponseDto data,
            boolean cacheHit) {
    }

    private record DateRange(
            LocalDate startDate,
            LocalDate endDate,
            LocalDateTime startDateTime,
            LocalDateTime endDateTime) {
    }
}
