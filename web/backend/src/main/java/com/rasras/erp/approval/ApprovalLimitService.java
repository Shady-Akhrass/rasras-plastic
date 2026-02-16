package com.rasras.erp.approval;

import com.rasras.erp.approval.dto.ApprovalLimitDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApprovalLimitService {

    private final ApprovalLimitRepository limitRepo;

    @Transactional(readOnly = true)
    public List<ApprovalLimitDto> getAllLimits(String activityType) {
        List<ApprovalLimit> list = activityType != null && !activityType.isBlank()
                ? limitRepo.findByActivityType(activityType)
                : limitRepo.findAll();
        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ApprovalLimitDto> getLimitsByRole(Integer roleId) {
        return limitRepo.findByRole_RoleId(roleId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ApprovalLimitDto getById(Integer id) {
        return limitRepo.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException("Approval limit not found: " + id));
    }

    @Transactional
    public ApprovalLimitDto updateLimit(Integer id, ApprovalLimitDto dto) {
        ApprovalLimit entity = limitRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Approval limit not found: " + id));

        if ("SALES_DISCOUNT".equals(entity.getActivityType())) {
            if (dto.getMinPercentage() != null) entity.setMinPercentage(dto.getMinPercentage());
            entity.setMaxPercentage(dto.getMaxPercentage()); // null = بلا حد
        } else {
            if (dto.getMinAmount() != null) entity.setMinAmount(dto.getMinAmount());
            entity.setMaxAmount(dto.getMaxAmount()); // null = بلا حد
        }
        if (dto.getIsActive() != null) entity.setIsActive(dto.getIsActive());

        return mapToDto(limitRepo.save(entity));
    }

    private ApprovalLimitDto mapToDto(ApprovalLimit e) {
        return ApprovalLimitDto.builder()
                .id(e.getId())
                .activityType(e.getActivityType())
                .roleId(e.getRole() != null ? e.getRole().getRoleId() : null)
                .roleCode(e.getRole() != null ? e.getRole().getRoleCode() : null)
                .roleNameAr(e.getRole() != null ? e.getRole().getRoleNameAr() : null)
                .minAmount(e.getMinAmount())
                .maxAmount(e.getMaxAmount())
                .minPercentage(e.getMinPercentage())
                .maxPercentage(e.getMaxPercentage())
                .isActive(e.getIsActive())
                .build();
    }
}
