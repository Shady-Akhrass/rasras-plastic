package com.rasras.erp.sales;

import com.rasras.erp.shared.dto.ApiResponse;
import com.rasras.erp.shared.security.SecurityConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sales/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize(SecurityConstants.SALES_SECTION)
public class SalesOrderController {

    private final SalesOrderService orderService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SalesOrderDto>>> getAllOrders() {
        return ResponseEntity.ok(ApiResponse.success(orderService.getAllOrders()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SalesOrderDto>> getOrderById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SalesOrderDto>> createOrder(@RequestBody SalesOrderDto dto) {
        return ResponseEntity.ok(ApiResponse.success(orderService.createOrder(dto)));
    }

    @PostMapping("/from-quotation/{quotationId}")
    public ResponseEntity<ApiResponse<SalesOrderDto>> createOrderFromQuotation(@PathVariable Integer quotationId) {
        return ResponseEntity.ok(ApiResponse.success(orderService.createOrderFromQuotation(quotationId)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SalesOrderDto>> updateOrder(
            @PathVariable Integer id,
            @RequestBody SalesOrderDto dto) {
        return ResponseEntity.ok(ApiResponse.success(orderService.updateOrder(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteOrder(@PathVariable Integer id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/{id}/check-credit")
    public ResponseEntity<ApiResponse<SalesOrderDto>> checkCreditLimit(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(orderService.checkCreditLimit(id)));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<SalesOrderDto>> submitForApproval(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(orderService.submitForApproval(id)));
    }
}
