package com.rasras.erp.user;

import com.rasras.erp.user.dto.PermissionDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PermissionService {

    private final PermissionRepository repository;

    @Transactional(readOnly = true)
    public List<PermissionDto> getAllPermissions() {
        return repository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private PermissionDto mapToDto(Permission entity) {
        return PermissionDto.builder()
                .permissionId(entity.getPermissionId())
                .permissionCode(entity.getPermissionCode())
                .permissionNameAr(entity.getPermissionNameAr())
                .permissionNameEn(entity.getPermissionNameEn())
                .moduleName(entity.getModuleName())
                .actionType(entity.getActionType())
                .isActive(entity.getIsActive())
                .build();
    }
}
