package com.rasras.erp.procurement;

import com.rasras.erp.shared.security.SecurityConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/procurement/po")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")

public class PurchaseOrderController {

    private final PurchaseOrderService poService;

    @PreAuthorize(SecurityConstants.PROCUREMENT_SECTION + " or " + SecurityConstants.SUPPLIER_INVOICE_VIEW + " or hasAuthority('SECTION_WAREHOUSE') or hasAuthority('SECTION_OPERATIONS') or hasAuthority('INVENTORY_VIEW')")
    @GetMapping
    public ResponseEntity<Map<String, List<PurchaseOrderDto>>> getAllPOs() {
        return ResponseEntity.ok(Map.of("data", poService.getAllPOs()));
    }

    @PreAuthorize(SecurityConstants.PROCUREMENT_SECTION + " or " + SecurityConstants.SUPPLIER_INVOICE_VIEW + " or hasAuthority('SECTION_WAREHOUSE') or hasAuthority('SECTION_OPERATIONS') or hasAuthority('INVENTORY_VIEW')")
    @GetMapping("/waiting")
    public ResponseEntity<Map<String, List<PurchaseOrderDto>>> getWaitingForArrivalPOs() {
        return ResponseEntity.ok(Map.of("data", poService.getWaitingForArrivalPOs()));
    }

    @PreAuthorize(SecurityConstants.PROCUREMENT_SECTION + " or " + SecurityConstants.SUPPLIER_INVOICE_VIEW)
    @GetMapping("/uninvoiced")
    public ResponseEntity<Map<String, List<PurchaseOrderDto>>> getUninvoicedPOs() {
        return ResponseEntity.ok(Map.of("data", poService.getUninvoicedPOs()));
    }

    @PreAuthorize(SecurityConstants.PROCUREMENT_SECTION + " or " + SecurityConstants.SUPPLIER_INVOICE_VIEW + " or hasAuthority('SECTION_WAREHOUSE') or hasAuthority('SECTION_OPERATIONS') or hasAuthority('INVENTORY_VIEW')")
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, PurchaseOrderDto>> getPOById(@PathVariable Integer id) {
        return ResponseEntity.ok(Map.of("data", poService.getPOById(id)));
    }

    @PreAuthorize(SecurityConstants.PROCUREMENT_SECTION)
    @PostMapping
    public ResponseEntity<Map<String, PurchaseOrderDto>> createPO(@RequestBody PurchaseOrderDto dto) {
        return ResponseEntity.ok(Map.of("data", poService.createPO(dto)));
    }

    @PreAuthorize(SecurityConstants.PROCUREMENT_SECTION)
    @PostMapping("/{id}/submit")
    public ResponseEntity<Map<String, PurchaseOrderDto>> submitForApproval(@PathVariable Integer id) {
        // Keeping Map<String, Dto> format as per other methods in this controller
        return ResponseEntity.ok(Map.of("data", poService.submitPO(id)));
    }

    @PreAuthorize(SecurityConstants.PROCUREMENT_SECTION + " or hasAuthority('SECTION_WAREHOUSE')")
    @PostMapping("/{id}/mark-arrived")
    public ResponseEntity<Map<String, com.rasras.erp.inventory.GoodsReceiptNoteDto>> markAsArrived(
            @PathVariable Integer id,
            @RequestParam(required = false) Integer userId) {
        return ResponseEntity.ok(Map.of("data", poService.markAsArrived(id, userId)));
    }

    @PreAuthorize(SecurityConstants.PROCUREMENT_SECTION)
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Void>> deletePO(@PathVariable Integer id) {
        poService.deletePO(id);
        return ResponseEntity.ok(Map.of("data", null));
    }

    @PreAuthorize(SecurityConstants.PROCUREMENT_SECTION)
    @PostMapping("/{id}/delete")
    public ResponseEntity<Map<String, Void>> deletePOPost(@PathVariable Integer id) {
        poService.deletePO(id);
        return ResponseEntity.ok(Map.of("data", null));
    }
}
