package com.rasras.erp.supplier;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "suppliers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SupplierID")
    private Integer id;

    @Column(name = "SupplierCode", nullable = false, length = 20, unique = true)
    private String supplierCode;

    @Column(name = "SupplierNameAr", nullable = false, length = 200)
    private String supplierNameAr;

    @Column(name = "SupplierNameEn", length = 200)
    private String supplierNameEn;

    @Column(name = "SupplierType", length = 20)
    private String supplierType;

    @Column(name = "TaxRegistrationNo", length = 50)
    private String taxRegistrationNo;

    @Column(name = "CommercialRegNo", length = 50)
    private String commercialRegNo;

    @Column(name = "Address", length = 500)
    private String address;

    @Column(name = "City", length = 100)
    private String city;

    @Column(name = "Country", length = 100)
    private String country;

    @Column(name = "Phone", length = 20)
    private String phone;

    @Column(name = "Fax", length = 20)
    private String fax;

    @Column(name = "Email", length = 100)
    private String email;

    @Column(name = "Website", length = 200)
    private String website;

    @Column(name = "ContactPerson", length = 100)
    private String contactPerson;

    @Column(name = "ContactPhone", length = 20)
    private String contactPhone;

    @Column(name = "PaymentTermDays")
    @Builder.Default
    private Integer paymentTermDays = 0;

    @Column(name = "CreditLimit", precision = 18, scale = 2)
    private BigDecimal creditLimit;

    @Column(name = "Currency", length = 3)
    @Builder.Default
    private String currency = "EGP";

    @Column(name = "BankName", length = 100)
    private String bankName;

    @Column(name = "BankAccountNo", length = 50)
    private String bankAccountNo;

    @Column(name = "IBAN", length = 50)
    private String iban;

    @Column(name = "Rating", length = 10)
    private String rating;

    @Column(name = "TotalInvoiced", precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal totalInvoiced = BigDecimal.ZERO;

    @Column(name = "TotalPaid", precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal totalPaid = BigDecimal.ZERO;

    @Column(name = "TotalReturned", precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal totalReturned = BigDecimal.ZERO;

    @Column(name = "CurrentBalance", precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal currentBalance = BigDecimal.ZERO;

    @Column(name = "IsApproved")
    @Builder.Default
    private Boolean isApproved = false;

    @Column(name = "IsActive")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "Notes", length = 1000)
    private String notes;

    @CreationTimestamp
    @Column(name = "CreatedAt", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "CreatedBy")
    private Integer createdBy;

    @UpdateTimestamp
    @Column(name = "UpdatedAt")
    private LocalDateTime updatedAt;

    @Column(name = "UpdatedBy")
    private Integer updatedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "Status", length = 20)
    @Builder.Default
    private SupplierStatus status = SupplierStatus.DRAFT;

    @Column(name = "ApprovalStatus", length = 20)
    @Builder.Default
    private String approvalStatus = "Pending";

    @Column(name = "ApprovalNotes")
    private String approvalNotes;

    @Column(name = "ApprovalDate")
    private LocalDateTime approvalDate;

    @Column(name = "ApprovedBy")
    private Integer approvedBy;

    @OneToMany(mappedBy = "supplier", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SupplierItem> supplierItems = new ArrayList<>();
}
