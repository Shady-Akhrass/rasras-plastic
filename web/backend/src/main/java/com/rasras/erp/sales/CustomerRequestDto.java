package com.rasras.erp.sales;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerRequestDto {
    private Integer requestId;
    private String requestNumber;
    private LocalDate requestDate;
    private Integer customerId;
    private String customerName; // Transients
    private Integer priceListId;
    private String status;
    private String notes;
    private LocalDateTime createdAt;
    private Integer createdBy;
    private List<CustomerRequestItemDto> items;
}
