package com.rasras.erp.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.AntPathMatcher;

import jakarta.annotation.PostConstruct;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * تحميل قواعد path_permission في الذاكرة عند التشغيل.
 * ترتيب حسب priority DESC، واستخدام AntPathMatcher لمطابقة المسار.
 * لا يربط بأي Filter حتى الآن — الخدمة فقط.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PathPermissionService {

    private final PathPermissionRepository pathPermissionRepository;

    private static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();

    /**
     * كاش في الذاكرة: قائمة القواعد مرتبة حسب priority DESC.
     * CopyOnWriteArrayList لقراءة آمنة مع إمكانية إعادة التحميل لاحقاً.
     */
    private volatile List<PathPermission> cachedRules = Collections.emptyList();

    @PostConstruct
    public void loadRulesOnStartup() {
        reloadCache();
    }

    /**
     * إعادة تحميل القواعد من DB وملء الكاش، مع تسجيل النتائج.
     */
    public void reloadCache() {
        List<PathPermission> rules = pathPermissionRepository.findAllByOrderByPriorityDesc();
        this.cachedRules = new CopyOnWriteArrayList<>(rules);
        log.info("PathPermissionService: loaded {} path-permission rules (ordered by priority DESC)", rules.size());
        if (log.isDebugEnabled()) {
            for (PathPermission r : rules) {
                String permCode = r.getPermission() != null ? r.getPermission().getPermissionCode() : "?";
                log.debug("  [{}] {} {} -> {} (priority={})", r.getPathType(), r.getHttpMethod(), r.getPathPattern(), permCode, r.getPriority());
            }
        } else if (!rules.isEmpty()) {
            log.info("PathPermissionService: first rule pathPattern={}, pathType={}, priority={}", 
                    rules.get(0).getPathPattern(), rules.get(0).getPathType(), rules.get(0).getPriority());
        }
    }

    /**
     * يُرجع مجموعة رموز الصلاحيات التي تسمح بالوصول لمسار وطريقة HTTP معيّنين.
     * المطابقة باستخدام AntPathMatcher، وترتيب القواعد حسب priority DESC (مضمون في الكاش).
     *
     * @param path       مسار الطلب (مثلاً /api/inventory/items)
     * @param httpMethod طريقة HTTP (GET, POST, ...)
     * @param pathType   نوع المسار (API أو FRONTEND)
     * @return مجموعة رموز الصلاحيات (اتحاد كل القواعد المطابقة)، أو فارغة إن لم يُعرَّف أي قاعدة
     */
    public Set<String> getAllowedPermissionCodes(String path, String httpMethod, PathType pathType) {
        Set<String> allowed = new HashSet<>();
        List<PathPermission> rules = this.cachedRules;
        for (PathPermission rule : rules) {
            if (rule.getPathType() != pathType) continue;
            if (!PATH_MATCHER.match(rule.getPathPattern(), path)) continue;
            if (!"*".equals(rule.getHttpMethod()) && !rule.getHttpMethod().equalsIgnoreCase(httpMethod)) continue;
            if (rule.getPermission() != null && rule.getPermission().getPermissionCode() != null) {
                allowed.add(rule.getPermission().getPermissionCode());
            }
        }
        return allowed;
    }

    /**
     * نفس getAllowedPermissionCodes لمسارات API (للاستخدام من Filter لاحقاً).
     */
    public Set<String> getAllowedPermissionCodesForApi(String path, String httpMethod) {
        return getAllowedPermissionCodes(path, httpMethod, PathType.API);
    }

    /**
     * قواعد مسارات الواجهة فقط (مرتبة حسب priority DESC) — للتصدير إلى واجهة المستخدم (مثلاً GET /api/permissions/path-rules).
     */
    public List<PathPermission> getCachedRulesForFrontend() {
        List<PathPermission> rules = this.cachedRules;
        return rules.stream()
                .filter(r -> r.getPathType() == PathType.FRONTEND)
                .toList();
    }

    /**
     * عدد القواعد في الكاش (للمراقبة أو الاختبارات).
     */
    public int getCachedRulesCount() {
        return cachedRules.size();
    }
}
