package com.rasras.erp.procurement;

import com.rasras.erp.shared.dto.ApiResponse;
import com.rasras.erp.shared.security.SecurityConstants;
import com.rasras.erp.shared.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/procurement/pr")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize(SecurityConstants.PROCUREMENT_SECTION)
public class PurchaseRequisitionController {

    private final PurchaseRequisitionService prService;
    private final PurchaseRequisitionPdfService prPdfService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PurchaseRequisitionDto>>> getAllPurchaseRequisitions() {
        return ResponseEntity.ok(ApiResponse.success(prService.getAllPurchaseRequisitions()));
    }

    @GetMapping("/approved-without-rfq-count")
    public ResponseEntity<ApiResponse<Long>> getApprovedPRWithoutRFQCount() {
        return ResponseEntity.ok(ApiResponse.success(prService.getApprovedPRWithoutRFQCount()));
    }

    @GetMapping("/sales")
    public ResponseEntity<ApiResponse<List<PurchaseRequisitionDto>>> getSalesPRs() {
        Integer userId = null;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            userId = principal.getId();
        }
        return ResponseEntity.ok(ApiResponse.success(prService.getPRsForSalesUser(userId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PurchaseRequisitionDto>> getPurchaseRequisitionById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(prService.getPurchaseRequisitionById(id)));
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPurchaseRequisitionPdf(@PathVariable Integer id) {
        PurchaseRequisitionDto pr = prService.getPurchaseRequisitionById(id);
        byte[] pdf = prPdfService.generatePdf(pr);
        String fileName = "PurchaseRequisition_" + (pr.getPrNumber() != null ? pr.getPrNumber() : id) + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PurchaseRequisitionDto>> createPurchaseRequisition(
            @RequestBody PurchaseRequisitionDto dto) {
        return ResponseEntity.ok(ApiResponse.success(prService.createPurchaseRequisition(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PurchaseRequisitionDto>> updatePurchaseRequisition(
            @PathVariable Integer id,
            @RequestBody PurchaseRequisitionDto dto) {
        return ResponseEntity.ok(ApiResponse.success(prService.updatePurchaseRequisition(id, dto)));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<PurchaseRequisitionDto>> submitForApproval(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(prService.submitForApproval(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePurchaseRequisition(@PathVariable Integer id) {
        prService.deletePurchaseRequisition(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/{id}/delete")
    public ResponseEntity<ApiResponse<Void>> deletePurchaseRequisitionPost(@PathVariable Integer id) {
        prService.deletePurchaseRequisition(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/{id}/lifecycle")
    public ResponseEntity<ApiResponse<PRLifecycleDto>> getPRLifecycle(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(prService.getPRLifecycle(id)));
    }
}