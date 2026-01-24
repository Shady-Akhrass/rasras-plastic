package com.rasras.erp.procurement;

import com.rasras.erp.inventory.ItemRepository;
import com.rasras.erp.inventory.UnitRepository;
import com.rasras.erp.inventory.WarehouseRepository;
import com.rasras.erp.procurement.dto.PurchaseReturnDto;
import com.rasras.erp.procurement.dto.PurchaseReturnItemDto;
import com.rasras.erp.supplier.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseReturnService {

    private final PurchaseReturnRepository returnRepo;
    private final SupplierRepository supplierRepo;
    private final WarehouseRepository warehouseRepo;
    private final ItemRepository itemRepo;
    private final UnitRepository unitRepo;
    private final com.rasras.erp.inventory.InventoryService inventoryService;

    @Transactional(readOnly = true)
    public List<PurchaseReturnDto> getAllReturns() {
        return returnRepo.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PurchaseReturnDto getReturnById(Integer id) {
        PurchaseReturn entity = returnRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Return not found"));
        return mapToDto(entity);
    }

    @Transactional
    public PurchaseReturnDto createReturn(PurchaseReturnDto dto) {
        PurchaseReturn entity = PurchaseReturn.builder()
                .returnNumber(dto.getReturnNumber())
                .returnDate(dto.getReturnDate())
                .grnId(dto.getGrnId())
                .supplierInvoiceId(dto.getSupplierInvoiceId())
                .supplier(supplierRepo.findById(dto.getSupplierId()).orElseThrow())
                .warehouse(warehouseRepo.findById(dto.getWarehouseId()).orElseThrow())
                .returnReason(dto.getReturnReason())
                .subTotal(dto.getSubTotal())
                .taxAmount(dto.getTaxAmount())
                .totalAmount(dto.getTotalAmount())
                .status("Draft")
                .preparedByUserId(1) // Placeholder
                .build();

        if (dto.getItems() != null) {
            entity.setItems(dto.getItems().stream()
                    .map(itemDto -> mapToItemEntity(entity, itemDto))
                    .collect(Collectors.toList()));
        }

        return mapToDto(returnRepo.save(entity));
    }

    @Transactional
    public PurchaseReturnDto approveReturn(Integer id, Integer userId) {
        PurchaseReturn entity = returnRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Return not found"));

        if (!"Draft".equals(entity.getStatus()) && !"Pending".equals(entity.getStatus())) {
            throw new RuntimeException("Return cannot be approved in current status: " + entity.getStatus());
        }

        entity.setStatus("Approved");
        entity.setApprovedByUserId(userId);
        entity.setApprovedDate(java.time.LocalDateTime.now());

        // Update Stock (Decrement)
        for (PurchaseReturnItem item : entity.getItems()) {
            inventoryService.updateStock(
                    item.getItem().getId(),
                    entity.getWarehouse().getId(),
                    item.getReturnedQty(),
                    "OUT",
                    "RETURN",
                    "PurchaseReturn",
                    entity.getId(),
                    entity.getReturnNumber(),
                    item.getUnitPrice(),
                    userId);
        }

        return mapToDto(returnRepo.save(entity));
    }

    private PurchaseReturnItem mapToItemEntity(PurchaseReturn parent, PurchaseReturnItemDto dto) {
        return PurchaseReturnItem.builder()
                .purchaseReturn(parent)
                .item(itemRepo.findById(dto.getItemId()).orElseThrow())
                .unit(unitRepo.findById(dto.getUnitId()).orElseThrow())
                .grnItemId(dto.getGrnItemId())
                .returnedQty(dto.getReturnedQty())
                .unitPrice(dto.getUnitPrice())
                .taxPercentage(dto.getTaxPercentage())
                .taxAmount(dto.getTaxAmount())
                .totalPrice(dto.getTotalPrice())
                .returnReason(dto.getReturnReason())
                .lotNumber(dto.getLotNumber())
                .build();
    }

    private PurchaseReturnDto mapToDto(PurchaseReturn entity) {
        return PurchaseReturnDto.builder()
                .id(entity.getId())
                .returnNumber(entity.getReturnNumber())
                .returnDate(entity.getReturnDate())
                .grnId(entity.getGrnId())
                .supplierInvoiceId(entity.getSupplierInvoiceId())
                .supplierId(entity.getSupplier().getId())
                .supplierNameAr(entity.getSupplier().getSupplierNameAr())
                .warehouseId(entity.getWarehouse().getId())
                .warehouseNameAr(entity.getWarehouse().getWarehouseNameAr())
                .returnReason(entity.getReturnReason())
                .subTotal(entity.getSubTotal())
                .taxAmount(entity.getTaxAmount())
                .totalAmount(entity.getTotalAmount())
                .status(entity.getStatus())
                .items(entity.getItems() != null ? entity.getItems().stream()
                        .map(this::mapItemToDto)
                        .collect(Collectors.toList()) : null)
                .build();
    }

    private PurchaseReturnItemDto mapItemToDto(PurchaseReturnItem item) {
        return PurchaseReturnItemDto.builder()
                .id(item.getId())
                .itemId(item.getItem().getId())
                .itemNameAr(item.getItem().getItemNameAr())
                .grnItemId(item.getGrnItemId())
                .returnedQty(item.getReturnedQty())
                .unitId(item.getUnit().getId())
                .unitNameAr(item.getUnit().getUnitNameAr())
                .unitPrice(item.getUnitPrice())
                .taxPercentage(item.getTaxPercentage())
                .taxAmount(item.getTaxAmount())
                .totalPrice(item.getTotalPrice())
                .returnReason(item.getReturnReason())
                .lotNumber(item.getLotNumber())
                .build();
    }
}
