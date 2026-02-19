package com.rasras.erp.system;

import com.rasras.erp.shared.dto.ApiResponse;
import com.rasras.erp.shared.security.SecurityConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/settings/database")
@RequiredArgsConstructor
@Tag(name = "Database & Logs", description = "Database Restore and System Log APIs")
@Tag(name = "Database & Logs", description = "Database Restore, SQL Execution, and System Log APIs")
public class DatabaseController {

    private final DatabaseService databaseService;
    private final LogService logService;

    @PostMapping("/restore")
    @PreAuthorize(SecurityConstants.SYSTEM_ADMIN_ONLY)
    @Operation(summary = "Restore Database", description = "Restores the database from an uploaded SQL file. WARNING: Overwrites existing data.")
    public ResponseEntity<ApiResponse<String>> restoreDatabase(
            @RequestParam("file") MultipartFile file,
            @RequestParam("dbUser") String dbUser,
            @RequestParam("dbPassword") String dbPassword) {
        try {
            String result = databaseService.restoreDatabase(file, dbUser, dbPassword);
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Restore failed: " + e.getMessage()));
        }
    }

    @GetMapping("/backup")
    @PreAuthorize(SecurityConstants.SYSTEM_ADMIN_ONLY)
    @Operation(summary = "Download Database Backup", description = "Generates and downloads an SQL backup of the current database.")
    public ResponseEntity<Resource> downloadBackup(
            @RequestParam("dbUser") String dbUser,
            @RequestParam("dbPassword") String dbPassword) {
        try {
            byte[] data = databaseService.generateBackup(dbUser, dbPassword);
            ByteArrayResource resource = new ByteArrayResource(data);

            String filename = "backup_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"))
                    + ".sql";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .contentLength(data.length)
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/overview")
    @PreAuthorize(SecurityConstants.SYSTEM_ADMIN_ONLY)
    @Operation(summary = "Get Database Overview", description = "Returns statistics about database tables (rows, size, etc.)")
    public ResponseEntity<ApiResponse<List<DatabaseService.TableStatus>>> getDatabaseOverview() {
        return ResponseEntity.ok(ApiResponse.success(databaseService.getDatabaseOverview()));
    }

    @GetMapping("/table/{tableName}/data")
    @PreAuthorize(SecurityConstants.SYSTEM_ADMIN_ONLY)
    @Operation(summary = "Get Table Data", description = "Returns the first N rows of a specific table")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTableData(
            @PathVariable String tableName,
            @RequestParam(defaultValue = "50") int limit) {
        try {
            return ResponseEntity.ok(ApiResponse.success(databaseService.getTableData(tableName, limit)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to fetch table data: " + e.getMessage()));
        }
    }

    @GetMapping("/logs")
    @PreAuthorize(SecurityConstants.SYSTEM_ADMIN_ONLY)
    @Operation(summary = "Get System Logs", description = "Returns the last N lines of system logs")
    public ResponseEntity<ApiResponse<List<String>>> getSystemLogs(@RequestParam(defaultValue = "100") int lines) {
        return ResponseEntity.ok(ApiResponse.success(logService.getSystemLogs(lines)));
    }

    @PostMapping("/execute-sql")
    @PreAuthorize(SecurityConstants.SYSTEM_ADMIN_ONLY)
    @Operation(summary = "Execute SQL Script", description = "Executes a raw SQL script.")
    public ResponseEntity<ApiResponse<String>> executeSql(@RequestBody Map<String, String> payload) {
        try {
            String sql = payload.get("sql");
            if (sql == null || sql.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("SQL script cannot be empty"));
            }
            String result = databaseService.executeSqlScript(sql);
            return ResponseEntity.ok(ApiResponse.success("Execution Successful", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Execution failed: " + e.getMessage()));
        }
    }

    @PostMapping("/clear-tables")
    @PreAuthorize(SecurityConstants.SYSTEM_ADMIN_ONLY)
    @Operation(summary = "Clear Tables", description = "Clears data from selected tables with optional FK check disable.")
    public ResponseEntity<ApiResponse<String>> clearTables(@RequestBody Map<String, Object> payload) {
        try {
            List<String> tables = (List<String>) payload.get("tables");
            boolean disableFk = (boolean) payload.getOrDefault("disableFk", false);

            if (tables == null || tables.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("No tables selected"));
            }

            databaseService.clearTables(tables, disableFk);
            return ResponseEntity.ok(ApiResponse.success("Selected tables cleared successfully."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to clear tables: " + e.getMessage()));
        }
    }

    @GetMapping("/error-logs")
    @PreAuthorize(SecurityConstants.SYSTEM_ADMIN_ONLY)
    @Operation(summary = "Get Database Error Logs", description = "Returns the persistent database operation error logs.")
    public ResponseEntity<ApiResponse<List<String>>> getErrorLogs() {
        return ResponseEntity.ok(ApiResponse.success(databaseService.getErrorLogs()));
    }
}
