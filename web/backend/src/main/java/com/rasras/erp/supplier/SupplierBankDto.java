package com.rasras.erp.supplier;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierBankDto {
    private Integer id;
    private Integer supplierId;
    private String bankName;
    private String bankAccountNo;
    private String iban;
    private String swift;
    private String currency;
    private Boolean isDefault;
}
