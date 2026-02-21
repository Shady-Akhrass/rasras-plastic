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
@Table(name = "salesorders")
@Data
@EqualsAndHashCode(callSuper = false)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesOrder extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SOID")
    private Integer id;

    @Column(name = "SONumber", nullable = false, length = 20, unique = true)
    private String soNumber;

    @Column(name = "SODate", nullable = false)
    @Builder.Default
    private LocalDateTime soDate = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SalesQuotationID")
    private SalesQuotation salesQuotation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CustomerID", nullable = false)
    private Customer customer;

    @Column(name = "ContactID")
    private Integer contactId;

    @Column(name = "SalesRepID")
    private Integer salesRepId;

    @Column(name = "ShippingAddress", length = 500)
    private String shippingAddress;

    @Column(name = "ExpectedDeliveryDate")
    private LocalDate expectedDeliveryDate;

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

    @Column(name = "TaxAmount", precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "DeliveryCost", precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal deliveryCost = BigDecimal.ZERO;

    @Column(name = "OtherCosts", precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal otherCosts = BigDecimal.ZERO;

    @Column(name = "TotalAmount", nullable = false, precision = 18, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "PaymentTerms", length = 200)
    private String paymentTerms;

    @Column(name = "PaymentTermDays")
    private Integer paymentTermDays;

    @Column(name = "Status", length = 20)
    @Builder.Default
    private String status = "Draft";

    @Column(name = "ApprovalStatus", length = 20)
    @Builder.Default
    private String approvalStatus = "Pending";

    @Column(name = "CreditCheckStatus", length = 20)
    private String creditCheckStatus;

    @Column(name = "CreditCheckBy")
    private Integer creditCheckBy;

    @Column(name = "CreditCheckDate")
    private LocalDateTime creditCheckDate;

    @Column(name = "ApprovedByUserID")
    private Integer approvedByUserId;

    @Column(name = "ApprovedDate")
    private LocalDateTime approvedDate;

    @Column(name = "Notes", length = 1000)
    private String notes;

    @OneToMany(mappedBy = "salesOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SalesOrderItem> items;
}
