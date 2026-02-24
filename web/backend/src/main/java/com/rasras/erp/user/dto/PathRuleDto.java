package com.rasras.erp.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * قاعدة مسار واحدة للواجهة (PathType=FRONTEND).
 * تُستخدم في GET /api/permissions/path-rules لتحديد الصلاحية المطلوبة لكل مسار.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PathRuleDto {

    /** نمط المسار (Ant-style)، مثلاً /dashboard/inventory/** */
    private String pathPattern;

    /** طريقة HTTP أو * لجميع الطرق (للتوافق، الواجهة قد تتجاهلها). */
    private String httpMethod;

    /** كود الصلاحية المطلوبة للوصول (مثل SECTION_INVENTORY). */
    private String permissionCode;
}
