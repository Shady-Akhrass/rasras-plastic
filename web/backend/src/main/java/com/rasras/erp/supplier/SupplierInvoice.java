package com.rasras.erp.supplier;

import com.rasras.erp.shared.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "supplierinvoices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierInvoice extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SupplierInvoiceID")
    private Integer id;

    @Column(name = "InvoiceNumber", nullable = false, length = 30)
    private String invoiceNumber;

    @Column(name = "SupplierInvoiceNo", nullable = false, length = 50)
    private String supplierInvoiceNo;

    @Column(name = "InvoiceDate", nullable = false)
    private LocalDate invoiceDate;

    @Column(name = "DueDate", nullable = false)
    private LocalDate dueDate;

    @Column(name = "POID") // Manual join if PO entity isn't ready, or direct link
    private Integer poId;

    @Column(name = "GRNID")
    private Integer grnId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SupplierID", nullable = false)
    private Supplier supplier;

    @Column(name = "Currency", length = 3)
    @Builder.Default
    private String currency = "EGP";

    @Column(name = "ExchangeRate", precision = 18, scale = 6)
    @Builder.Default
    private BigDecimal exchangeRate = BigDecimal.ONE;

    @Column(name = "SubTotal", precision = 18, scale = 2, nullable = false)
    private BigDecimal subTotal;

    @Column(name = "DiscountAmount", precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "TaxAmount", precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "TotalAmount", precision = 18, scale = 2, nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "PaidAmount", precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Column(name = "Status", length = 20)
    @Builder.Default
    private String status = "Unpaid"; // Unpaid, Partial, Paid

    @Column(name = "ApprovalStatus", length = 20)
    @Builder.Default
    private String approvalStatus = "Pending"; // Pending, Approved, Rejected

    @Column(name = "PaymentTerms", length = 200)
    private String paymentTerms;

    @Column(name = "Notes", length = 1000)
    private String notes;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SupplierInvoiceItem> items;
}
