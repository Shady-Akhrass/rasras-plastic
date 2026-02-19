package com.rasras.erp.sales;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerRequestDeliveryScheduleDto {
    private Integer scheduleId;
    private Integer requestId;
    private LocalDate deliveryDate;
    private Integer productId;
    private BigDecimal quantity;
    private String notes;
}
