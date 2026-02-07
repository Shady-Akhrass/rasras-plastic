package com.rasras.erp.procurement;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RFQDto {
    private Integer id;
    private String rfqNumber;
    private LocalDate rfqDate;
    private Integer prId;
    private String prNumber;
    private Integer supplierId;
    private String supplierNameAr;
    private LocalDate responseDueDate;
    private String status;
    private Integer sentByUserId;
    private LocalDateTime sentDate;
    private String notes;
    private LocalDateTime createdAt;
    private Integer createdBy;
    private List<RFQItemDto> items;
    private Boolean hasActiveOrders;
    private Boolean hasQuotation;
}
