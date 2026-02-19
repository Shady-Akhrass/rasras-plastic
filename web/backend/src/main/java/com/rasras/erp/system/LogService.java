package com.rasras.erp.system;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.charset.CharsetDecoder;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@Slf4j
public class LogService {

    @Value("${logging.file.name:logs/application.log}")
    private String logFilePath;

    private static final String CLEAR_MARK_FILE = "logs/error_clear.mark";

    public List<String> getSystemLogs(int limit) {
        return readLogs(limit, false);
    }

    public List<String> getSystemErrorLogs(int limit) {
        return readLogs(limit, true);
    }

    public void clearSystemErrorLogs() {
        try {
            Path logPath = Paths.get(logFilePath);
            if (Files.exists(logPath)) {
                long currentSize = Files.size(logPath);
                Files.writeString(Paths.get(CLEAR_MARK_FILE), String.valueOf(currentSize));
                log.info("System error logs virtually cleared. Mark set at {} bytes", currentSize);
            }
        } catch (IOException e) {
            log.error("Failed to set clear mark for logs", e);
        }
    }

    private List<String> readLogs(int limit, boolean errorsOnly) {
        Path path = Paths.get(logFilePath);
        if (!Files.exists(path)) {
            return Collections.singletonList("Log file not found at: " + logFilePath);
        }

        long clearMark = getClearMark();

        try {
            CharsetDecoder decoder = StandardCharsets.UTF_8.newDecoder()
                    .onMalformedInput(CodingErrorAction.REPLACE)
                    .onUnmappableCharacter(CodingErrorAction.REPLACE);

            List<String> allLines = new ArrayList<>();
            // Use RandomAccessFile or similar if file is huge, but for now standard reading
            // with filtering
            try (BufferedReader reader = new BufferedReader(
                    new java.io.InputStreamReader(Files.newInputStream(path), decoder))) {

                // If we have a clear mark, we might want to skip some bytes,
                // but logs are line-based so we'll check timestamp/position if needed.
                // Simple approach: if we want to support virtual clear, we look at bytes read.
                // However, BufferedReader makes byte counting hard.
                // Let's use a simpler approach for now: if clearMark > 0, we'll try to skip.

                String line;
                long bytesProcessed = 0;
                while ((line = reader.readLine()) != null) {
                    // This is a rough estimate but good enough for a "virtual clear"
                    bytesProcessed += line.getBytes(StandardCharsets.UTF_8).length + 1; // +1 for newline

                    if (bytesProcessed <= clearMark)
                        continue;

                    if (!errorsOnly || isErrorLine(line)) {
                        allLines.add(line);
                    }
                }
            }

            if (allLines.isEmpty()) {
                return Collections.emptyList();
            }

            int start = Math.max(0, allLines.size() - limit);
            return allLines.subList(start, allLines.size());
        } catch (IOException e) {
            log.error("Error reading log file", e);
            return Collections.singletonList("Error reading logs: " + e.getMessage());
        }
    }

    private boolean isErrorLine(String line) {
        // Match common log patterns. Usually contains "ERROR" or "SEVERE"
        return line.contains(" ERROR ") || line.contains(" SEVERE ") || line.contains("Exception: ");
    }

    private long getClearMark() {
        try {
            Path markPath = Paths.get(CLEAR_MARK_FILE);
            if (Files.exists(markPath)) {
                return Long.parseLong(Files.readString(markPath).trim());
            }
        } catch (Exception e) {
            log.warn("Failed to read log clear mark", e);
        }
        return 0;
    }
}
