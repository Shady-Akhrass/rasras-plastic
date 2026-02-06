package com.rasras.erp.inventory;

import com.rasras.erp.procurement.PurchaseOrder;
import com.rasras.erp.procurement.PurchaseOrderItem;
import com.rasras.erp.procurement.PurchaseOrderRepository;
import com.rasras.erp.supplier.Supplier;
import com.rasras.erp.supplier.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GRNService {

    private final GoodsReceiptNoteRepository grnRepo;
    private final PurchaseOrderRepository poRepo;
    private final SupplierRepository supplierRepo;
    private final ItemRepository itemRepo;
    private final UnitRepository unitRepo;
    private final InventoryService inventoryService;
    private final com.rasras.erp.approval.ApprovalService approvalService;

    @Transactional(readOnly = true)
    public List<GoodsReceiptNoteDto> getAllGRNs() {
        return grnRepo.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GoodsReceiptNoteDto getGRNById(Integer id) {
        GoodsReceiptNote grn = grnRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("GRN not found"));
        return mapToDto(grn);
    }

    @Transactional
    public GoodsReceiptNoteDto createGRN(GoodsReceiptNoteDto dto) {
        PurchaseOrder po = poRepo.findById(dto.getPoId())
                .orElseThrow(() -> new RuntimeException("Purchase Order not found"));

        Supplier supplier = supplierRepo.findById(dto.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        GoodsReceiptNote grn = GoodsReceiptNote.builder()
                .grnNumber(generateGRNNumber())
                .grnDate(dto.getGrnDate() != null ? dto.getGrnDate() : LocalDateTime.now())
                .purchaseOrder(po)
                .supplier(supplier)
                .warehouseId(dto.getWarehouseId())
                .deliveryNoteNo(dto.getDeliveryNoteNo())
                .supplierInvoiceNo(dto.getSupplierInvoiceNo())
                .receivedByUserId(dto.getReceivedByUserId())
                .inspectedByUserId(dto.getInspectedByUserId())
                .status("Pending Inspection") // Step 7: Initial Receipt
                .qualityStatus("Pending")
                .notes(dto.getNotes())
                .createdBy(dto.getReceivedByUserId())
                .build();

        if (dto.getItems() != null) {
            grn.setItems(dto.getItems().stream()
                    .map(itemDto -> mapToItemEntity(grn, itemDto))
                    .collect(Collectors.toList()));

            // Update PO and calculating totals
            updatePOQuantities(po, grn.getItems());

            // DO NOT update inventory yet (Step 7 only)
            // updateInventory(grn);

            grn.setTotalReceivedQty(grn.getItems().stream()
                    .map(GRNItem::getReceivedQty)
                    .reduce(BigDecimal.ZERO, BigDecimal::add));
        }

        return mapToDto(grnRepo.save(grn));
    }

    @Transactional
    public GoodsReceiptNoteDto updateGRN(Integer id, GoodsReceiptNoteDto dto) {
        GoodsReceiptNote grn = grnRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("GRN not found"));

        if (!"Draft".equals(grn.getStatus()) && !"Pending Inspection".equals(grn.getStatus())) {
            throw new RuntimeException("Only draft or pending inspection GRN can be updated");
        }

        PurchaseOrder po = grn.getPurchaseOrder();

        // Revert PO quantities for current GRN items before replacing
        if (grn.getItems() != null) {
            for (GRNItem oldItem : grn.getItems()) {
                PurchaseOrderItem poItem = po.getItems().stream()
                        .filter(pi -> pi.getId().equals(oldItem.getPoItemId()))
                        .findFirst()
                        .orElse(null);
                if (poItem != null) {
                    BigDecimal reverted = poItem.getReceivedQty().subtract(oldItem.getReceivedQty());
                    poItem.setReceivedQty(reverted.max(BigDecimal.ZERO));
                    poItem.setStatus(reverted.compareTo(BigDecimal.ZERO) <= 0 ? "Open" : "PartiallyReceived");
                }
            }
        }

        grn.setDeliveryNoteNo(dto.getDeliveryNoteNo());
        grn.setSupplierInvoiceNo(dto.getSupplierInvoiceNo());
        grn.setNotes(dto.getNotes());

        if (dto.getItems() != null) {
            grn.getItems().clear();
            grn.setItems(dto.getItems().stream()
                    .map(itemDto -> mapToItemEntity(grn, itemDto))
                    .collect(Collectors.toList()));
            updatePOQuantities(po, grn.getItems());
            grn.setTotalReceivedQty(grn.getItems().stream()
                    .map(GRNItem::getReceivedQty)
                    .reduce(BigDecimal.ZERO, BigDecimal::add));
        }

        return mapToDto(grnRepo.save(grn));
    }

    @Transactional
    public GoodsReceiptNoteDto finalizeStoreIn(Integer grnId, Integer userId) {
        GoodsReceiptNote grn = grnRepo.findById(grnId)
                .orElseThrow(() -> new RuntimeException("GRN not found"));

        if (!"Inspected".equals(grn.getStatus()) && !"Approved".equals(grn.getStatus())) {
            throw new RuntimeException("GRN must be inspected and approved before store-in");
        }

        if (!"Approved".equals(grn.getApprovalStatus())) {
            throw new RuntimeException("GRN must be approved before store-in");
        }

        // Step 9: Addition Note -> Update Inventory
        updateInventory(grn);

        grn.setStatus("Completed"); // Final state
        grn.setUpdatedBy(userId);
        grn.setUpdatedAt(LocalDateTime.now());

        return mapToDto(grnRepo.save(grn));
    }

    @Transactional
    public GoodsReceiptNoteDto submitGRN(Integer id, Integer userId) {
        GoodsReceiptNote grn = grnRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("GRN not found"));

        if (!"Inspected".equals(grn.getStatus())) {
            throw new RuntimeException("GRN must be inspected by Quality before submission for approval. Current status: " + grn.getStatus());
        }

        // Policy: No material may enter warehouse without quality report
        if (grn.getItems() == null || grn.getItems().isEmpty()) {
            throw new RuntimeException("GRN has no items to submit");
        }
        boolean allItemsInspected = grn.getItems().stream()
                .allMatch(item -> item.getQualityStatus() != null && !item.getQualityStatus().isBlank());
        if (!allItemsInspected) {
            throw new RuntimeException("All GRN items must have quality inspection results before submission");
        }

        grn.setStatus("Pending Approval");
        grn.setApprovalStatus("Pending");
        GoodsReceiptNote saved = grnRepo.save(grn);

        // Initiate approval workflow
        approvalService.initiateApproval("GRN_APPROVAL", "GoodsReceiptNote", saved.getId(),
                saved.getGrnNumber(), userId, saved.getTotalReceivedQty());

        return mapToDto(saved);
    }

    private void updatePOQuantities(PurchaseOrder po, List<GRNItem> grnItems) {
        for (GRNItem grnItem : grnItems) {
            PurchaseOrderItem poItem = po.getItems().stream()
                    .filter(pi -> pi.getId().equals(grnItem.getPoItemId()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("PO Item not found for ID: " + grnItem.getPoItemId()));

            BigDecimal newReceivedQty = poItem.getReceivedQty().add(grnItem.getReceivedQty());
            poItem.setReceivedQty(newReceivedQty);

            if (newReceivedQty.compareTo(poItem.getOrderedQty()) >= 0) {
                poItem.setStatus("Received");
            } else {
                poItem.setStatus("PartiallyReceived");
            }
        }

        // Update PO Status if all items are fully received
        boolean allReceived = po.getItems().stream()
                .allMatch(pi -> "Received".equals(pi.getStatus()));
        if (allReceived) {
            po.setStatus("Closed");
        } else {
            po.setStatus("PartiallyReceived");
        }
        poRepo.save(po);
    }

    private void updateInventory(GoodsReceiptNote grn) {
        for (GRNItem item : grn.getItems()) {
            inventoryService.updateStock(
                    item.getItem().getId(),
                    grn.getWarehouseId(),
                    item.getReceivedQty(),
                    "IN",
                    "GRN",
                    "GoodsReceiptNote",
                    grn.getId(),
                    grn.getGrnNumber(),
                    item.getUnitCost(),
                    grn.getCreatedBy());
        }
    }

    private String generateGRNNumber() {
        long count = grnRepo.count() + 1;
        LocalDateTime now = LocalDateTime.now();
        return String.format("GRN-%d%02d-%03d", now.getYear(), now.getMonthValue(), count);
    }

    private GRNItem mapToItemEntity(GoodsReceiptNote grn, GRNItemDto dto) {
        return GRNItem.builder()
                .grn(grn)
                .poItemId(dto.getPoItemId())
                .item(itemRepo.findById(dto.getItemId()).orElseThrow())
                .unit(unitRepo.findById(dto.getUnitId()).orElseThrow())
                .orderedQty(dto.getOrderedQty())
                .receivedQty(dto.getReceivedQty())
                .acceptedQty(dto.getAcceptedQty())
                .unitCost(dto.getUnitCost())
                .totalCost(dto.getTotalCost())
                .lotNumber(dto.getLotNumber())
                .manufactureDate(dto.getManufactureDate())
                .expiryDate(dto.getExpiryDate())
                .notes(dto.getNotes())
                .build();
    }

    private GoodsReceiptNoteDto mapToDto(GoodsReceiptNote entity) {
        return GoodsReceiptNoteDto.builder()
                .id(entity.getId())
                .grnNumber(entity.getGrnNumber())
                .grnDate(entity.getGrnDate())
                .poId(entity.getPurchaseOrder().getId())
                .poNumber(entity.getPurchaseOrder().getPoNumber())
                .supplierId(entity.getSupplier().getId())
                .supplierNameAr(entity.getSupplier().getSupplierNameAr())
                .warehouseId(entity.getWarehouseId())
                .deliveryNoteNo(entity.getDeliveryNoteNo())
                .supplierInvoiceNo(entity.getSupplierInvoiceNo())
                .receivedByUserId(entity.getReceivedByUserId())
                .status(entity.getStatus())
                .approvalStatus(entity.getApprovalStatus())
                .notes(entity.getNotes())
                .items(entity.getItems() != null ? entity.getItems().stream()
                        .map(this::mapToItemDto)
                        .collect(Collectors.toList()) : null)
                .build();
    }

    private GRNItemDto mapToItemDto(GRNItem item) {
        return GRNItemDto.builder()
                .id(item.getId())
                .poItemId(item.getPoItemId())
                .itemId(item.getItem().getId())
                .itemNameAr(item.getItem().getItemNameAr())
                .orderedQty(item.getOrderedQty())
                .receivedQty(item.getReceivedQty())
                .acceptedQty(item.getAcceptedQty())
                .unitId(item.getUnit().getId())
                .unitNameAr(item.getUnit().getUnitNameAr())
                .unitCost(item.getUnitCost())
                .totalCost(item.getTotalCost())
                .lotNumber(item.getLotNumber())
                .build();
    }
}
