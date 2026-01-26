package com.rasras.erp.inventory;

import com.rasras.erp.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/inventory/quality-inspection")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class QualityInspectionController {

    private final QualityInspectionService inspectionService;

    @PostMapping("/{grnId}")
    public ResponseEntity<ApiResponse<Void>> recordInspection(
            @PathVariable Integer grnId,
            @RequestBody QualityInspectionRequestDto bulkRequest) {
        inspectionService.recordBulkInspection(grnId, bulkRequest);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
