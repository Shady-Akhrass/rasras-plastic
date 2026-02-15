package com.rasras.erp.system;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class DatabaseService {

    private final JdbcTemplate jdbcTemplate;

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${app.database.mysql-path:mysql}")
    private String mysqlPath;

    @Value("${app.database.mysqldump-path:mysqldump}")
    private String mysqldumpPath;

    private static final String RESTORE_FILE_NAME = "restore_point.sql";
    private static final String TEMP_DIR = "temp_restore";

    public String restoreDatabase(MultipartFile file, String providedUser, String providedPassword)
            throws IOException, InterruptedException {
        log.info("Starting database restore process...");

        // 1. Prepare temp directory
        Path tempPath = Paths.get(TEMP_DIR);
        if (!Files.exists(tempPath)) {
            Files.createDirectories(tempPath);
        }

        // 2. Handle file (Overwrite logic)
        Path targetPath = tempPath.resolve(RESTORE_FILE_NAME);
        if (Files.exists(targetPath)) {
            log.info("Deleting old restore file: {}", targetPath);
            Files.delete(targetPath);
        }

        log.info("Saving new restore file: {}", targetPath);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        // 3. Parse Database Name from URL
        String dbName = dbUrl.substring(dbUrl.lastIndexOf("/") + 1);
        if (dbName.contains("?")) {
            dbName = dbName.substring(0, dbName.indexOf("?"));
        }
        log.info("Target Database: {}", dbName);

        // 4. Clean Database (Drop and Recreate)
        cleanDatabase(providedUser, providedPassword, dbName);

        log.info("Executing restore command: {} -u{} -p**** {}", mysqlPath, providedUser, dbName);
        List<String> command = new ArrayList<>();
        command.add(mysqlPath);
        command.add("-u" + providedUser);
        if (providedPassword != null && !providedPassword.isEmpty()) {
            command.add("-p" + providedPassword);
        }
        command.add(dbName);
        ProcessBuilder pb = new ProcessBuilder(command);
        pb.redirectInput(targetPath.toFile());
        pb.redirectErrorStream(true); // Merge stderr into stdout

        Process process = pb.start();

        // Read output
        StringBuilder output = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
                log.debug("Restore Output: {}", line);
            }
        }

        int exitCode = process.waitFor();
        if (exitCode == 0) {
            log.info("Database restore completed successfully.");
            return "Restore successful.\n" + output.toString();
        } else {
            log.error("Database restore failed with exit code: {}", exitCode);
            throw new RuntimeException("Restore failed (Exit Code: " + exitCode + ")\n" + output.toString());
        }
    }

    private void cleanDatabase(String providedUser, String providedPassword, String dbName)
            throws IOException, InterruptedException {
        log.info("Cleaning database: {}", dbName);

        // 1. Drop Database
        executeMysqlCommand(providedUser, providedPassword, "DROP DATABASE IF EXISTS " + dbName);

        // 2. Create Database
        executeMysqlCommand(providedUser, providedPassword, "CREATE DATABASE " + dbName);

        log.info("Database {} cleaned successfully.", dbName);
    }

    private void executeMysqlCommand(String user, String password, String sql)
            throws IOException, InterruptedException {
        List<String> command = new ArrayList<>();
        command.add(mysqlPath);
        command.add("-u" + user);
        if (password != null && !password.isEmpty()) {
            command.add("-p" + password);
        }
        command.add("-e");
        command.add(sql);

        log.info("Executing MySQL command: {}", sql);
        ProcessBuilder pb = new ProcessBuilder(command);
        pb.redirectErrorStream(true);
        Process process = pb.start();

        StringBuilder output = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
        }

        int exitCode = process.waitFor();
        if (exitCode != 0) {
            log.error("MySQL Command failed: {}. Output: {}", sql, output.toString());
            throw new RuntimeException(
                    "MySQL Command failed: " + sql + " (Exit Code: " + exitCode + ")\n" + output.toString());
        }
    }

    public byte[] generateBackup(String providedUser, String providedPassword)
            throws IOException, InterruptedException {
        String dbName = getDatabaseName();
        log.info("Generating backup for database: {}", dbName);

        Path tempPath = Paths.get(TEMP_DIR);
        if (!Files.exists(tempPath)) {
            Files.createDirectories(tempPath);
        }

        Path backupFile = tempPath.resolve("backup_" + System.currentTimeMillis() + ".sql");

        log.info("Executing backup command: {} -u{} -p**** {}", mysqldumpPath, providedUser, dbName);
        List<String> command = new ArrayList<>();
        command.add(mysqldumpPath);
        command.add("-u" + providedUser);
        if (providedPassword != null && !providedPassword.isEmpty()) {
            command.add("-p" + providedPassword);
        }
        command.add(dbName);
        ProcessBuilder pb = new ProcessBuilder(command);
        pb.redirectOutput(backupFile.toFile());
        pb.redirectErrorStream(true);
        Process process = pb.start();

        // Consume output to avoid hanging
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            while (reader.readLine() != null) {
            }
        }

        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new RuntimeException("Backup failed with exit code: " + exitCode);
        }

        byte[] data = Files.readAllBytes(backupFile);
        Files.delete(backupFile); // Clean up
        return data;
    }

    private String getDatabaseName() {
        String dbName = dbUrl.substring(dbUrl.lastIndexOf("/") + 1);
        if (dbName.contains("?")) {
            dbName = dbName.substring(0, dbName.indexOf("?"));
        }
        return dbName;
    }

    public List<TableStatus> getDatabaseOverview() {
        String sql = "SHOW TABLE STATUS";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            TableStatus status = new TableStatus();
            status.setName(rs.getString("Name"));
            status.setRows(rs.getLong("Rows"));
            status.setDataSize(rs.getLong("Data_length"));
            status.setIndexSize(rs.getLong("Index_length"));
            status.setComment(rs.getString("Comment"));
            return status;
        });
    }

    @lombok.Data
    public static class TableStatus {
        private String name;
        private Long rows;
        private Long dataSize;
        private Long indexSize;
        private String comment;
    }
}
