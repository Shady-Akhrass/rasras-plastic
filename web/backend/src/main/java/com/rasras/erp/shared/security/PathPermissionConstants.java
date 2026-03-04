package com.rasras.erp.shared.security;

import java.util.Arrays;
import java.util.List;

/**
 * ثوابت مشتركة بين PathPermissionFilter و PathPermissionAuditService (مثل قائمة
 * المسارات المستثناة).
 */
public final class PathPermissionConstants {

    private PathPermissionConstants() {
    }

    /** مسارات لا نطبق عليها قواعد path_permission (whitelist). */
    public static final String[] WHITELIST_PREFIXES = {
            "/api/auth/",
            "/api/settings/public",
            "/api/swagger-ui",
            "/api/v3/api-docs",
            "/api/api-docs",
            "/api/actuator",
            "/api/uploads/",
            "/api/public/",
            "/api/finance/exchange-rates"
    };

    public static List<String> getWhitelistPrefixes() {
        return Arrays.asList(WHITELIST_PREFIXES);
    }

    public static boolean isWhitelisted(String path) {
        if (path == null)
            return true;
        for (String prefix : WHITELIST_PREFIXES) {
            if (path.equals(prefix) || path.startsWith(prefix))
                return true;
        }
        return false;
    }
}
