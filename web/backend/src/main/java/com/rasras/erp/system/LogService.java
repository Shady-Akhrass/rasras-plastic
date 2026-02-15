package com.rasras.erp.system;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@Slf4j
public class LogService {

    @Value("${logging.file.name:logs/application.log}")
    private String logFilePath;

    public List<String> getSystemLogs(int limit) {
        Path path = Paths.get(logFilePath);
        if (!Files.exists(path)) {
            return Collections.singletonList("Log file not found at: " + logFilePath);
        }

        try (Stream<String> lines = Files.lines(path)) {
            // Read all lines (be careful with very large files, but for a simple ERP this
            // is okay for now)
            // Ideally we should use a ReversedLinesFileReader or similar for efficiency on
            // large files
            List<String> allLines = lines.collect(Collectors.toList());

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
}
