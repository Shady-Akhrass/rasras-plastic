package com.rasras.erp.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * نتيجة تدقيق تغطية مسارات API بقواعد path_permission.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PathAuditResult {

    /** إجمالي مسارات الـ API المسجلة في التطبيق (بعد استبعاد Whitelist). */
    private int totalMappings;

    /** عدد المسارات التي تغطيها قواعد path_permission. */
    private int coveredCount;

    /** المسارات التي لا تغطيها أي قاعدة (ستُرجع 403 مع Default Deny). */
    private List<PathMethod> uncoveredPaths;

    /** قائمة بادئات الـ Whitelist المعتمدة. */
    private List<String> whitelistPrefixes;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PathMethod {
        private String path;
        private String method;
    }
}
