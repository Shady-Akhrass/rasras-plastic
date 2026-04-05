package com.rasras.erp.procurement;

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
@RequestMapping("/procurement/rfq")
@RequiredArgsConstructor
@PreAuthorize(SecurityConstants.PROCUREMENT_SECTION)
public class RFQController {

    private final RFQService rfqService;
    private final RFQPdfService rfqPdfService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RFQDto>>> getAllRFQs() {
        return ResponseEntity.ok(ApiResponse.success(rfqService.getAllRFQs()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RFQDto>> getRFQById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(rfqService.getRFQById(id)));
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadRFQPdf(@PathVariable Integer id) {
        RFQDto rfq = rfqService.getRFQById(id);
        byte[] pdf = rfqPdfService.generatePdf(rfq);
        String fileName = "RFQ_" + (rfq.getRfqNumber() != null ? rfq.getRfqNumber() : id) + ".pdf";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RFQDto>> createRFQ(@RequestBody RFQDto dto) {
        return ResponseEntity.ok(ApiResponse.success(rfqService.createRFQ(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RFQDto>> updateRFQ(@PathVariable Integer id, @RequestBody RFQDto dto) {
        return ResponseEntity.ok(ApiResponse.success(rfqService.updateRFQ(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRFQ(@PathVariable Integer id) {
        rfqService.deleteRFQ(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/{id}/delete")
    public ResponseEntity<ApiResponse<Void>> deleteRFQPost(@PathVariable Integer id) {
        rfqService.deleteRFQ(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
