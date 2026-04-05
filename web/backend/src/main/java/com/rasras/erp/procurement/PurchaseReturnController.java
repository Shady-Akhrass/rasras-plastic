package com.rasras.erp.procurement;

import com.rasras.erp.procurement.dto.PurchaseReturnDto;
import com.rasras.erp.shared.dto.ApiResponse;
import com.rasras.erp.shared.security.SecurityConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/procurement/returns")
@RequiredArgsConstructor
@PreAuthorize(SecurityConstants.PROCUREMENT_SECTION)
public class PurchaseReturnController {

    private final PurchaseReturnService returnService;
    private final PurchaseReturnPdfService returnPdfService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PurchaseReturnDto>>> getAllReturns() {
        return ResponseEntity.ok(ApiResponse.success(returnService.getAllReturns()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PurchaseReturnDto>> getReturnById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(returnService.getReturnById(id)));
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadReturnPdf(@PathVariable Integer id) {
        PurchaseReturnDto purchaseReturn = returnService.getReturnById(id);
        byte[] pdf = returnPdfService.generatePdf(purchaseReturn);
        String fileName = "PurchaseReturn_" + (purchaseReturn.getReturnNumber() != null ? purchaseReturn.getReturnNumber() : id) + ".pdf";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PurchaseReturnDto>> createReturn(@RequestBody PurchaseReturnDto dto) {
        return ResponseEntity.ok(ApiResponse.success(returnService.createReturn(dto)));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<PurchaseReturnDto>> approveReturn(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(returnService.approveReturn(id, 1))); // Placeholder user ID
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReturn(@PathVariable Integer id) {
        returnService.deleteReturn(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/{id}/delete")
    public ResponseEntity<ApiResponse<Void>> deleteReturnPost(@PathVariable Integer id) {
        returnService.deleteReturn(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
