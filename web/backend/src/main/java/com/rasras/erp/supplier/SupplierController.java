package com.rasras.erp.supplier;

import com.rasras.erp.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SupplierDto>>> getAllSuppliers() {
        return ResponseEntity.ok(ApiResponse.success(supplierService.getAllSuppliers()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SupplierDto>> getSupplierById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(supplierService.getSupplierById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SupplierDto>> createSupplier(@RequestBody SupplierDto dto) {
        return ResponseEntity.ok(ApiResponse.success(supplierService.createSupplier(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SupplierDto>> updateSupplier(@PathVariable Integer id,
            @RequestBody SupplierDto dto) {
        return ResponseEntity.ok(ApiResponse.success(supplierService.updateSupplier(id, dto)));
    }

    @GetMapping("/items-master")
    public ResponseEntity<ApiResponse<List<SupplierItemDto>>> getAllSupplierItems() {
        return ResponseEntity.ok(ApiResponse.success(supplierService.getAllSupplierItems()));
    }

    @GetMapping("/{id}/items")
    public ResponseEntity<ApiResponse<List<SupplierItemDto>>> getSupplierItems(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(supplierService.getSupplierItems(id)));
    }

    @PostMapping("/link-item")
    public ResponseEntity<ApiResponse<SupplierItemDto>> linkItemToSupplier(@RequestBody SupplierItemDto dto) {
        return ResponseEntity.ok(ApiResponse.success(supplierService.linkItemToSupplier(dto)));
    }

    @DeleteMapping("/unlink-item/{id}")
    public ResponseEntity<ApiResponse<Void>> unlinkItemFromSupplier(@PathVariable Integer id) {
        supplierService.unlinkItemFromSupplier(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/{id}/banks")
    public ResponseEntity<ApiResponse<List<SupplierBankDto>>> getSupplierBanks(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(supplierService.getSupplierBanks(id)));
    }

    @PostMapping("/add-bank")
    public ResponseEntity<ApiResponse<SupplierBankDto>> addSupplierBank(@RequestBody SupplierBankDto dto) {
        return ResponseEntity.ok(ApiResponse.success(supplierService.addSupplierBank(dto)));
    }

    @DeleteMapping("/remove-bank/{id}")
    public ResponseEntity<ApiResponse<Void>> removeSupplierBank(@PathVariable Integer id) {
        supplierService.deleteSupplierBank(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<SupplierDto>> submitForApproval(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(supplierService.submitForApproval(id)));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<SupplierDto>> approveSupplier(
            @PathVariable Integer id,
            @RequestParam Integer userId,
            @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(ApiResponse.success(supplierService.approveSupplier(id, userId, notes)));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<SupplierDto>> rejectSupplier(
            @PathVariable Integer id,
            @RequestParam Integer userId,
            @RequestParam String notes) {
        return ResponseEntity.ok(ApiResponse.success(supplierService.rejectSupplier(id, userId, notes)));
    }

    @GetMapping("/outstanding-summary")
    public ResponseEntity<ApiResponse<List<SupplierOutstandingDto>>> getOutstandingSummary() {
        return ResponseEntity.ok(ApiResponse.success(supplierService.getOutstandingSummary()));
    }
}
