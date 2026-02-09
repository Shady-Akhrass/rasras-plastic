package com.rasras.erp.procurement;

import com.rasras.erp.shared.audit.AuditableEntity;
import com.rasras.erp.supplier.Supplier;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "purchaseorders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrder extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "POID")
    private Integer id;

    @Column(name = "PONumber", length = 20, nullable = false)
    private String poNumber;

    @Column(name = "PODate", nullable = false)
    private LocalDateTime poDate;

    @Column(name = "PRID")
    private Integer prId;

    @Column(name = "QuotationID")
    private Integer quotationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SupplierID", nullable = false)
    private Supplier supplier;

    @Column(name = "ExpectedDeliveryDate")
    private LocalDate expectedDeliveryDate;

    @Column(name = "DeliveryDays")
    private Integer deliveryDays;

    @Column(name = "ShippingMethod", length = 50)
    private String shippingMethod;

    @Column(name = "ShippingTerms", length = 50)
    private String shippingTerms;

    @Column(name = "PaymentTerms", length = 200)
    private String paymentTerms;

    @Column(name = "PaymentTermDays")
    private Integer paymentTermDays;

    @Column(name = "Currency", length = 3)
    @Builder.Default
    private String currency = "EGP";

    @Column(name = "ExchangeRate", precision = 18, scale = 6)
    @Builder.Default
    private BigDecimal exchangeRate = BigDecimal.ONE;

    @Column(name = "SubTotal", precision = 18, scale = 2, nullable = false)
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

    @Column(name = "OtherCosts", precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal otherCosts = BigDecimal.ZERO;

    @Column(name = "TotalAmount", precision = 18, scale = 2, nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "Status", length = 20)
    @Builder.Default
    private String status = "Draft";

    @Column(name = "ApprovalStatus", length = 20)
    @Builder.Default
    private String approvalStatus = "Pending";

    @Column(name = "Level1ApprovedBy")
    private Integer level1ApprovedBy;

    @Column(name = "Level1ApprovedDate")
    private LocalDateTime level1ApprovedDate;

    @Column(name = "Level2ApprovedBy")
    private Integer level2ApprovedBy;

    @Column(name = "Level2ApprovedDate")
    private LocalDateTime level2ApprovedDate;

    @Column(name = "Level3ApprovedBy")
    private Integer level3ApprovedBy;

    @Column(name = "Level3ApprovedDate")
    private LocalDateTime level3ApprovedDate;

    @Column(name = "SentToSupplierDate")
    private LocalDateTime sentToSupplierDate;

    @Column(name = "Notes", length = 1000)
    private String notes;

    @Column(name = "TermsAndConditions", columnDefinition = "TEXT")
    private String termsAndConditions;

    @Column(name = "AttachmentPath", length = 500)
    private String attachmentPath;

    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurchaseOrderItem> items;
}
