package com.rasras.erp.finance;

import com.rasras.erp.inventory.ItemExchangeRateHistory;
import com.rasras.erp.inventory.ItemExchangeRateHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExchangeRateService {
    private final ExchangeRateRepository repository;
    private final ItemExchangeRateHistoryRepository itemRateHistoryRepo;

    @Transactional
    public ExchangeRate recordRate(BigDecimal rate) {
        ExchangeRate exchangeRate = ExchangeRate.builder()
                .fromCurrency("USD")
                .toCurrency("EGP")
                .rateDate(LocalDate.now())
                .buyRate(rate)
                .sellRate(rate)
                .averageRate(rate)
                .rate(rate)
                .source("Live-Sync")
                .recordedAt(LocalDateTime.now())
                .build();
        return repository.save(exchangeRate);
    }

    public BigDecimal getCurrentRate() {
        return repository.findAllByOrderByRecordedAtDesc().stream()
                .findFirst()
                .map(ExchangeRate::getAverageRate)
                .orElseGet(() -> {
                    System.err.println("WARNING: No exchange rate found in DB. Using fallback rate 50.0");
                    return new BigDecimal("50.0");
                });
    }

    /**
     * Calculates the Buffer% based on global historical volatility.
     * Buffer% = Avg Daily Change % * Selling Days * Safety Factor
     */
    public BigDecimal calculateBufferPercentage(int sellingDays, double safetyFactor) {
        List<ExchangeRate> history = repository.findAllByOrderByRecordedAtDesc();

        // Group by Date to eliminate same-day intra-day volatility spikes
        Map<LocalDate, ExchangeRate> latestPerDay = new java.util.LinkedHashMap<>();
        for (ExchangeRate rate : history) {
            LocalDate date = rate.getRecordedAt().toLocalDate();
            latestPerDay.putIfAbsent(date, rate); // LinkedHashMap maintains descending order
        }

        List<ExchangeRate> dailyHistory = new ArrayList<>(latestPerDay.values());

        if (dailyHistory.size() < 2) {
            return BigDecimal.ZERO;
        }

        BigDecimal totalDailyChangePercent = BigDecimal.ZERO;
        int count = 0;

        for (int i = 0; i < dailyHistory.size() - 1; i++) {
            ExchangeRate newer = dailyHistory.get(i);
            ExchangeRate older = dailyHistory.get(i + 1);

            long daysBetween = Math.max(1, Duration.between(older.getRecordedAt(), newer.getRecordedAt()).toDays());

            BigDecimal changePercent = newer.getAverageRate().subtract(older.getAverageRate())
                    .divide(older.getAverageRate(), 10, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));

            BigDecimal dailyChange = changePercent.abs().divide(BigDecimal.valueOf(daysBetween), 10,
                    RoundingMode.HALF_UP);

            totalDailyChangePercent = totalDailyChangePercent.add(dailyChange);
            count++;
        }

        if (count == 0)
            return BigDecimal.ZERO;

        BigDecimal avgDailyChange = totalDailyChangePercent.divide(BigDecimal.valueOf(count), 10, RoundingMode.HALF_UP);

        return avgDailyChange
                .multiply(BigDecimal.valueOf(sellingDays))
                .multiply(BigDecimal.valueOf(safetyFactor))
                .setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal getEffectiveExchangeRate(int sellingDays, double safetyFactor) {
        BigDecimal currentRate = getCurrentRate();
        BigDecimal bufferPercent = calculateBufferPercentage(sellingDays, safetyFactor);

        return currentRate.multiply(
                BigDecimal.ONE.add(bufferPercent.divide(BigDecimal.valueOf(100), 10, RoundingMode.HALF_UP)))
                .setScale(4, RoundingMode.HALF_UP);
    }

    // ═══════════════════════════════════════════════
    // Per-Item Buffer Calculation
    // ═══════════════════════════════════════════════

    /**
     * Calculates the Buffer% based on an item's own purchase exchange-rate history.
     * Falls back to global buffer if the item has fewer than 2 history records.
     */
    public BigDecimal calculateBufferForItem(Integer itemId, int sellingDays, double safetyFactor) {
        List<ItemExchangeRateHistory> history = itemRateHistoryRepo
                .findByItemIdOrderByRecordedAtDesc(itemId);

        // Group by Date to eliminate same-day intra-day volatility spikes
        Map<LocalDate, ItemExchangeRateHistory> latestPerDay = new java.util.LinkedHashMap<>();
        for (ItemExchangeRateHistory rate : history) {
            LocalDate date = rate.getRecordedAt().toLocalDate();
            latestPerDay.putIfAbsent(date, rate);
        }

        List<ItemExchangeRateHistory> dailyHistory = new ArrayList<>(latestPerDay.values());

        if (dailyHistory.size() < 2) {
            // Not enough item-specific daily data — use global buffer
            return calculateBufferPercentage(sellingDays, safetyFactor);
        }

        BigDecimal totalDailyChangePercent = BigDecimal.ZERO;
        int count = 0;

        for (int i = 0; i < dailyHistory.size() - 1; i++) {
            ItemExchangeRateHistory newer = dailyHistory.get(i);
            ItemExchangeRateHistory older = dailyHistory.get(i + 1);

            long daysBetween = Math.max(1,
                    Duration.between(older.getRecordedAt(), newer.getRecordedAt()).toDays());

            BigDecimal changePercent = newer.getExchangeRate().subtract(older.getExchangeRate())
                    .divide(older.getExchangeRate(), 10, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));

            BigDecimal dailyChange = changePercent.abs().divide(
                    BigDecimal.valueOf(daysBetween), 10, RoundingMode.HALF_UP);

            totalDailyChangePercent = totalDailyChangePercent.add(dailyChange);
            count++;
        }

        if (count == 0)
            return BigDecimal.ZERO;

        BigDecimal avgDailyChange = totalDailyChangePercent.divide(
                BigDecimal.valueOf(count), 10, RoundingMode.HALF_UP);

        return avgDailyChange
                .multiply(BigDecimal.valueOf(sellingDays))
                .multiply(BigDecimal.valueOf(safetyFactor))
                .setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Returns the effective exchange rate for a specific item, using its own
     * purchase history for the buffer calculation.
     */
    public BigDecimal getEffectiveExchangeRateForItem(Integer itemId, int sellingDays,
            double safetyFactor) {
        BigDecimal currentRate = getCurrentRate();
        BigDecimal bufferPercent = calculateBufferForItem(itemId, sellingDays, safetyFactor);

        return currentRate.multiply(
                BigDecimal.ONE.add(bufferPercent.divide(BigDecimal.valueOf(100), 10, RoundingMode.HALF_UP)))
                .setScale(4, RoundingMode.HALF_UP);
    }
}
