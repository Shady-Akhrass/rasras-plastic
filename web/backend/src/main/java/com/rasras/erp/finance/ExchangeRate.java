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

    @Column(name = "FromCurrency", length = 3, nullable = false)
    @Builder.Default
    private String fromCurrency = "USD";

    @Column(name = "ToCurrency", length = 3, nullable = false)
    @Builder.Default
    private String toCurrency = "EGP";

    @Column(name = "RateDate", nullable = false)
    @Builder.Default
    private java.time.LocalDate rateDate = java.time.LocalDate.now();

    @Column(name = "BuyRate", precision = 18, scale = 6, nullable = false)
    private BigDecimal buyRate;

    @Column(name = "SellRate", precision = 18, scale = 6, nullable = false)
    private BigDecimal sellRate;

    @Column(name = "AverageRate", precision = 18, scale = 6, nullable = false)
    private BigDecimal averageRate;

    @Column(name = "rate", precision = 18, scale = 6)
    private BigDecimal rate;

    @Column(name = "Source", length = 50)
    @Builder.Default
    private String source = "Manual";

    @Column(name = "recorded_at", nullable = false)
    @Builder.Default
    private LocalDateTime recordedAt = LocalDateTime.now();
}
