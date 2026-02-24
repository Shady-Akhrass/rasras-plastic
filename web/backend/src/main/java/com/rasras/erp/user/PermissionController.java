package com.rasras.erp.user;

import com.rasras.erp.user.dto.PathAuditResult;
import com.rasras.erp.user.dto.PathRuleDto;
import com.rasras.erp.user.dto.PermissionDto;
import com.rasras.erp.shared.security.SecurityConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/permissions")
@RequiredArgsConstructor
@PreAuthorize(SecurityConstants.SYSTEM_ADMIN_ONLY)
public class PermissionController {

    private final PermissionService permissionService;
    private final PathPermissionAuditService pathPermissionAuditService;
    private final PathPermissionService pathPermissionService;

    @GetMapping
    public ResponseEntity<List<PermissionDto>> getAllPermissions() {
        return ResponseEntity.ok(permissionService.getAllPermissions());
    }

    /**
     * قواعد مسارات الواجهة (PathType=FRONTEND) مع الصلاحية المرتبطة بكل مسار.
     * للاستخدام في الواجهة لتحديد إمكانية الوصول لكل Route و Sidebar.
     * متاح لأي مستخدم مصادق (isAuthenticated) لاستدعائه بعد تسجيل الدخول.
     */
    @GetMapping("/path-rules")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PathRuleDto>> getPathRules() {
        List<PathRuleDto> rules = pathPermissionService.getCachedRulesForFrontend().stream()
                .map(r -> PathRuleDto.builder()
                        .pathPattern(r.getPathPattern())
                        .httpMethod(r.getHttpMethod() != null ? r.getHttpMethod() : "*")
                        .permissionCode(r.getPermission() != null ? r.getPermission().getPermissionCode() : null)
                        .build())
                .filter(r -> r.getPermissionCode() != null)
                .collect(Collectors.toList());
        return ResponseEntity.ok(rules);
    }

    /**
     * تدقيق تغطية مسارات API بقواعد path_permission.
     * يُرجع المسارات التي لا تغطيها أي قاعدة (ستُرجع 403 مع Default Deny).
     * للتأكد من أن الجدول يحتوي قواعد لجميع المسارات المهمة.
     */
    @GetMapping("/path-audit")
    public ResponseEntity<PathAuditResult> getPathAudit() {
        return ResponseEntity.ok(pathPermissionAuditService.runPathAudit());
    }
}
