package com.rasras.erp.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * عند التشغيل: يتحقق من صلاحيات القائمة (MENU_*) وتبعياتها.
 * تحذير تشخيصي وليس خطأ — قد يكون طبيعي لبعض صفحات MAIN (dashboard، company GET، إلخ).
 * لو المستخدم شاف منيو وبأول استدعاء API صار 403 → راجع dependency لهذا العنصر.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@Order(100)
public class MenuPermissionDependencyStartupCheck implements ApplicationRunner {

    private static final Set<String> FIXED_API_LIKE = Set.of("BASE_ACCESS", "APPROVAL_ACTION", "FILE_UPLOAD");

    private final PermissionRepository permissionRepository;
    private final PermissionDependencyRepository dependencyRepository;
    private final PermissionDependencyService permissionDependencyService;

    private static final String DEFAULT_API_PREFIXES = "ACCOUNTING_,INVENTORY_,FINANCE_,PROCUREMENT_,SALES_,SUPPLIER_INVOICE_";

    @Value("${app.permission-dependency.api-prefixes:" + DEFAULT_API_PREFIXES + "}")
    private String apiPrefixesConfig;

    private List<String> getApiPrefixes() {
        String src = apiPrefixesConfig != null && !apiPrefixesConfig.isBlank() ? apiPrefixesConfig : DEFAULT_API_PREFIXES;
        return Arrays.stream(src.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    private boolean isSectionOrApiPermission(String code) {
        if (code == null) return false;
        if (code.startsWith("SECTION_") || FIXED_API_LIKE.contains(code)) return true;
        for (String prefix : getApiPrefixes()) {
            if (code.startsWith(prefix)) return true;
        }
        return false;
    }

    @Override
    public void run(ApplicationArguments args) {
        List<Permission> menuPerms = permissionRepository.findByPermissionCodeStartingWith("MENU_");
        if (menuPerms.isEmpty()) return;

        int withoutDependency = 0;
        int noApiPermissionAtAll = 0;
        for (Permission p : menuPerms) {
            List<PermissionDependency> deps = dependencyRepository.findByPermissionPermissionId(p.getPermissionId());
            int depCount = deps != null ? deps.size() : 0;

            if (depCount == 0) {
                withoutDependency++;
                log.warn("Permission dependency [تشخيصي، ليس خطأ]: MENU permission has no dependency (0). قد يسبب 403 إن الصفحة تستدعي API. لو المستخدم شاف منيو وظهر 403 → راجع dependency. PermissionCode={}", p.getPermissionCode());
                continue;
            }

            Set<Integer> effectiveIds = permissionDependencyService.computeEffectivePermissionIds(List.of(p.getPermissionId()));
            List<Permission> effectivePerms = permissionRepository.findAllById(effectiveIds);
            // الإغلاق يحتوي دائماً على MENU_* نفسه؛ codes = غير MENU_* فقط (الصلاحيات المطلوبة فعلياً)
            Set<String> codes = effectivePerms.stream()
                    .map(Permission::getPermissionCode)
                    .filter(c -> c != null && !c.startsWith("MENU_"))
                    .collect(Collectors.toSet());

            // INFO إذا non-MENU part of closure = BASE_ACCESS فقط (طبيعي لصفحات MAIN)
            if (codes.size() == 1 && codes.contains("BASE_ACCESS")) {
                log.info("Permission dependency: MENU permission has {} dependency(ies), resolves only to BASE_ACCESS. قد يكون طبيعي لصفحات MAIN مثل dashboard/company. PermissionCode={}",
                        depCount, p.getPermissionCode());
                continue;
            }

            // WARNING إذا "menu only" — لا يوجد أي API-like في الإغلاق (لا SECTION_* ولا BASE_ACCESS ولا غيره)
            boolean hasSectionOrApi = codes.stream().anyMatch(this::isSectionOrApiPermission);
            if (!hasSectionOrApi) {
                noApiPermissionAtAll++;
                log.warn("Permission dependency [تشخيصي، ليس خطأ]: MENU resolves to menu only (no API-like in closure). Closure non-MENU codes={}. لو المستخدم شاف منيو وظهر 403 → راجع dependency. PermissionCode={}",
                        codes, p.getPermissionCode());
            }
        }

        if (withoutDependency > 0) {
            log.warn("Permission dependency [تشخيصي]: {} MENU_* permission(s) have no entry in permission_dependencies. Add dependencies or fix naming. لو منيو يظهر للمستخدم وAPI يرجع 403 → راجع dependency.", withoutDependency);
        }
        if (noApiPermissionAtAll > 0) {
            log.warn("Permission dependency [تشخيصي]: {} MENU_* permission(s) have dependencies that do not reach SECTION_* or other API-like permission. قد يكون طبيعي لبعض صفحات MAIN. لو 403 عند فتح الصفحة → راجع dependency.", noApiPermissionAtAll);
        }
    }
}
