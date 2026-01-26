package com.rasras.erp.sales;

import com.rasras.erp.crm.Customer;
import com.rasras.erp.shared.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "salesinvoices")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesInvoice extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SalesInvoiceID")
    private Integer id;

    @Column(name = "InvoiceNumber", nullable = false, length = 20, unique = true)
    private String invoiceNumber;

    @Column(name = "InvoiceDate", nullable = false)
    @Builder.Default
    private LocalDateTime invoiceDate = LocalDateTime.now();

    @Column(name = "DueDate", nullable = false)
    private LocalDate dueDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SOID")
    private SalesOrder salesOrder;

    @Column(name = "IssueNoteID")
    private Integer issueNoteId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CustomerID", nullable = false)
    private Customer customer;

    @Column(name = "SalesRepID")
    private Integer salesRepId;

    @Column(name = "Currency", length = 3)
    @Builder.Default
    private String currency = "EGP";

    @Column(name = "ExchangeRate", precision = 18, scale = 6)
    @Builder.Default
    private BigDecimal exchangeRate = BigDecimal.ONE;

    @Column(name = "SubTotal", nullable = false, precision = 18, scale = 2)
    private BigDecimal subTotal;

    @Column(name = "DiscountPercentage", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal discountPercentage = BigDecimal.ZERO;

    @Column(name = "DiscountAmount", precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "TaxAmount", precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "ShippingCost", precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal shippingCost = BigDecimal.ZERO;

    @Column(name = "TotalAmount", nullable = false, precision = 18, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "PaidAmount", precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Column(name = "Status", length = 20)
    @Builder.Default
    private String status = "Draft";

    @Column(name = "EInvoiceStatus", length = 20)
    private String eInvoiceStatus;

    @Column(name = "EInvoiceUUID", length = 100)
    private String eInvoiceUUID;

    @Column(name = "PaymentTerms", length = 200)
    private String paymentTerms;

    @Column(name = "Notes", length = 1000)
    private String notes;

    @OneToMany(mappedBy = "salesInvoice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SalesInvoiceItem> items;
}
