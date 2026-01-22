package com.rasras.erp.crm;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDto {
    private Integer id;
    private String customerCode;
    private String customerNameAr;
    private String customerNameEn;
    private String customerType;
    private String customerClass;
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
    private BigDecimal currentBalance;
    private String currency;
    private Integer salesRepId;
    private String salesRepName; // For UI
    private Integer priceListId;
    private String priceListName; // For UI
    private BigDecimal discountPercentage;
    private Boolean isApproved;
    private Boolean isActive;
    private String notes;
    private LocalDateTime createdAt;

    private List<CustomerContactDto> contacts;
}
