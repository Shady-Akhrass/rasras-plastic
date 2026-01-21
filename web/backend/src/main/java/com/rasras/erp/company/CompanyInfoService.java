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
                .build();
    }
}
