package com.rasras.erp.sales;

import com.rasras.erp.shared.dto.ApiResponse;
import com.rasras.erp.shared.security.SecurityConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sales/customer-requests")
@RequiredArgsConstructor
@PreAuthorize(SecurityConstants.SALES_SECTION)
public class CustomerRequestController {

    private final CustomerRequestService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomerRequestDto>>> getAllRequests() {
        return ResponseEntity.ok(ApiResponse.success(service.getAllRequests()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerRequestDto>> getRequestById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(service.getRequestById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerRequestDto>> createRequest(@RequestBody CustomerRequestDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Request created successfully", service.createRequest(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerRequestDto>> updateRequest(@PathVariable Integer id,
            @RequestBody CustomerRequestDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Request updated successfully", service.updateRequest(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRequest(@PathVariable Integer id) {
        service.deleteRequest(id);
        return ResponseEntity.ok(ApiResponse.success("Request deleted successfully"));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<CustomerRequestDto>> approveRequest(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success("Request approved", service.approveRequest(id)));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<CustomerRequestDto>> rejectRequest(@PathVariable Integer id,
            @RequestBody(required = false) String reason) {
        return ResponseEntity.ok(ApiResponse.success("Request rejected", service.rejectRequest(id, reason)));
    }
}
