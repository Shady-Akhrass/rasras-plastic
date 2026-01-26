package com.rasras.erp.procurement;

import com.rasras.erp.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/procurement/pr")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PurchaseRequisitionController {

    private final PurchaseRequisitionService prService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PurchaseRequisitionDto>>> getAllPurchaseRequisitions() {
        return ResponseEntity.ok(ApiResponse.success(prService.getAllPurchaseRequisitions()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PurchaseRequisitionDto>> getPurchaseRequisitionById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(prService.getPurchaseRequisitionById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PurchaseRequisitionDto>> createPurchaseRequisition(
            @RequestBody PurchaseRequisitionDto dto) {
        return ResponseEntity.ok(ApiResponse.success(prService.createPurchaseRequisition(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PurchaseRequisitionDto>> updatePurchaseRequisition(@PathVariable Integer id,
            @RequestBody PurchaseRequisitionDto dto) {
        return ResponseEntity.ok(ApiResponse.success(prService.updatePurchaseRequisition(id, dto)));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<PurchaseRequisitionDto>> submitForApproval(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(prService.submitForApproval(id)));
    }
}
