package com.rasras.erp.supplier;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierDto {
    private Integer id;
    private String supplierCode;
    private String supplierNameAr;
    private String supplierNameEn;
    private String supplierType;
    private String taxRegistrationNo;
    private String commercialRegNo;
    private String address;
    private String city;
    private String country;
    private String phone;
    private String fax;
    private String email;
    private String website;
    private String contactPerson;
    private String contactPhone;
    private Integer paymentTermDays;
    private BigDecimal creditLimit;
    private String currency;
    private String bankName;
    private String bankAccountNo;
    private String iban;
    private String rating;
    private BigDecimal totalInvoiced;
    private BigDecimal totalPaid;
    private BigDecimal totalReturned;
    private BigDecimal currentBalance;
    private Boolean isApproved;
    private Boolean isActive;
    private String notes;
    private String status;
    private String approvalNotes;
    private LocalDateTime approvalDate;
    private Integer approvedBy;
    private LocalDateTime createdAt;
    private Integer createdBy;
    private Integer updatedBy;
}
