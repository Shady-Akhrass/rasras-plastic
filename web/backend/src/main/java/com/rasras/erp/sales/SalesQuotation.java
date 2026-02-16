package com.rasras.erp.sales;

import com.rasras.erp.crm.Customer;
import com.rasras.erp.inventory.PriceList;
import com.rasras.erp.shared.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "salesquotations")
@Data
@EqualsAndHashCode(callSuper = false)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesQuotation extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SalesQuotationID")
    private Integer id;

    @Column(name = "QuotationNumber", nullable = false, length = 20, unique = true)
    private String quotationNumber;

    @Column(name = "QuotationDate", nullable = false)
    @Builder.Default
    private LocalDateTime quotationDate = LocalDateTime.now();

    @Column(name = "ValidUntilDate", nullable = false)
    private LocalDate validUntilDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CustomerID", nullable = false)
    private Customer customer;

    @Column(name = "ContactID")
    private Integer contactId;

    @Column(name = "SalesRepID")
    private Integer salesRepId;

    @Column(name = "Currency", length = 3)
    @Builder.Default
    private String currency = "EGP";

    @Column(name = "ExchangeRate", precision = 18, scale = 6)
    @Builder.Default
    private BigDecimal exchangeRate = BigDecimal.ONE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PriceListID")
    private PriceList priceList;

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

    @Column(name = "TotalAmount", nullable = false, precision = 18, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "PaymentTerms", length = 200)
    private String paymentTerms;

    @Column(name = "DeliveryTerms", length = 200)
    private String deliveryTerms;

    @Column(name = "Status", length = 20)
    @Builder.Default
    private String status = "Draft";

    @Column(name = "ApprovalStatus", length = 20)
    @Builder.Default
    private String approvalStatus = "Pending";

    @Column(name = "SentDate")
    private LocalDateTime sentDate;

    @Column(name = "AcceptedDate")
    private LocalDateTime acceptedDate;

    @Column(name = "RejectedReason", length = 500)
    private String rejectedReason;

    @Column(name = "Notes", length = 1000)
    private String notes;

    @Column(name = "TermsAndConditions", columnDefinition = "TEXT")
    private String termsAndConditions;

    @OneToMany(mappedBy = "salesQuotation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SalesQuotationItem> items;
}
