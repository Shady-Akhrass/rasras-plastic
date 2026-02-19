package com.rasras.erp.security;

import com.rasras.erp.procurement.PurchaseRequisitionController;
import com.rasras.erp.procurement.PurchaseRequisitionService;
import com.rasras.erp.shared.config.SecurityConfig;
import com.rasras.erp.shared.security.JwtTokenProvider;
import com.rasras.erp.system.SystemSettingController;
import com.rasras.erp.system.SystemSettingService;
import com.rasras.erp.user.RoleController;
import com.rasras.erp.user.RoleService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;

import java.util.Collections;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * اختبارات تكامل لصلاحيات الوصول إلى واجهات الـ API (المرحلة الرابعة — خطة إصلاح الصلاحيات).
 * Verifies that role/authority-based @PreAuthorize rules are enforced.
 */
@WebMvcTest(controllers = {
        PurchaseRequisitionController.class,
        RoleController.class,
        SystemSettingController.class
})
@Import(SecurityConfig.class)
class PermissionSecurityIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PurchaseRequisitionService purchaseRequisitionService;

    @MockBean
    private RoleService roleService;

    @MockBean
    private SystemSettingService systemSettingService;

    /** مطلوب لتحميل SecurityConfig والفلاتر في شريحة WebMvcTest (الفلاتر الحقيقية تحتاج هذه التبعيات) */
    @MockBean
    private UserDetailsService userDetailsService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    /** مطلوب عند تحميل @EnableJpaAuditing في شريحة WebMvcTest (بدون JPA كامل) */
    @MockBean
    private JpaMetamodelMappingContext jpaMappingContext;

    @Nested
    @DisplayName("غير مصادق (Unauthenticated)")
    class Unauthenticated {

        /** بدون مصادقة حقيقية: AnonymousAuthenticationFilter يضع مصادقاً مجهولاً ثم Method Security يرفض → 403 */
        @Test
        @DisplayName("GET /procurement/pr → 403 (ممنوع)")
        void getProcurementPr_returns401() throws Exception {
            mockMvc.perform(get("/procurement/pr").contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("GET /settings/public → 403 (ممنوع)")
        void getSettingsPublic_returns401() throws Exception {
            mockMvc.perform(get("/settings/public").contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("GET /roles → 403 (ممنوع)")
        void getRoles_returns401() throws Exception {
            mockMvc.perform(get("/roles").contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("مستخدم بدور مشتري + SECTION_PROCUREMENT (BUYER)")
    class BuyerWithProcurementSection {

        @Test
        @WithMockUser(username = "buyer", authorities = {"ROLE_BUYER", "SECTION_MAIN", "SECTION_PROCUREMENT"})
        @DisplayName("GET /procurement/pr → 200")
        void getProcurementPr_returns200() throws Exception {
            when(purchaseRequisitionService.getAllPurchaseRequisitions()).thenReturn(Collections.emptyList());
            mockMvc.perform(get("/procurement/pr").contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk());
        }

        @Test
        @WithMockUser(username = "buyer", authorities = {"ROLE_BUYER", "SECTION_MAIN", "SECTION_PROCUREMENT"})
        @DisplayName("GET /settings/public → 200 (أي مصادق)")
        void getSettingsPublic_returns200() throws Exception {
            when(systemSettingService.getPublicSettings()).thenReturn(Collections.emptyList());
            mockMvc.perform(get("/settings/public").contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk());
        }

        @Test
        @WithMockUser(username = "buyer", authorities = {"ROLE_BUYER", "SECTION_MAIN", "SECTION_PROCUREMENT"})
        @DisplayName("GET /roles → 403 (مدير نظام فقط)")
        void getRoles_returns403() throws Exception {
            mockMvc.perform(get("/roles").contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(username = "buyer", authorities = {"ROLE_BUYER", "SECTION_MAIN", "SECTION_PROCUREMENT"})
        @DisplayName("GET /settings (كامل) → 403")
        void getAllSettings_returns403() throws Exception {
            mockMvc.perform(get("/settings").contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("مستخدم بصلاحية إعدادات النظام (SECTION_SYSTEM) و المشتريات (SECTION_PROCUREMENT)")
    class SystemAdmin {

        @Test
        @WithMockUser(username = "admin", authorities = {"ROLE_ADMIN", "SECTION_SYSTEM"})
        @DisplayName("GET /roles → 200")
        void getRoles_returns200() throws Exception {
            when(roleService.getAllRoles()).thenReturn(Collections.emptyList());
            mockMvc.perform(get("/roles").contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk());
        }

        @Test
        @WithMockUser(username = "admin", authorities = {"ROLE_ADMIN", "SECTION_SYSTEM"})
        @DisplayName("GET /settings → 200")
        void getAllSettings_returns200() throws Exception {
            when(systemSettingService.getAllSettings()).thenReturn(Collections.emptyList());
            when(systemSettingService.getPublicSettings()).thenReturn(Collections.emptyList());
            mockMvc.perform(get("/settings").contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk());
        }

        @Test
        @WithMockUser(username = "admin", authorities = {"ROLE_ADMIN", "SECTION_PROCUREMENT"})
        @DisplayName("GET /procurement/pr → 200 (صلاحية SECTION_PROCUREMENT)")
        void getProcurementPr_returns200() throws Exception {
            when(purchaseRequisitionService.getAllPurchaseRequisitions()).thenReturn(Collections.emptyList());
            mockMvc.perform(get("/procurement/pr").contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("مستخدم مصادق بدون صلاحية مشتريات")
    class AuthenticatedWithoutProcurement {

        @Test
        @WithMockUser(username = "acc", authorities = {"ROLE_ACC", "SECTION_MAIN", "SECTION_FINANCE"})
        @DisplayName("GET /procurement/pr → 403")
        void getProcurementPr_returns403() throws Exception {
            mockMvc.perform(get("/procurement/pr").contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(username = "acc", authorities = {"ROLE_ACC", "SECTION_MAIN", "SECTION_FINANCE"})
        @DisplayName("GET /settings/public → 200")
        void getSettingsPublic_returns200() throws Exception {
            when(systemSettingService.getPublicSettings()).thenReturn(Collections.emptyList());
            mockMvc.perform(get("/settings/public").contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk());
        }
    }
}
