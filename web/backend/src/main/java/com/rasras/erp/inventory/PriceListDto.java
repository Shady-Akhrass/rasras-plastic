package com.rasras.erp.inventory;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriceListDto {
    private Integer id;
    private String priceListCode;
    private String priceListName;
    private String listType;
    private String currency;
    private LocalDate validFrom;
    private LocalDate validTo;
    private Boolean isActive;
    private List<PriceListItemDto> items;
}
