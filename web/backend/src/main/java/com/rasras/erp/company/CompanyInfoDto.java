package com.rasras.erp.company;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyInfoDto {
    private Integer id;
    private String companyNameAr;
    private String companyNameEn;
    private String taxRegistrationNo;
    private String commercialRegNo;
    private String address;
    private String city;
    private String country;
    private String phone;
    private String fax;
    private String email;
    private String website;
    private String logoPath;
    private String headerPath;
    private String footerText;
    private String currency;
    private Integer fiscalYearStartMonth;
}
