package com.rasras.erp.procurement;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/procurement/po")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PurchaseOrderController {

    private final PurchaseOrderService poService;

    @GetMapping
    public ResponseEntity<Map<String, List<PurchaseOrderDto>>> getAllPOs() {
        return ResponseEntity.ok(Map.of("data", poService.getAllPOs()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, PurchaseOrderDto>> getPOById(@PathVariable Integer id) {
        return ResponseEntity.ok(Map.of("data", poService.getPOById(id)));
    }

    @PostMapping
    public ResponseEntity<Map<String, PurchaseOrderDto>> createPO(@RequestBody PurchaseOrderDto dto) {
        return ResponseEntity.ok(Map.of("data", poService.createPO(dto)));
    }
}
