package com.rasras.erp.shared.security;

import com.rasras.erp.user.PathPermissionService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * فلتر التحقق من صلاحيات المسار (path_permission).
 * Default Deny: أي مسار غير عام (غير Whitelist) ولا توجد له قواعد في path_permission → 403.
 * @PreAuthorize تبقى طبقة أمان ثانية.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PathPermissionFilter extends OncePerRequestFilter {

    private final PathPermissionService pathPermissionService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        if (PathPermissionConstants.isWhitelisted(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        Set<String> allowedPermissions = pathPermissionService.getAllowedPermissionCodesForApi(path, method);

        if (allowedPermissions.isEmpty()) {
            // Default Deny: لا توجد قواعد للمسار → رفض.
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Forbidden");
            if (log.isDebugEnabled()) {
                log.debug("PathPermissionFilter [Default Deny]: 403 for {} {} — no path_permission rules", method, path);
            }
            return;
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Unauthorized");
            if (log.isDebugEnabled()) {
                log.debug("PathPermissionFilter: 403 for {} {} — not authenticated", method, path);
            }
            return;
        }

        Collection<String> userAuthorities = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        boolean hasAny = allowedPermissions.stream().anyMatch(userAuthorities::contains);
        if (hasAny) {
            filterChain.doFilter(request, response);
            return;
        }

        response.sendError(HttpServletResponse.SC_FORBIDDEN, "Forbidden");
        if (log.isDebugEnabled()) {
            log.debug("PathPermissionFilter: 403 for {} {} — user lacks required permission (allowed: {})", method, path, allowedPermissions);
        }
    }

}
