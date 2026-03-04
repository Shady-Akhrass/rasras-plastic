package com.rasras.erp.finance;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "exchangerates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExchangeRate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ExchangeRateID")
    private Integer id;

    @Column(name = "exchange_rate", precision = 18, scale = 6, nullable = false)
    private BigDecimal rate;

    @Column(name = "recorded_at", nullable = false)
    @Builder.Default
    private LocalDateTime recordedAt = LocalDateTime.now();

    @Column(name = "currency_code", length = 3)
    @Builder.Default
    private String currencyCode = "USD";
}
