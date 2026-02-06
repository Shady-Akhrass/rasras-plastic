package com.rasras.erp.user;

import com.rasras.erp.approval.ApprovalLimitRepository;
import com.rasras.erp.approval.ApprovalWorkflowStepRepository;
import com.rasras.erp.shared.exception.BadRequestException;
import com.rasras.erp.user.dto.RoleDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final UserRepository userRepository;
    private final ApprovalWorkflowStepRepository approvalWorkflowStepRepository;
    private final ApprovalLimitRepository approvalLimitRepository;

    @Transactional(readOnly = true)
    public List<RoleDto> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RoleDto getRoleById(Integer id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));
        return mapToDto(role);
    }

    @Transactional
    public RoleDto createRole(RoleDto dto) {
        Role role = Role.builder()
                .roleCode(dto.getRoleCode())
                .roleNameAr(dto.getRoleNameAr())
                .roleNameEn(dto.getRoleNameEn())
                .description(dto.getDescription())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();
        return mapToDto(roleRepository.save(role));
    }

    @Transactional
    public RoleDto updateRole(Integer id, RoleDto dto) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        role.setRoleCode(dto.getRoleCode());
        role.setRoleNameAr(dto.getRoleNameAr());
        role.setRoleNameEn(dto.getRoleNameEn());
        role.setDescription(dto.getDescription());
        role.setIsActive(dto.getIsActive());

        return mapToDto(roleRepository.save(role));
    }

    @Transactional
    public void deleteRole(Integer id) {
        if (userRepository.existsByRole_RoleId(id)) {
            throw new BadRequestException("لا يمكن حذف الدور لأنه مرتبط بمستخدمين. قم بتغيير دور المستخدمين أولاً.");
        }
        if (approvalWorkflowStepRepository.existsByApproverRole_RoleId(id)) {
            throw new BadRequestException("لا يمكن حذف الدور لأنه مستخدم في خطوات سير الموافقة. قم بإزالة الدور من سير العمل أولاً.");
        }
        if (approvalLimitRepository.existsByRole_RoleId(id) || approvalLimitRepository.existsByRequiresReviewBy_RoleId(id)) {
            throw new BadRequestException("لا يمكن حذف الدور لأنه مستخدم في حدود الموافقة. قم بتعديل حدود الموافقة أولاً.");
        }
        // First delete role permissions
        List<RolePermission> permissions = rolePermissionRepository.findByRoleRoleId(id);
        rolePermissionRepository.deleteAll(permissions);

        roleRepository.deleteById(id);
    }

    @Transactional
    public void assignPermissions(Integer roleId, List<Integer> permissionIds) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        // Remove existing permissions
        List<RolePermission> existing = rolePermissionRepository.findByRoleRoleId(roleId);
        rolePermissionRepository.deleteAll(existing);

        // Add new permissions
        List<RolePermission> newPermissions = permissionIds.stream()
                .map(permId -> {
                    Permission permission = permissionRepository.findById(permId)
                            .orElseThrow(() -> new RuntimeException("Permission not found: " + permId));
                    return RolePermission.builder()
                            .role(role)
                            .permission(permission)
                            .isAllowed(true)
                            .build();
                })
                .collect(Collectors.toList());

        rolePermissionRepository.saveAll(newPermissions);
    }

    private RoleDto mapToDto(Role role) {
        List<Integer> permissionIds = rolePermissionRepository.findByRoleRoleId(role.getRoleId())
                .stream()
                .map(rp -> rp.getPermission().getPermissionId())
                .collect(Collectors.toList());

        return RoleDto.builder()
                .roleId(role.getRoleId())
                .roleCode(role.getRoleCode())
                .roleNameAr(role.getRoleNameAr())
                .roleNameEn(role.getRoleNameEn())
                .description(role.getDescription())
                .isActive(role.getIsActive())
                .permissionIds(permissionIds)
                .build();
    }
}
