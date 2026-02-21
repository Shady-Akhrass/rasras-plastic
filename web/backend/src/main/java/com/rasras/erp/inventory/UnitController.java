package com.rasras.erp.inventory;

import com.rasras.erp.shared.dto.ApiResponse;
import com.rasras.erp.shared.security.SecurityConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/units")
@RequiredArgsConstructor
@Tag(name = "Units of Measure", description = "Unit Management APIs")
@PreAuthorize(SecurityConstants.WAREHOUSE_SECTION + " or " + SecurityConstants.SUPPLIER_INVOICE_VIEW)
public class UnitController {

    private final UnitService unitService;

    @GetMapping
    @Operation(summary = "Get all units", description = "Returns all units of measure")
    public ResponseEntity<ApiResponse<List<UnitDto>>> getAllUnits() {
        return ResponseEntity.ok(ApiResponse.success(unitService.getAllUnits()));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<UnitDto>>> getActiveUnits() {
        return ResponseEntity.ok(ApiResponse.success(unitService.getActiveUnits()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UnitDto>> getUnitById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(unitService.getUnitById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UnitDto>> createUnit(@RequestBody UnitDto dto) {
        return ResponseEntity.ok(ApiResponse.success(unitService.createUnit(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UnitDto>> updateUnit(@PathVariable Integer id, @RequestBody UnitDto dto) {
        return ResponseEntity.ok(ApiResponse.success(unitService.updateUnit(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUnit(@PathVariable Integer id) {
        unitService.deleteUnit(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
