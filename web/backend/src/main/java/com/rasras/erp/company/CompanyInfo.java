package com.rasras.erp.company;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "companyinfo")
@EntityListeners(AuditingEntityListener.class)
public class CompanyInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CompanyID")
    private Integer id;

    @Column(name = "CompanyNameAr", nullable = false)
    private String companyNameAr;

    @Column(name = "CompanyNameEn")
    private String companyNameEn;

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

    @Column(name = "LogoPath")
    private String logoPath;

    @Column(name = "HeaderPath")
    private String headerPath;

    @Column(name = "FooterText")
    private String footerText;

    @Column(name = "Currency")
    private String currency;

    @Column(name = "FiscalYearStartMonth")
    private Integer fiscalYearStartMonth;

    @Column(name = "AboutText", columnDefinition = "TEXT")
    private String aboutText;

    @Column(name = "VisionText", columnDefinition = "TEXT")
    private String visionText;

    @Column(name = "MissionText", columnDefinition = "TEXT")
    private String missionText;

    @Column(name = "GoalsText", columnDefinition = "TEXT")
    private String goalsText;

    @Column(name = "FooterTextEn", columnDefinition = "TEXT")
    private String footerTextEn;

    @Column(name = "AboutTextEn", columnDefinition = "TEXT")
    private String aboutTextEn;

    @Column(name = "VisionTextEn", columnDefinition = "TEXT")
    private String visionTextEn;

    @Column(name = "MissionTextEn", columnDefinition = "TEXT")
    private String missionTextEn;

    @Column(name = "GoalsTextEn", columnDefinition = "TEXT")
    private String goalsTextEn;

    @Column(name = "ServicesContentAr", columnDefinition = "TEXT")
    private String servicesContentAr;

    @Column(name = "ServicesContentEn", columnDefinition = "TEXT")
    private String servicesContentEn;

    @Column(name = "ProductsContentAr", columnDefinition = "TEXT")
    private String productsContentAr;

    @Column(name = "ProductsContentEn", columnDefinition = "TEXT")
    private String productsContentEn;

    @Column(name = "PartnersContent", columnDefinition = "TEXT")
    private String partnersContent;

    @Column(name = "IndustriesContentAr", columnDefinition = "TEXT")
    private String industriesContentAr;

    @Column(name = "IndustriesContentEn", columnDefinition = "TEXT")
    private String industriesContentEn;

    @Column(name = "BrochurePath")
    private String brochurePath;

    @Column(name = "StatsHappyClients")
    private Integer statsHappyClients;

    @Column(name = "StatsYearsExperience")
    private Integer statsYearsExperience;

    @Column(name = "StatsProjectsCompleted")
    private Integer statsProjectsCompleted;

    @Column(name = "StatsCustomerSatisfaction")
    private Integer statsCustomerSatisfaction;

    @LastModifiedDate
    @Column(name = "UpdatedAt")
    private LocalDateTime updatedAt;

    @LastModifiedBy
    @Column(name = "UpdatedBy")
    private Integer updatedBy;
}
