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

    @LastModifiedDate
    @Column(name = "UpdatedAt")
    private LocalDateTime updatedAt;

    @LastModifiedBy
    @Column(name = "UpdatedBy")
    private Integer updatedBy;
}
