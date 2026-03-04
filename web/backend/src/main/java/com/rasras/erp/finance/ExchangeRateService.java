package com.rasras.erp.finance;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExchangeRateService {
    private final ExchangeRateRepository repository;

    @Transactional
    public ExchangeRate recordRate(BigDecimal rate) {
        ExchangeRate exchangeRate = ExchangeRate.builder()
                .rate(rate)
                .recordedAt(LocalDateTime.now())
                .currencyCode("USD")
                .build();
        return repository.save(exchangeRate);
    }

    public BigDecimal getCurrentRate() {
        return repository.findAllByOrderByRecordedAtDesc().stream()
                .findFirst()
                .map(ExchangeRate::getRate)
                .orElse(BigDecimal.valueOf(50.0)); // Default fallback
    }

    /**
     * Calculates the Buffer% based on historical volatility.
     * Buffer% = Avg Daily Change % * Selling Days * Safety Factor
     */
    public BigDecimal calculateBufferPercentage(int sellingDays, double safetyFactor) {
        List<ExchangeRate> history = repository.findAllByOrderByRecordedAtDesc();
        if (history.size() < 2) {
            return BigDecimal.ZERO;
        }

        BigDecimal totalDailyChangePercent = BigDecimal.ZERO;
        int count = 0;

        for (int i = 0; i < history.size() - 1; i++) {
            ExchangeRate newer = history.get(i);
            ExchangeRate older = history.get(i + 1);

            long daysBetween = Math.max(1, Duration.between(older.getRecordedAt(), newer.getRecordedAt()).toDays());

            // % change = ((new - old) / old) * 100
            BigDecimal changePercent = newer.getRate().subtract(older.getRate())
                    .divide(older.getRate(), 10, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));

            // daily change = % change / days
            BigDecimal dailyChange = changePercent.divide(BigDecimal.valueOf(daysBetween), 10, RoundingMode.HALF_UP);

            // We only care about upward trends (risk) for the buffer calculation usually,
            // but the user's formula implies average of changes.
            totalDailyChangePercent = totalDailyChangePercent.add(dailyChange);
            count++;
        }

        if (count == 0)
            return BigDecimal.ZERO;

        BigDecimal avgDailyChange = totalDailyChangePercent.divide(BigDecimal.valueOf(count), 10, RoundingMode.HALF_UP);

        // Ensure buffer isn't negative if rates went down overall
        if (avgDailyChange.compareTo(BigDecimal.ZERO) < 0) {
            avgDailyChange = BigDecimal.ZERO;
        }

        // Buffer% = avgDailyChange * sellingDays * safetyFactor
        return avgDailyChange
                .multiply(BigDecimal.valueOf(sellingDays))
                .multiply(BigDecimal.valueOf(safetyFactor))
                .setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal getEffectiveExchangeRate(int sellingDays, double safetyFactor) {
        BigDecimal currentRate = getCurrentRate();
        BigDecimal bufferPercent = calculateBufferPercentage(sellingDays, safetyFactor);

        // Effective = Rate * (1 + Buffer/100)
        return currentRate.multiply(
                BigDecimal.ONE.add(bufferPercent.divide(BigDecimal.valueOf(100), 10, RoundingMode.HALF_UP)))
                .setScale(4, RoundingMode.HALF_UP);
    }
}
