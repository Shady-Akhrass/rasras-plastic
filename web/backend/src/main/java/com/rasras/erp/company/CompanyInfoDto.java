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
    private String aboutText;
    private String visionText;
    private String missionText;
    private String goalsText;
    private String footerTextEn;
    private String aboutTextEn;
    private String visionTextEn;
    private String missionTextEn;
    private String goalsTextEn;
    private String servicesContentAr;
    private String servicesContentEn;
    private String productsContentAr;
    private String productsContentEn;
    private String partnersContent;
    private String industriesContentAr;
    private String industriesContentEn;
    private String brochurePath;
    private Integer statsHappyClients;
    private Integer statsYearsExperience;
    private Integer statsProjectsCompleted;
    private Integer statsCustomerSatisfaction;
}
