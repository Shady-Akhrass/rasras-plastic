package com.rasras.erp.finance;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/finance/exchange-rates")
@RequiredArgsConstructor
public class ExchangeRateController {
    private final ExchangeRateService service;
    private final ExchangeRateRepository repository;

    @PostMapping
    public ResponseEntity<ExchangeRate> recordRate(@RequestBody BigDecimal rate) {
        return ResponseEntity.ok(service.recordRate(rate));
    }

    @GetMapping("/latest")
    public ResponseEntity<BigDecimal> getLatestRate() {
        return ResponseEntity.ok(service.getCurrentRate());
    }

    @GetMapping("/history")
    public ResponseEntity<List<ExchangeRate>> getHistory() {
        return ResponseEntity.ok(repository.findAllByOrderByRecordedAtDesc());
    }

    @GetMapping("/effective")
    public ResponseEntity<BigDecimal> getEffectiveRate(
            @RequestParam(defaultValue = "7") int sellingDays,
            @RequestParam(defaultValue = "1.5") double safetyFactor) {
        return ResponseEntity.ok(service.getEffectiveExchangeRate(sellingDays, safetyFactor));
    }

    @GetMapping("/buffer")
    public ResponseEntity<BigDecimal> getBufferPercentage(
            @RequestParam(defaultValue = "7") int sellingDays,
            @RequestParam(defaultValue = "1.5") double safetyFactor) {
        return ResponseEntity.ok(service.calculateBufferPercentage(sellingDays, safetyFactor));
    }
}
