package com.rasras.erp.procurement;

import com.rasras.erp.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/procurement/rfq")
@RequiredArgsConstructor
public class RFQController {

    private final RFQService rfqService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RFQDto>>> getAllRFQs() {
        return ResponseEntity.ok(ApiResponse.success(rfqService.getAllRFQs()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RFQDto>> getRFQById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(rfqService.getRFQById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RFQDto>> createRFQ(@RequestBody RFQDto dto) {
        return ResponseEntity.ok(ApiResponse.success(rfqService.createRFQ(dto)));
    }
}
