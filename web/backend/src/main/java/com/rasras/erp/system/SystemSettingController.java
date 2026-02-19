package com.rasras.erp.system;

import com.rasras.erp.shared.dto.ApiResponse;
import com.rasras.erp.shared.security.SecurityConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/settings")
@RequiredArgsConstructor
@Tag(name = "System Settings", description = "System Configuration APIs")
public class SystemSettingController {

    private final SystemSettingService systemSettingService;

    @GetMapping
    @Operation(summary = "Get all settings", description = "Returns all system settings")
    @PreAuthorize(SecurityConstants.SYSTEM_ADMIN_ONLY)
    public ResponseEntity<ApiResponse<List<SystemSettingDto>>> getAllSettings() {
        systemSettingService.initDefaultSettings();
        return ResponseEntity.ok(ApiResponse.success(systemSettingService.getAllSettings()));
    }

    @GetMapping("/public")
    @Operation(summary = "Get public settings", description = "Returns settings readable by any authenticated user (e.g. RequireThreeQuotations for comparison page)")
    @PreAuthorize(SecurityConstants.AUTHENTICATED)
    public ResponseEntity<ApiResponse<List<SystemSettingDto>>> getPublicSettings() {
        return ResponseEntity.ok(ApiResponse.success(systemSettingService.getPublicSettings()));
    }

    @GetMapping("/category/{category}")
    @PreAuthorize(SecurityConstants.SYSTEM_ADMIN_ONLY)
    public ResponseEntity<ApiResponse<List<SystemSettingDto>>> getSettingsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(ApiResponse.success(systemSettingService.getSettingsByCategory(category)));
    }

    @PutMapping("/{key}")
    @PreAuthorize(SecurityConstants.SYSTEM_ADMIN_ONLY)
    public ResponseEntity<ApiResponse<SystemSettingDto>> updateSetting(
            @PathVariable String key,
            @RequestBody Map<String, String> payload) {
        String value = payload.get("value");
        return ResponseEntity.ok(ApiResponse.success(systemSettingService.updateSetting(key, value)));
    }
}
