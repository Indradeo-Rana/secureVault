package in.infosys.backend.service;

import in.infosys.backend.dto.PasswordHealthResponseDto;
import in.infosys.backend.dto.PasswordReuseResponseDto;
import in.infosys.backend.dto.SecurityAnalyticsRequestDto;
import in.infosys.backend.dto.SecurityReportResponseDto;
import in.infosys.backend.entity.AuditLog;
import in.infosys.backend.entity.LoginActivity;
import in.infosys.backend.entity.SecurityAlert;
import in.infosys.backend.repository.AuditLogRepository;
import in.infosys.backend.repository.LoginActivityRepository;
import in.infosys.backend.repository.SecurityAlertRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/** Builds user-scoped report datasets from the application's existing repositories/services. */
@Service
public class ReportDatasetService {
    private final AuditLogRepository auditLogRepository;
    private final LoginActivityRepository loginActivityRepository;
    private final SecurityAlertRepository securityAlertRepository;
    private final SecurityReportService securityReportService;
    private final AnalyticsService analyticsService;

    public ReportDatasetService(AuditLogRepository auditLogRepository,
                                LoginActivityRepository loginActivityRepository,
                                SecurityAlertRepository securityAlertRepository,
                                SecurityReportService securityReportService,
                                AnalyticsService analyticsService) {
        this.auditLogRepository = auditLogRepository;
        this.loginActivityRepository = loginActivityRepository;
        this.securityAlertRepository = securityAlertRepository;
        this.securityReportService = securityReportService;
        this.analyticsService = analyticsService;
    }

    public List<Map<String, Object>> build(String reportType, SecurityAnalyticsRequestDto request) {
        String username = currentUsername();
        DateRange range = resolveRange(request);
        String type = reportType == null ? "" : reportType.trim().toUpperCase(Locale.ROOT).replace('-', '_');

        return switch (type) {
            case "SECURITY", "SECURITY_REPORT" -> securityRows(request);
            case "PASSWORD_HEALTH", "PASSWORD_HEALTH_REPORT" -> passwordHealthRows();
            case "AUDIT", "AUDIT_REPORT" -> auditRows(username, range);
            case "USER_ACTIVITY", "USER_ACTIVITY_REPORT" -> activityRows(username, range);
            case "THREAT_MONITORING", "THREAT", "THREAT_MONITORING_REPORT" -> threatRows(username, range);
            default -> throw new IllegalArgumentException("Unsupported report type. Use SECURITY, PASSWORD_HEALTH, AUDIT, USER_ACTIVITY, or THREAT_MONITORING.");
        };
    }

    public String normalizedTitle(String reportType) {
        String type = reportType == null ? "" : reportType.trim().toUpperCase(Locale.ROOT).replace('-', '_');
        return switch (type) {
            case "SECURITY", "SECURITY_REPORT" -> "Security Report";
            case "PASSWORD_HEALTH", "PASSWORD_HEALTH_REPORT" -> "Password Health Report";
            case "AUDIT", "AUDIT_REPORT" -> "Audit Report";
            case "USER_ACTIVITY", "USER_ACTIVITY_REPORT" -> "User Activity Report";
            case "THREAT_MONITORING", "THREAT", "THREAT_MONITORING_REPORT" -> "Threat Monitoring Report";
            default -> throw new IllegalArgumentException("Unsupported report type");
        };
    }

    private List<Map<String, Object>> securityRows(SecurityAnalyticsRequestDto request) {
        SecurityReportResponseDto report = securityReportService.generateReport(request);
        List<Map<String, Object>> rows = new ArrayList<>();
        addMetric(rows, "Start date", report.getStartDate());
        addMetric(rows, "End date", report.getEndDate());
        addMetric(rows, "Successful logins", report.getSuccessfulLogins());
        addMetric(rows, "Failed logins", report.getFailedLogins());
        addMetric(rows, "Suspicious activities", report.getSuspiciousActivities());
        addMetric(rows, "Active security alerts", report.getActiveSecurityAlerts());
        addMetric(rows, "Total passwords", report.getTotalPasswords());
        addMetric(rows, "Strong passwords", report.getStrongPasswords());
        addMetric(rows, "Medium passwords", report.getMediumPasswords());
        addMetric(rows, "Weak passwords", report.getWeakPasswords());
        addMetric(rows, "Reused password groups", report.getReusedPasswordGroups());
        return rows;
    }

    private List<Map<String, Object>> passwordHealthRows() {
        PasswordHealthResponseDto health = analyticsService.getPasswordHealth();
        List<PasswordReuseResponseDto> reused = analyticsService.getPasswordReuse();
        List<Map<String, Object>> rows = new ArrayList<>();
        addMetric(rows, "Total passwords", health.getTotalPasswords());
        addMetric(rows, "Strong passwords", health.getStrongPasswords());
        addMetric(rows, "Medium passwords", health.getMediumPasswords());
        addMetric(rows, "Weak passwords", health.getWeakPasswords());
        addMetric(rows, "Reused password groups", reused.size());
        return rows;
    }

    private List<Map<String, Object>> auditRows(String username, DateRange range) {
        List<AuditLog> logs = auditLogRepository.findAllByUsernameAndTimestampBetweenOrderByTimestampDesc(
                username, range.start(), range.end());
        List<Map<String, Object>> rows = new ArrayList<>();
        for (AuditLog log : logs) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("timestamp", log.getTimestamp());
            row.put("action", log.getAction());
            row.put("resourceType", log.getResourceType());
            row.put("resourceId", log.getResourceId());
            row.put("description", log.getDescription());
            rows.add(row);
        }
        return rows;
    }

    private List<Map<String, Object>> activityRows(String username, DateRange range) {
        List<LoginActivity> activities = loginActivityRepository
                .findAllByUsernameAndTimestampBetweenOrderByTimestampDesc(username, range.start(), range.end());
        List<Map<String, Object>> rows = new ArrayList<>();
        for (LoginActivity activity : activities) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("timestamp", activity.getTimestamp());
            row.put("success", activity.isSuccess());
            row.put("ipAddress", activity.getIpAddress());
            rows.add(row);
        }
        return rows;
    }

    private List<Map<String, Object>> threatRows(String username, DateRange range) {
        List<SecurityAlert> alerts = securityAlertRepository
                .findAllByUsernameAndCreatedAtBetweenOrderByCreatedAtDesc(username, range.start(), range.end());
        List<Map<String, Object>> rows = new ArrayList<>();
        for (SecurityAlert alert : alerts) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("createdAt", alert.getCreatedAt());
            row.put("type", alert.getType());
            row.put("message", alert.getMessage());
            row.put("ipAddress", alert.getIpAddress());
            row.put("read", alert.isRead());
            rows.add(row);
        }
        return rows;
    }

    private void addMetric(List<Map<String, Object>> rows, String metric, Object value) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("metric", metric);
        row.put("value", value);
        rows.add(row);
    }

    private String currentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getName() == null || "anonymousUser".equals(authentication.getName())) {
            throw new org.springframework.security.access.AccessDeniedException("Authentication is required to access reports");
        }
        return authentication.getName();
    }

    private DateRange resolveRange(SecurityAnalyticsRequestDto request) {
        LocalDate today = LocalDate.now();
        if (request == null || request.getRange() == null || request.getRange().isBlank()
                || "TODAY".equalsIgnoreCase(request.getRange())) {
            return new DateRange(today.atStartOfDay(), today.atTime(LocalTime.MAX));
        }
        String range = request.getRange().trim().toUpperCase(Locale.ROOT);
        if ("LAST_7_DAYS".equals(range)) {
            return new DateRange(today.minusDays(6).atStartOfDay(), today.atTime(LocalTime.MAX));
        }
        if ("CUSTOM".equals(range)) {
            if (request.getStartDate() == null || request.getEndDate() == null) {
                throw new IllegalArgumentException("Start date and end date are required for CUSTOM range");
            }
            if (request.getStartDate().isAfter(request.getEndDate())) {
                throw new IllegalArgumentException("Start date cannot be after end date");
            }
            return new DateRange(request.getStartDate().atStartOfDay(), request.getEndDate().atTime(LocalTime.MAX));
        }
        throw new IllegalArgumentException("Invalid range. Use TODAY, LAST_7_DAYS, or CUSTOM");
    }

    private record DateRange(LocalDateTime start, LocalDateTime end) { }
}
