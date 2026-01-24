package com.rasras.erp.procurement;

import com.rasras.erp.procurement.dto.PurchaseReturnDto;
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
    public ResponseEntity<List<PurchaseReturnDto>> getAllReturns() {
        return ResponseEntity.ok(returnService.getAllReturns());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseReturnDto> getReturnById(@PathVariable Integer id) {
        return ResponseEntity.ok(returnService.getReturnById(id));
    }

    @PostMapping
    public ResponseEntity<PurchaseReturnDto> createReturn(@RequestBody PurchaseReturnDto dto) {
        return ResponseEntity.ok(returnService.createReturn(dto));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<PurchaseReturnDto> approveReturn(@PathVariable Integer id) {
        return ResponseEntity.ok(returnService.approveReturn(id, 1)); // Placeholder user ID
    }
}
