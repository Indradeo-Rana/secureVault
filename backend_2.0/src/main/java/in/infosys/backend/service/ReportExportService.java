package in.infosys.backend.service;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;

/** Generates downloadable representations of report datasets. Never receives credential plaintext. */
@Service
public class ReportExportService {

    public byte[] generatePdf(String reportTitle, List<Map<String, Object>> rows) {
        try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, output);
            document.open();

            com.lowagie.text.Font titleFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 16, com.lowagie.text.Font.BOLD);
            Paragraph title = new Paragraph("SecureVault - " + safe(reportTitle), titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(12f);
            document.add(title);
            document.add(new Paragraph("Generated at: " + java.time.LocalDateTime.now()));
            document.add(new Paragraph("Records: " + rows.size()));
            document.add(new Paragraph(" "));

            if (rows.isEmpty()) {
                document.add(new Paragraph("No records found for the selected period."));
            } else {
                Map<String, Object> first = rows.get(0);
                PdfPTable table = new PdfPTable(Math.max(1, first.size()));
                table.setWidthPercentage(100);
                table.setHeaderRows(1);
                for (String key : first.keySet()) {
                    table.addCell(new Phrase(safe(key)));
                }
                for (Map<String, Object> row : rows) {
                    for (String key : first.keySet()) {
                        Object value = row.get(key);
                        table.addCell(new Phrase(value == null ? "" : safe(String.valueOf(value))));
                    }
                }
                document.add(table);
            }
            document.close();
            return output.toByteArray();
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to generate PDF report", ex);
        }
    }

    public byte[] generateExcel(String reportTitle, List<Map<String, Object>> rows) {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            XSSFSheet sheet = workbook.createSheet("Report");
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);

            Row titleRow = sheet.createRow(0);
            titleRow.createCell(0).setCellValue("SecureVault - " + safe(reportTitle));
            Row generatedRow = sheet.createRow(1);
            generatedRow.createCell(0).setCellValue("Generated at: " + java.time.LocalDateTime.now());

            if (!rows.isEmpty()) {
                List<String> columns = List.copyOf(rows.get(0).keySet());
                Row header = sheet.createRow(3);
                for (int c = 0; c < columns.size(); c++) {
                    Cell cell = header.createCell(c);
                    cell.setCellValue(columns.get(c));
                    cell.setCellStyle(headerStyle);
                }
                int rowIndex = 4;
                for (Map<String, Object> data : rows) {
                    Row row = sheet.createRow(rowIndex++);
                    for (int c = 0; c < columns.size(); c++) {
                        Object value = data.get(columns.get(c));
                        Cell cell = row.createCell(c);
                        // Write report values as text to prevent formula injection.
                        cell.setCellValue(value == null ? "" : String.valueOf(value));
                    }
                }
                for (int c = 0; c < columns.size(); c++) sheet.autoSizeColumn(c);
            } else {
                sheet.createRow(3).createCell(0).setCellValue("No records found for the selected period.");
            }
            workbook.write(output);
            return output.toByteArray();
        } catch (IOException ex) {
            throw new IllegalStateException("Unable to generate Excel report", ex);
        }
    }

    private String safe(String value) {
        if (value == null) return "";
        // Avoid control characters that can corrupt text-based report layouts.
        return value.replace('\r', ' ').replace('\n', ' ');
    }
}
