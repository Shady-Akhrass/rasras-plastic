package com.rasras.erp.system;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemSettingDto {
    private Integer id;
    private String settingKey;
    private String settingValue;
    private String description;
    private String category;
    private String dataType;
}
