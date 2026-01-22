package com.rasras.erp.crm;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "customers")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CustomerID")
    private Integer id;

    @Column(name = "CustomerCode", nullable = false, unique = true)
    private String customerCode;

    @Column(name = "CustomerNameAr", nullable = false)
    private String customerNameAr;

    @Column(name = "CustomerNameEn")
    private String customerNameEn;

    @Column(name = "CustomerType")
    private String customerType;

    @Column(name = "CustomerClass")
    private String customerClass;

    @Column(name = "TaxRegistrationNo")
    private String taxRegistrationNo;

    @Column(name = "CommercialRegNo")
    private String commercialRegNo;

    @Column(name = "Address")
    private String address;

    @Column(name = "City")
    private String city;

    @Column(name = "Country")
    private String country;

    @Column(name = "Phone")
    private String phone;

    @Column(name = "Fax")
    private String fax;

    @Column(name = "Email")
    private String email;

    @Column(name = "Website")
    private String website;

    @Column(name = "ContactPerson")
    private String contactPerson;

    @Column(name = "ContactPhone")
    private String contactPhone;

    @Column(name = "PaymentTermDays")
    private Integer paymentTermDays;

    @Column(name = "CreditLimit")
    private BigDecimal creditLimit;

    @Column(name = "CurrentBalance")
    private BigDecimal currentBalance;

    @Column(name = "Currency")
    private String currency;

    @Column(name = "SalesRepID")
    private Integer salesRepId;

    @Column(name = "PriceListID")
    private Integer priceListId;

    @Column(name = "DiscountPercentage")
    private BigDecimal discountPercentage;

    @Column(name = "IsApproved")
    private Boolean isApproved;

    @Column(name = "ApprovedBy")
    private Integer approvedBy;

    @Column(name = "ApprovedDate")
    private LocalDate approvedDate;

    @Column(name = "IsActive")
    private Boolean isActive;

    @Column(name = "Notes")
    private String notes;

    @Column(name = "CreatedAt", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "CreatedBy")
    private Integer createdBy;

    @Column(name = "UpdatedAt")
    private LocalDateTime updatedAt;

    @Column(name = "UpdatedBy")
    private Integer updatedBy;
}
