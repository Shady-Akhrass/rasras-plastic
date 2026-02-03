package com.rasras.erp.procurement;

import com.rasras.erp.supplier.Supplier;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "supplierquotations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierQuotation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "QuotationID")
    private Integer id;

    @Column(name = "QuotationNumber", length = 30)
    private String quotationNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "RFQID")
    private RequestForQuotation rfq;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SupplierID", nullable = false)
    private Supplier supplier;

    @Column(name = "QuotationDate", nullable = false)
    private LocalDate quotationDate;

    @Column(name = "ValidUntilDate")
    private LocalDate validUntilDate;

    @Column(name = "Currency", length = 3)
    @Builder.Default
    private String currency = "EGP";

    @Column(name = "ExchangeRate", precision = 18, scale = 6)
    @Builder.Default
    private BigDecimal exchangeRate = BigDecimal.ONE;

    @Column(name = "PaymentTerms", length = 200)
    private String paymentTerms;

    @Column(name = "DeliveryTerms", length = 200)
    private String deliveryTerms;

    @Column(name = "DeliveryDays")
    private Integer deliveryDays;

    @Column(name = "TotalAmount", precision = 18, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "DeliveryCost", precision = 18, scale = 2)
    private BigDecimal deliveryCost;

    @Column(name = "Status", length = 20)
    @Builder.Default
    private String status = "Received";

    @Column(name = "AttachmentPath", length = 500)
    private String attachmentPath;

    @Column(name = "Notes", length = 1000)
    private String notes;

    @Column(name = "ReceivedByUserID")
    private Integer receivedByUserId;

    @Column(name = "ReceivedDate")
    @Builder.Default
    private LocalDateTime receivedDate = LocalDateTime.now();

    @CreationTimestamp
    @Column(name = "CreatedAt", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "CreatedBy")
    private Integer createdBy;

    @OneToMany(mappedBy = "quotation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SupplierQuotationItem> items;
}
