package com.rasras.erp.inventory;

import com.rasras.erp.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inventory/warehouses")
@RequiredArgsConstructor
@Tag(name = "Warehouses", description = "Warehouse and Location Management APIs")
public class WarehouseController {

    private final WarehouseService warehouseService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN') or hasAuthority('INVENTORY_VIEW')")
    public ResponseEntity<ApiResponse<List<WarehouseDto>>> getAllWarehouses() {
        return ResponseEntity.ok(ApiResponse.success(warehouseService.getAllWarehouses()));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<WarehouseDto>>> getActiveWarehouses() {
        return ResponseEntity.ok(ApiResponse.success(warehouseService.getActiveWarehouses()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN') or hasAuthority('INVENTORY_VIEW')")
    public ResponseEntity<ApiResponse<WarehouseDto>> getWarehouseById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(warehouseService.getWarehouseById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN') or hasAuthority('INVENTORY_CREATE')")
    public ResponseEntity<ApiResponse<WarehouseDto>> createWarehouse(@RequestBody WarehouseDto dto) {
        return ResponseEntity.ok(ApiResponse.success(warehouseService.createWarehouse(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN') or hasAuthority('INVENTORY_UPDATE')")
    public ResponseEntity<ApiResponse<WarehouseDto>> updateWarehouse(@PathVariable Integer id,
            @RequestBody WarehouseDto dto) {
        return ResponseEntity.ok(ApiResponse.success(warehouseService.updateWarehouse(id, dto)));
    }

    @PostMapping("/locations")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN') or hasAuthority('INVENTORY_CREATE')")
    public ResponseEntity<ApiResponse<WarehouseLocationDto>> addLocation(@RequestBody WarehouseLocationDto dto) {
        return ResponseEntity.ok(ApiResponse.success(warehouseService.addLocation(dto)));
    }

    @PutMapping("/locations/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN') or hasAuthority('INVENTORY_UPDATE')")
    public ResponseEntity<ApiResponse<WarehouseLocationDto>> updateLocation(@PathVariable Integer id,
            @RequestBody WarehouseLocationDto dto) {
        return ResponseEntity.ok(ApiResponse.success(warehouseService.updateLocation(id, dto)));
    }

    @GetMapping("/{id}/locations")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN') or hasAuthority('INVENTORY_VIEW')")
    public ResponseEntity<ApiResponse<List<WarehouseLocationDto>>> getLocations(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(warehouseService.getLocations(id)));
    }
}
