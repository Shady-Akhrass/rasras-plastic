package com.rasras.erp.inventory;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "item_exchange_rate_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemExchangeRateHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "HistoryID")
    private Integer id;

    @Column(name = "ItemID", nullable = false)
    private Integer itemId;

    @Column(name = "ExchangeRate", precision = 18, scale = 6, nullable = false)
    private BigDecimal exchangeRate;

    @Column(name = "PurchasePriceUSD", precision = 18, scale = 4)
    private BigDecimal purchasePriceUsd;

    /** "GRN" or "INVOICE" */
    @Column(name = "SourceType", length = 20, nullable = false)
    private String sourceType;

    /** GRN ID or SupplierInvoice ID */
    @Column(name = "SourceID")
    private Integer sourceId;

    @Column(name = "RecordedAt", nullable = false)
    @Builder.Default
    private LocalDateTime recordedAt = LocalDateTime.now();
}
