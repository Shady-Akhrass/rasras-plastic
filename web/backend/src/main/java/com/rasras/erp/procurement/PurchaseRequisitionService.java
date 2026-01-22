package com.rasras.erp.procurement;

import com.rasras.erp.employee.DepartmentRepository;
import com.rasras.erp.inventory.ItemRepository;
import com.rasras.erp.inventory.UnitRepository;
import com.rasras.erp.user.User;
import com.rasras.erp.user.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseRequisitionService {

    private final PurchaseRequisitionRepository prRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final UnitRepository unitRepository;

    @Transactional(readOnly = true)
    public List<PurchaseRequisitionDto> getAllPurchaseRequisitions() {
        return prRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PurchaseRequisitionDto getPurchaseRequisitionById(Integer id) {
        return prRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException("Purchase Requisition not found"));
    }

    @Transactional
    public PurchaseRequisitionDto createPurchaseRequisition(PurchaseRequisitionDto dto) {
        PurchaseRequisition pr = new PurchaseRequisition();
        pr.setPrNumber(generatePrNumber());
        pr.setPrDate(LocalDateTime.now());
        pr.setRequestedByDept(departmentRepository.findById(dto.getRequestedByDeptId())
                .orElseThrow(() -> new RuntimeException("Department not found")));
        pr.setRequestedByUser(userRepository.findById(dto.getRequestedByUserId())
                .orElseThrow(() -> new RuntimeException("User not found")));

        updatePrFromDto(pr, dto);
        pr.setCreatedBy(dto.getCreatedBy() != null ? dto.getCreatedBy() : 1); // Default to admin if null, should be
                                                                              // from context
        pr.setStatus("Draft");

        PurchaseRequisition savedPr = prRepository.save(pr);

        // Handle Items
        if (dto.getItems() != null && !dto.getItems().isEmpty()) {
            final PurchaseRequisition finalSavedPr = savedPr;
            List<PurchaseRequisitionItem> items = dto.getItems().stream()
                    .map(itemDto -> mapItemToEntity(itemDto, finalSavedPr))
                    .collect(Collectors.toList());
            savedPr.setItems(items);
            savedPr = prRepository.save(savedPr);
        }

        return mapToDto(savedPr);
    }

    @Transactional
    public PurchaseRequisitionDto updatePurchaseRequisition(Integer id, PurchaseRequisitionDto dto) {
        PurchaseRequisition pr = prRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("PR not found"));

        if (!"Draft".equals(pr.getStatus())) {
            throw new RuntimeException("Cannot edit PR that is not in Draft status");
        }

        updatePrFromDto(pr, dto);

        // Update Items relationship - clear and recreate for simplicity in this MVP
        if (pr.getItems() != null) {
            pr.getItems().clear();
        } else {
            pr.setItems(new ArrayList<>());
        }

        if (dto.getItems() != null) {
            final PurchaseRequisition finalPr = pr;
            List<PurchaseRequisitionItem> newItems = dto.getItems().stream()
                    .map(itemDto -> mapItemToEntity(itemDto, finalPr))
                    .collect(Collectors.toList());
            pr.getItems().addAll(newItems);
        }

        return mapToDto(prRepository.save(pr));
    }

    private void updatePrFromDto(PurchaseRequisition pr, PurchaseRequisitionDto dto) {
        pr.setRequiredDate(dto.getRequiredDate());
        pr.setPriority(dto.getPriority());
        pr.setTotalEstimatedAmount(dto.getTotalEstimatedAmount());
        pr.setJustification(dto.getJustification());
        pr.setNotes(dto.getNotes());
    }

    private String generatePrNumber() {
        // Simple generation: PR-YYYYMMDD-XXXX
        return "PR-" + System.currentTimeMillis(); // Placeholder for better logic
    }

    private PurchaseRequisitionDto mapToDto(PurchaseRequisition pr) {
        return PurchaseRequisitionDto.builder()
                .id(pr.getId())
                .prNumber(pr.getPrNumber())
                .prDate(pr.getPrDate())
                .requestedByDeptId(pr.getRequestedByDept().getDepartmentId())
                .requestedByDeptName(pr.getRequestedByDept().getDepartmentNameAr())
                .requestedByUserId(pr.getRequestedByUser().getUserId())
                .requestedByUserName(pr.getRequestedByUser().getUsername())
                .requiredDate(pr.getRequiredDate())
                .priority(pr.getPriority())
                .status(pr.getStatus())
                .totalEstimatedAmount(pr.getTotalEstimatedAmount())
                .justification(pr.getJustification())
                .notes(pr.getNotes())
                .createdAt(pr.getCreatedAt())
                .createdBy(pr.getCreatedBy())
                .items(pr.getItems() != null
                        ? pr.getItems().stream().map(this::mapItemToDto).collect(Collectors.toList())
                        : new ArrayList<>())
                .build();
    }

    private PurchaseRequisitionItemDto mapItemToDto(PurchaseRequisitionItem item) {
        return PurchaseRequisitionItemDto.builder()
                .id(item.getId())
                .prId(item.getPurchaseRequisition().getId())
                .itemId(item.getItem().getId())
                .itemNameAr(item.getItem().getItemNameAr())
                .itemNameEn(item.getItem().getItemNameEn())
                .itemCode(item.getItem().getItemCode())
                .requestedQty(item.getRequestedQty())
                .unitId(item.getUnit().getId())
                .unitName(item.getUnit().getUnitNameAr())
                .estimatedUnitPrice(item.getEstimatedUnitPrice())
                .estimatedTotalPrice(item.getEstimatedTotalPrice())
                .requiredDate(item.getRequiredDate())
                .specifications(item.getSpecifications())
                .notes(item.getNotes())
                .build();
    }

    private PurchaseRequisitionItem mapItemToEntity(PurchaseRequisitionItemDto dto, PurchaseRequisition pr) {
        return PurchaseRequisitionItem.builder()
                .purchaseRequisition(pr)
                .item(itemRepository.findById(dto.getItemId())
                        .orElseThrow(() -> new RuntimeException("Item not found")))
                .requestedQty(dto.getRequestedQty())
                .unit(unitRepository.findById(dto.getUnitId())
                        .orElseThrow(() -> new RuntimeException("Unit not found")))
                .estimatedUnitPrice(dto.getEstimatedUnitPrice())
                .estimatedTotalPrice(dto.getEstimatedTotalPrice())
                .requiredDate(dto.getRequiredDate())
                .specifications(dto.getSpecifications())
                .notes(dto.getNotes())
                .build();
    }
}
