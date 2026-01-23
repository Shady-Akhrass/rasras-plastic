package com.rasras.erp.procurement;

import com.rasras.erp.supplier.Supplier;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "quotationcomparisondetails")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuotationComparisonDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CompDetailID")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ComparisonID", nullable = false)
    private QuotationComparison comparison;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "QuotationID", nullable = false)
    private SupplierQuotation quotation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SupplierID", nullable = false)
    private Supplier supplier;

    @Column(name = "UnitPrice", precision = 18, scale = 4)
    private BigDecimal unitPrice;

    @Column(name = "TotalPrice", precision = 18, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "PaymentTerms", length = 200)
    private String paymentTerms;

    @Column(name = "DeliveryDays")
    private Integer deliveryDays;

    @Column(name = "QualityRating")
    private Integer qualityRating;

    @Column(name = "PriceRating")
    private Integer priceRating;

    @Column(name = "OverallScore", precision = 5, scale = 2)
    private BigDecimal overallScore;

    @Column(name = "Comments", length = 500)
    private String comments;
}
