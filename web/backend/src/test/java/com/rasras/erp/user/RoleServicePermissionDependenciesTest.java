package com.rasras.erp.user;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RoleServicePermissionDependenciesTest {

    @Mock
    private RoleRepository roleRepository;
    @Mock
    private PermissionRepository permissionRepository;
    @Mock
    private RolePermissionRepository rolePermissionRepository;
    @Mock
    private PermissionDependencyService permissionDependencyService;
    @Mock
    private UserRepository userRepository;
    @Mock
    private com.rasras.erp.approval.ApprovalWorkflowStepRepository approvalWorkflowStepRepository;
    @Mock
    private com.rasras.erp.approval.ApprovalLimitRepository approvalLimitRepository;

    @InjectMocks
    private RoleService roleService;

    @Test
    @DisplayName("assignPermissions persists effective permissions (selected + dependencies)")
    void assignPermissions_persistsEffectivePermissions() {
        Role role = new Role();
        role.setRoleId(100);
        when(roleRepository.findById(100)).thenReturn(Optional.of(role));

        Permission menuItems = new Permission();
        menuItems.setPermissionId(1);
        menuItems.setPermissionCode("MENU_OPERATIONS_ITEMS");
        Permission sectionWarehouse = new Permission();
        sectionWarehouse.setPermissionId(2);
        sectionWarehouse.setPermissionCode("SECTION_WAREHOUSE");

        when(permissionDependencyService.computeEffectivePermissionIds(List.of(1)))
                .thenReturn(Set.of(1, 2));
        when(permissionRepository.findById(1)).thenReturn(Optional.of(menuItems));
        when(permissionRepository.findById(2)).thenReturn(Optional.of(sectionWarehouse));

        roleService.assignPermissions(100, List.of(1));

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<RolePermission>> saved = ArgumentCaptor.forClass(List.class);
        verify(rolePermissionRepository).saveAll(saved.capture());
        List<RolePermission> list = saved.getValue();
        assertThat(list).hasSize(2);
        assertThat(list.stream().map(rp -> rp.getPermission().getPermissionCode()))
                .containsExactlyInAnyOrder("MENU_OPERATIONS_ITEMS", "SECTION_WAREHOUSE");
    }
}
