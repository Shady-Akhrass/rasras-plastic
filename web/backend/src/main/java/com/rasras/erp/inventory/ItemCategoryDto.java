package com.rasras.erp.inventory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemCategoryDto {
    private Integer id;
    private String categoryCode;
    private String categoryNameAr;
    private String categoryNameEn;
    private Integer parentCategoryId;
    private String parentCategoryName; // Useful for UI
    private String description;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
