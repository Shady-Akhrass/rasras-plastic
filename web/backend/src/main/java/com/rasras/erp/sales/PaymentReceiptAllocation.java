package com.rasras.erp.sales;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "receiptvoucherallocations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentReceiptAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "AllocationID")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ReceiptVoucherID", nullable = false)
    private PaymentReceipt receiptVoucher;

    @Column(name = "SalesInvoiceID", nullable = false)
    private Integer salesInvoiceId;

    @Column(name = "AllocatedAmount", nullable = false, precision = 18, scale = 2)
    private BigDecimal allocatedAmount;

    @Column(name = "AllocationDate", nullable = false)
    @Builder.Default
    private LocalDateTime allocationDate = LocalDateTime.now();

    @Column(name = "Notes", length = 500)
    private String notes;
}
