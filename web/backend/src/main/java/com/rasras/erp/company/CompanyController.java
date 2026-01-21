package com.rasras.erp.company;

import com.rasras.erp.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/company")
@RequiredArgsConstructor
@Tag(name = "Company Info", description = "Company Information APIs")
public class CompanyController {

    private final CompanyInfoService companyInfoService;

    @GetMapping
    @Operation(summary = "Get company info", description = "Returns the company details")
    public ResponseEntity<ApiResponse<CompanyInfoDto>> getCompanyInfo() {
        // Ensure there is at least one record
        companyInfoService.initCompanyBit();
        return ResponseEntity.ok(ApiResponse.success(companyInfoService.getCompanyInfo()));
    }

    @PutMapping
    @Operation(summary = "Update company info", description = "Updates the company details")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SYS_ADMIN')")
    public ResponseEntity<ApiResponse<CompanyInfoDto>> updateCompanyInfo(@RequestBody CompanyInfoDto companyInfoDto) {
        return ResponseEntity.ok(ApiResponse.success(companyInfoService.updateCompanyInfo(companyInfoDto)));
    }
}
