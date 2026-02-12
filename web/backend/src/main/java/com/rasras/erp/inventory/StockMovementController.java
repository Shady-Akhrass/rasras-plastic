package com.rasras.erp.inventory;

import com.rasras.erp.inventory.dto.StockMovementItemDto;
import com.rasras.erp.shared.dto.ApiResponse;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/stock-movements")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StockMovementController {

    private final StockMovementService stockMovementService;

    /**
     * JSON endpoint مع فلترة وترقيم صفحات.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<StockMovementItemDto>>> getMovementsByItem(
            @RequestParam Integer itemId,
            @RequestParam(required = false) Integer warehouseId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @PageableDefault(size = 50) Pageable pageable) {

        Page<StockMovementItemDto> page = stockMovementService.getMovementsByItem(
                itemId, warehouseId, fromDate, toDate, pageable);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    /**
     * Excel حقيقي (.xlsx) لنفس الفلاتر.
     */
    @GetMapping("/export")
    public void exportMovementsToExcel(
            @RequestParam Integer itemId,
            @RequestParam(required = false) Integer warehouseId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            HttpServletResponse response) throws IOException {

        Page<StockMovementItemDto> page = stockMovementService.getMovementsByItem(
                itemId, warehouseId, fromDate, toDate, Pageable.unpaged());
        List<StockMovementItemDto> movements = page.getContent();

        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Item Movements");

            // Header
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("Date");
            header.createCell(1).setCellValue("Type");
            header.createCell(2).setCellValue("Qty");
            header.createCell(3).setCellValue("Balance");
            header.createCell(4).setCellValue("Ref");

            int rowIdx = 1;
            for (StockMovementItemDto m : movements) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(m.getDate() != null ? m.getDate().toString() : "");
                row.createCell(1).setCellValue(m.getType() != null ? m.getType() : "");
                row.createCell(2).setCellValue(m.getQty() != null ? m.getQty().doubleValue() : 0d);
                row.createCell(3).setCellValue(m.getBalance() != null ? m.getBalance().doubleValue() : 0d);
                row.createCell(4).setCellValue(m.getRef() != null ? m.getRef() : "");
            }

            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition", "attachment; filename=\"item-movements.xlsx\"");

            workbook.write(response.getOutputStream());
        }
    }
}
