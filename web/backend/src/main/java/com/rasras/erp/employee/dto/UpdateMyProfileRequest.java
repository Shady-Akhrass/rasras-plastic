package com.rasras.erp.employee.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateMyProfileRequest {
    @NotBlank(message = "الاسم الأول مطلوب")
    private String firstNameAr;
    @NotBlank(message = "الاسم الأخير مطلوب")
    private String lastNameAr;
}
