package com.rasras.erp.crm;

import com.rasras.erp.shared.dto.ApiResponse;
import com.rasras.erp.shared.security.SecurityConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/crm/customers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize(SecurityConstants.CRM_SECTION)
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomerDto>>> getAllCustomers() {
        return ResponseEntity.ok(ApiResponse.success(customerService.getAllCustomers()));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<CustomerDto>>> getActiveCustomers() {
        return ResponseEntity.ok(ApiResponse.success(customerService.getActiveCustomers()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerDto>> getCustomerById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(customerService.getCustomerById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerDto>> createCustomer(@RequestBody CustomerDto dto) {
        return ResponseEntity.ok(ApiResponse.success(customerService.createCustomer(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerDto>> updateCustomer(@PathVariable Integer id,
            @RequestBody CustomerDto dto) {
        return ResponseEntity.ok(ApiResponse.success(customerService.updateCustomer(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCustomer(@PathVariable Integer id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
