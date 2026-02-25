package com.rasras.erp.user;

import com.rasras.erp.shared.security.PathPermissionConstants;
import com.rasras.erp.user.dto.PathAuditResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;
import org.springframework.web.util.pattern.PathPattern;

import java.util.*;
import java.util.stream.Collectors;

/**
 * تدقيق تغطية مسارات API بقواعد path_permission.
 * يُرجع قائمة المسارات المسجلة في التطبيق والتي لا تغطيها أي قاعدة (ستُرجع 403 مع Default Deny).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PathPermissionAuditService {

    private final RequestMappingHandlerMapping requestMappingHandlerMapping;
    private final PathPermissionService pathPermissionService;

    @Value("${server.servlet.context-path:/api}")
    private String contextPath;

    private static final Set<String> ALL_METHODS = Set.of("GET", "POST", "PUT", "DELETE", "PATCH");

    /**
     * يجمع كل (path, method) المسجلة في التطبيق ثم يتحقق لكل منها:
     * - إن كان ضمن Whitelist → لا يُحسب كـ "يحتاج تغطية".
     * - إن كانت هناك قاعدة path_permission تطابق المسار والطريقة → covered.
     * - وإلا → uncovered (ستُرجع 403 مع Default Deny).
     */
    public PathAuditResult runPathAudit() {
        List<PathAuditResult.PathMethod> uncovered = new ArrayList<>();
        int covered = 0;
        Set<PathAuditResult.PathMethod> allChecked = new HashSet<>();

        Map<RequestMappingInfo, HandlerMethod> handlerMethods = requestMappingHandlerMapping.getHandlerMethods();
        for (RequestMappingInfo info : handlerMethods.keySet()) {
            Set<String> pathPatterns = getPathPatternStrings(info);
            Set<String> methods = getRequestMethods(info);
            if (pathPatterns.isEmpty() || methods.isEmpty()) continue;

            for (String pattern : pathPatterns) {
                String base = normalizeContextPath(contextPath);
                String fullPath = pattern.startsWith("/") ? base + pattern : base + "/" + pattern;
                if (PathPermissionConstants.isWhitelisted(fullPath)) continue;

                for (String method : methods) {
                    PathAuditResult.PathMethod pm = new PathAuditResult.PathMethod(fullPath, method);
                    if (allChecked.contains(pm)) continue;
                    allChecked.add(pm);

                    Set<String> allowed = pathPermissionService.getAllowedPermissionCodesForApi(fullPath, method);
                    if (allowed.isEmpty()) {
                        uncovered.add(pm);
                    } else {
                        covered++;
                    }
                }
            }
        }

        int total = covered + uncovered.size();
        return PathAuditResult.builder()
                .totalMappings(total)
                .coveredCount(covered)
                .uncoveredPaths(uncovered)
                .whitelistPrefixes(PathPermissionConstants.getWhitelistPrefixes())
                .build();
    }

    private Set<String> getPathPatternStrings(RequestMappingInfo info) {
        var condition = info.getPathPatternsCondition();
        if (condition == null) return Set.of();
        Set<PathPattern> patterns = condition.getPatterns();
        if (patterns == null) return Set.of();
        return patterns.stream()
                .map(PathPattern::getPatternString)
                .collect(Collectors.toSet());
    }

    private Set<String> getRequestMethods(RequestMappingInfo info) {
        var condition = info.getMethodsCondition();
        if (condition == null) return ALL_METHODS;
        Set<RequestMethod> methods = condition.getMethods();
        if (methods == null || methods.isEmpty()) return ALL_METHODS;
        return methods.stream().map(RequestMethod::name).collect(Collectors.toSet());
    }

    private static String normalizeContextPath(String cp) {
        if (cp == null || cp.isEmpty()) return "";
        return cp.endsWith("/") ? cp.substring(0, cp.length() - 1) : cp;
    }
}
