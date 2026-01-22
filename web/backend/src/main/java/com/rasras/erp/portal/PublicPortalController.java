package com.rasras.erp.portal;

import com.rasras.erp.crm.CustomerDto;
import com.rasras.erp.crm.CustomerService;
import com.rasras.erp.inventory.PriceListDto;
import com.rasras.erp.inventory.PriceListService;
import com.rasras.erp.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PublicPortalController {

    private final PriceListService priceListService;
    private final CustomerService customerService;

    @GetMapping("/inventory/price-lists/selling")
    public ResponseEntity<ApiResponse<List<PriceListDto>>> getSellingPriceLists() {
        List<PriceListDto> allLists = priceListService.getAll();
        List<PriceListDto> sellingLists = allLists.stream()
                .filter(p -> "SELLING".equals(p.getListType()) && p.getIsActive())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(sellingLists));
    }

    @PostMapping("/crm/register")
    public ResponseEntity<ApiResponse<CustomerDto>> registerCustomer(@RequestBody CustomerDto dto) {
        // Ensure some defaults for public registration
        dto.setIsActive(true);
        dto.setIsApproved(false); // Needs manual approval from dashboard
        dto.setCustomerType("RETAIL");

        CustomerDto saved = customerService.createCustomer(dto);
        return ResponseEntity
                .ok(ApiResponse.success("Registration successful. Our team will contact you soon.", saved));
    }
}
