package com.rasras.erp.company;

import com.rasras.erp.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CompanyInfoService {

    private final CompanyInfoRepository companyInfoRepository;

    public CompanyInfoDto getCompanyInfo() {
        return companyInfoRepository.findTopByOrderByIdAsc()
                .map(this::mapToDto)
                .orElseThrow(() -> new ResourceNotFoundException("CompanyInfo", "id", "default"));
    }

    @Transactional
    public CompanyInfoDto updateCompanyInfo(CompanyInfoDto companyInfoDto) {
        CompanyInfo companyInfo = companyInfoRepository.findTopByOrderByIdAsc()
                .orElse(new CompanyInfo());

        // Update fields
        companyInfo.setCompanyNameAr(companyInfoDto.getCompanyNameAr());
        companyInfo.setCompanyNameEn(companyInfoDto.getCompanyNameEn());
        companyInfo.setTaxRegistrationNo(companyInfoDto.getTaxRegistrationNo());
        companyInfo.setCommercialRegNo(companyInfoDto.getCommercialRegNo());
        companyInfo.setAddress(companyInfoDto.getAddress());
        companyInfo.setCity(companyInfoDto.getCity());
        companyInfo.setCountry(companyInfoDto.getCountry() != null ? companyInfoDto.getCountry() : "Egypt");
        companyInfo.setPhone(companyInfoDto.getPhone());
        companyInfo.setFax(companyInfoDto.getFax());
        companyInfo.setEmail(companyInfoDto.getEmail());
        companyInfo.setWebsite(companyInfoDto.getWebsite());
        companyInfo.setFooterText(companyInfoDto.getFooterText());
        companyInfo.setCurrency(companyInfoDto.getCurrency() != null ? companyInfoDto.getCurrency() : "EGP");
        companyInfo.setFiscalYearStartMonth(
                companyInfoDto.getFiscalYearStartMonth() != null ? companyInfoDto.getFiscalYearStartMonth() : 1);

        companyInfo.setLogoPath(companyInfoDto.getLogoPath());
        companyInfo.setHeaderPath(companyInfoDto.getHeaderPath());

        companyInfo.setAboutText(companyInfoDto.getAboutText());
        companyInfo.setVisionText(companyInfoDto.getVisionText());
        companyInfo.setMissionText(companyInfoDto.getMissionText());
        companyInfo.setGoalsText(companyInfoDto.getGoalsText());

        companyInfo.setFooterTextEn(companyInfoDto.getFooterTextEn());
        companyInfo.setAboutTextEn(companyInfoDto.getAboutTextEn());
        companyInfo.setVisionTextEn(companyInfoDto.getVisionTextEn());
        companyInfo.setMissionTextEn(companyInfoDto.getMissionTextEn());
        companyInfo.setGoalsTextEn(companyInfoDto.getGoalsTextEn());

        companyInfo.setServicesContentAr(companyInfoDto.getServicesContentAr());
        companyInfo.setServicesContentEn(companyInfoDto.getServicesContentEn());
        companyInfo.setProductsContentAr(companyInfoDto.getProductsContentAr());
        companyInfo.setProductsContentEn(companyInfoDto.getProductsContentEn());
        companyInfo.setPartnersContent(companyInfoDto.getPartnersContent());
        companyInfo.setIndustriesContentAr(companyInfoDto.getIndustriesContentAr());
        companyInfo.setIndustriesContentEn(companyInfoDto.getIndustriesContentEn());
        companyInfo.setBrochurePath(companyInfoDto.getBrochurePath());

        companyInfo.setStatsHappyClients(companyInfoDto.getStatsHappyClients());
        companyInfo.setStatsYearsExperience(companyInfoDto.getStatsYearsExperience());
        companyInfo.setStatsProjectsCompleted(companyInfoDto.getStatsProjectsCompleted());
        companyInfo.setStatsCustomerSatisfaction(companyInfoDto.getStatsCustomerSatisfaction());

        CompanyInfo saved = companyInfoRepository.save(companyInfo);
        return mapToDto(saved);
    }

    // Initial setup helper if database is empty
    @Transactional
    public void initCompanyBit() {
        if (companyInfoRepository.count() == 0) {
            CompanyInfo companyInfo = CompanyInfo.builder()
                    .companyNameAr("RasRas Plastics")
                    .companyNameEn("RasRas Plastics Trading")
                    .country("Egypt")
                    .currency("EGP")
                    .fiscalYearStartMonth(1)
                    .build();
            companyInfoRepository.save(companyInfo);
        }
    }

    private CompanyInfoDto mapToDto(CompanyInfo entity) {
        return CompanyInfoDto.builder()
                .id(entity.getId())
                .companyNameAr(entity.getCompanyNameAr())
                .companyNameEn(entity.getCompanyNameEn())
                .taxRegistrationNo(entity.getTaxRegistrationNo())
                .commercialRegNo(entity.getCommercialRegNo())
                .address(entity.getAddress())
                .city(entity.getCity())
                .country(entity.getCountry())
                .phone(entity.getPhone())
                .fax(entity.getFax())
                .email(entity.getEmail())
                .website(entity.getWebsite())
                .logoPath(entity.getLogoPath())
                .headerPath(entity.getHeaderPath())
                .footerText(entity.getFooterText())
                .currency(entity.getCurrency())
                .fiscalYearStartMonth(entity.getFiscalYearStartMonth())
                .aboutText(entity.getAboutText())
                .visionText(entity.getVisionText())
                .missionText(entity.getMissionText())
                .goalsText(entity.getGoalsText())
                .footerTextEn(entity.getFooterTextEn())
                .aboutTextEn(entity.getAboutTextEn())
                .visionTextEn(entity.getVisionTextEn())
                .missionTextEn(entity.getMissionTextEn())
                .goalsTextEn(entity.getGoalsTextEn())
                .servicesContentAr(entity.getServicesContentAr())
                .servicesContentEn(entity.getServicesContentEn())
                .productsContentAr(entity.getProductsContentAr())
                .productsContentEn(entity.getProductsContentEn())
                .partnersContent(entity.getPartnersContent())
                .industriesContentAr(entity.getIndustriesContentAr())
                .industriesContentEn(entity.getIndustriesContentEn())
                .brochurePath(entity.getBrochurePath())
                .statsHappyClients(entity.getStatsHappyClients())
                .statsYearsExperience(entity.getStatsYearsExperience())
                .statsProjectsCompleted(entity.getStatsProjectsCompleted())
                .statsCustomerSatisfaction(entity.getStatsCustomerSatisfaction())
                .build();
    }
}
