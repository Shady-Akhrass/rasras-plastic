package com.rasras.erp.procurement;

import com.rasras.erp.procurement.dto.PurchaseReturnDto;
import com.rasras.erp.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/procurement/returns")
@RequiredArgsConstructor
public class PurchaseReturnController {

    private final PurchaseReturnService returnService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PurchaseReturnDto>>> getAllReturns() {
        return ResponseEntity.ok(ApiResponse.success(returnService.getAllReturns()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PurchaseReturnDto>> getReturnById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(returnService.getReturnById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PurchaseReturnDto>> createReturn(@RequestBody PurchaseReturnDto dto) {
        return ResponseEntity.ok(ApiResponse.success(returnService.createReturn(dto)));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<PurchaseReturnDto>> approveReturn(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(returnService.approveReturn(id, 1))); // Placeholder user ID
    }
}
