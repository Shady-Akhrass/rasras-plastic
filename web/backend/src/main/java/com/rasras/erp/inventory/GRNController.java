package com.rasras.erp.inventory;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/inventory/grn")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'SYS_ADMIN', 'SYSTEM_ADMIN', 'GM') or hasAuthority('SECTION_OPERATIONS') or hasAuthority('SECTION_PROCUREMENT')")
public class GRNController {

    private final GRNService grnService;

    @GetMapping
    public ResponseEntity<Map<String, List<GoodsReceiptNoteDto>>> getAllGRNs() {
        return ResponseEntity.ok(Map.of("data", grnService.getAllGRNs()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, GoodsReceiptNoteDto>> getGRNById(@PathVariable Integer id) {
        return ResponseEntity.ok(Map.of("data", grnService.getGRNById(id)));
    }

    @PostMapping
    public ResponseEntity<Map<String, GoodsReceiptNoteDto>> createGRN(@RequestBody GoodsReceiptNoteDto dto) {
        return ResponseEntity.ok(Map.of("data", grnService.createGRN(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, GoodsReceiptNoteDto>> updateGRN(@PathVariable Integer id,
            @RequestBody GoodsReceiptNoteDto dto) {
        return ResponseEntity.ok(Map.of("data", grnService.updateGRN(id, dto)));
    }

    @PostMapping("/{id}/finalize")
    public ResponseEntity<Map<String, GoodsReceiptNoteDto>> finalizeStoreIn(@PathVariable Integer id,
            @RequestParam Integer userId) {
        return ResponseEntity.ok(Map.of("data", grnService.finalizeStoreIn(id, userId)));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<Map<String, GoodsReceiptNoteDto>> submitGRN(@PathVariable Integer id,
            @RequestParam Integer userId) {
        return ResponseEntity.ok(Map.of("data", grnService.submitGRN(id, userId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Void>> deleteGRN(@PathVariable Integer id) {
        grnService.deleteGRN(id);
        return ResponseEntity.ok(Map.of("data", null));
    }

    @PostMapping("/{id}/delete")
    public ResponseEntity<Map<String, Void>> deleteGRNPost(@PathVariable Integer id) {
        grnService.deleteGRN(id);
        return ResponseEntity.ok(Map.of("data", null));
    }
}
