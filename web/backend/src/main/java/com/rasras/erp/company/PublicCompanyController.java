package com.rasras.erp.company;

import com.rasras.erp.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/public/company")
@RequiredArgsConstructor
@Tag(name = "Public Company Info", description = "Public Company Information APIs")
public class PublicCompanyController {

    private final CompanyInfoService companyInfoService;

    @GetMapping
    @Operation(summary = "Get public company info", description = "Returns the company details for public pages")
    public ResponseEntity<ApiResponse<CompanyInfoDto>> getPublicCompanyInfo() {
        companyInfoService.initCompanyBit();
        return ResponseEntity.ok(ApiResponse.success(companyInfoService.getCompanyInfo()));
    }
}

