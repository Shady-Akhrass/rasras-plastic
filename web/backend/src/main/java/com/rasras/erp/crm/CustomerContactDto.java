package com.rasras.erp.crm;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerContactDto {
    private Integer id;
    private Integer customerId;
    private String contactName;
    private String jobTitle;
    private String phone;
    private String mobile;
    private String email;
    private Boolean isPrimary;
    private Boolean isActive;
}
