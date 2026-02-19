package com.rasras.erp.user;

import com.rasras.erp.user.dto.AssignPermissionsRequest;
import com.rasras.erp.user.dto.RoleDto;
import com.rasras.erp.shared.security.SecurityConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
@PreAuthorize(SecurityConstants.SYSTEM_ADMIN_ONLY)
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    public ResponseEntity<List<RoleDto>> getAllRoles() {
        return ResponseEntity.ok(roleService.getAllRoles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoleDto> getRoleById(@PathVariable Integer id) {
        return ResponseEntity.ok(roleService.getRoleById(id));
    }

    @PostMapping
    public ResponseEntity<RoleDto> createRole(@RequestBody RoleDto dto) {
        return ResponseEntity.ok(roleService.createRole(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoleDto> updateRole(@PathVariable Integer id, @RequestBody RoleDto dto) {
        return ResponseEntity.ok(roleService.updateRole(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable Integer id) {
        roleService.deleteRole(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/permissions")
    public ResponseEntity<Void> assignPermissions(@PathVariable Integer id,
            @Valid @RequestBody AssignPermissionsRequest request) {
        List<Integer> ids = request.getPermissionIds() != null ? request.getPermissionIds() : List.of();
        roleService.assignPermissions(id, ids);
        return ResponseEntity.ok().build();
    }
}
