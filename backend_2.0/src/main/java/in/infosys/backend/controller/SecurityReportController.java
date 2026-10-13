package in.infosys.backend.controller;

import in.infosys.backend.dto.SecurityAnalyticsRequestDto;
import in.infosys.backend.dto.SecurityReportResponseDto;
import in.infosys.backend.service.ReportDatasetService;
import in.infosys.backend.service.ReportExportService;
import in.infosys.backend.service.SecurityReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class SecurityReportController {

    private final SecurityReportService securityReportService;
    private final ReportDatasetService reportDatasetService;
    private final ReportExportService reportExportService;

    public SecurityReportController(SecurityReportService securityReportService,
                                    ReportDatasetService reportDatasetService,
                                    ReportExportService reportExportService) {
        this.securityReportService = securityReportService;
        this.reportDatasetService = reportDatasetService;
        this.reportExportService = reportExportService;
    }

    /** Existing endpoint retained for compatibility with the current frontend. */
    @PostMapping("/security")
    public ResponseEntity<SecurityReportResponseDto> generateSecurityReport(
            @RequestBody(required = false) SecurityAnalyticsRequestDto request) {
        return ResponseEntity.ok(securityReportService.generateReport(request));
    }

    /** JSON report dataset. Example: GET /api/reports/AUDIT?range=LAST_7_DAYS */
    @GetMapping("/{type}")
    public ResponseEntity<List<Map<String, Object>>> getReport(
            @PathVariable String type,
            @RequestParam(required = false) String range,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reportDatasetService.build(type, request(range, startDate, endDate)));
    }

    /** PDF/Excel download. Example: GET /api/reports/AUDIT/export?format=pdf&range=TODAY */
    @GetMapping("/{type}/export")
    public ResponseEntity<byte[]> exportReport(
            @PathVariable String type,
            @RequestParam(defaultValue = "pdf") String format,
            @RequestParam(required = false) String range,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        String normalizedFormat = format.trim().toLowerCase();
        String title = reportDatasetService.normalizedTitle(type);
        List<Map<String, Object>> rows = reportDatasetService.build(type, request(range, startDate, endDate));
        byte[] bytes;
        String filename;
        MediaType mediaType;

        if ("pdf".equals(normalizedFormat)) {
            bytes = reportExportService.generatePdf(title, rows);
            filename = filePrefix(type) + "-report.pdf";
            mediaType = MediaType.APPLICATION_PDF;
        } else if ("excel".equals(normalizedFormat) || "xlsx".equals(normalizedFormat)) {
            bytes = reportExportService.generateExcel(title, rows);
            filename = filePrefix(type) + "-report.xlsx";
            mediaType = MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        } else {
            throw new IllegalArgumentException("Unsupported export format. Use pdf or excel");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(mediaType);
        headers.setContentLength(bytes.length);
        headers.setContentDisposition(ContentDisposition.attachment().filename(filename).build());
        headers.setCacheControl("no-store, no-cache, must-revalidate");
        return ResponseEntity.ok().headers(headers).body(bytes);
    }

    private SecurityAnalyticsRequestDto request(String range, LocalDate startDate, LocalDate endDate) {
        SecurityAnalyticsRequestDto request = new SecurityAnalyticsRequestDto();
        request.setRange(range == null || range.isBlank() ? "TODAY" : range);
        request.setStartDate(startDate);
        request.setEndDate(endDate);
        if ("CUSTOM".equalsIgnoreCase(request.getRange()) && (startDate == null || endDate == null)) {
            throw new IllegalArgumentException("startDate and endDate are required when range=CUSTOM");
        }
        return request;
    }

    private String filePrefix(String type) {
        return type == null ? "securevault" : type.toLowerCase().replaceAll("[^a-z0-9_-]", "-");
    }
}
