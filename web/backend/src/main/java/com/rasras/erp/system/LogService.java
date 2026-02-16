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

    public List<String> getSystemLogs(int limit) {
        Path path = Paths.get(logFilePath);
        if (!Files.exists(path)) {
            return Collections.singletonList("Log file not found at: " + logFilePath);
        }

        try {
            CharsetDecoder decoder = StandardCharsets.UTF_8.newDecoder()
                    .onMalformedInput(CodingErrorAction.REPLACE)
                    .onUnmappableCharacter(CodingErrorAction.REPLACE);

            List<String> allLines = new ArrayList<>();
            try (BufferedReader reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
                // However, Files.newBufferedReader is strict.
                // Let's use a more manual approach to be absolutely sure we handle the decoder.
            } catch (Exception e) {
                // Fallback to manual stream reading if newBufferedReader fails (which it might
                // for some charset issues)
            }

            // Using the decoder explicitly to avoid MalformedInputException
            try (BufferedReader reader = new BufferedReader(
                    new java.io.InputStreamReader(Files.newInputStream(path), decoder))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    allLines.add(line);
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
}
