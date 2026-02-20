package com.rasras.erp.inventory;

import com.rasras.erp.procurement.PurchaseOrder;
import com.rasras.erp.procurement.PurchaseOrderItem;
import com.rasras.erp.procurement.PurchaseOrderRepository;
import com.rasras.erp.shared.exception.BadRequestException;
import com.rasras.erp.shared.exception.ResourceNotFoundException;
import com.rasras.erp.supplier.Supplier;
import com.rasras.erp.supplier.SupplierRepository;
import com.rasras.erp.supplier.SupplierInvoiceRepository;
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
    private final SupplierInvoiceRepository supplierInvoiceRepo;

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

    /**
     * توريدات مكتملة ولم تُفوتر بعد — للاستخدام من صفحة فواتير الموردين (قسم المالية).
     * محمي بصلاحية فواتير الموردين (SECTION_FINANCE أو غيره حسب SUPPLIER_INVOICES).
     */
    @Transactional(readOnly = true)
    public List<GoodsReceiptNoteDto> getCompletedGRNsNotInvoiced() {
        return grnRepo.findByStatusWithItems("Completed").stream()
                .filter(grn -> !supplierInvoiceRepo.existsByGrnId(grn.getId()))
                .map(this::mapToDto)
                .collect(Collectors.toList());
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
                .shippingCost(dto.getShippingCost())
                .otherCosts(dto.getOtherCosts())
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

            BigDecimal subTotal = grn.getItems().stream()
                    .map(item -> item.getTotalCost() != null ? item.getTotalCost() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            grn.setTotalAmount(subTotal.add(grn.getShippingCost() != null ? grn.getShippingCost() : BigDecimal.ZERO)
                    .add(grn.getOtherCosts() != null ? grn.getOtherCosts() : BigDecimal.ZERO));
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
        grn.setShippingCost(dto.getShippingCost());
        grn.setOtherCosts(dto.getOtherCosts());
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

            BigDecimal subTotal = grn.getItems().stream()
                    .map(item -> item.getTotalCost() != null ? item.getTotalCost() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            grn.setTotalAmount(subTotal.add(grn.getShippingCost() != null ? grn.getShippingCost() : BigDecimal.ZERO)
                    .add(grn.getOtherCosts() != null ? grn.getOtherCosts() : BigDecimal.ZERO));
        }

        return mapToDto(grnRepo.save(grn));
    }

    @Transactional
    public GoodsReceiptNoteDto finalizeStoreIn(Integer grnId, Integer userId) {
        GoodsReceiptNote grn = grnRepo.findByIdWithItems(grnId)
                .orElseThrow(() -> new RuntimeException("GRN not found"));

        // الإضافة للمخزن تكون فقط لاعتماد فحص الجودة: تم الفحص (Inspected) أو إذن معتمد
        // (Approved)
        if ("Completed".equals(grn.getStatus())) {
            throw new RuntimeException("GRN already added to warehouse");
        }
        boolean qcApproved = "Inspected".equals(grn.getStatus()) || "Approved".equals(grn.getStatus());
        if (!qcApproved) {
            throw new RuntimeException("GRN must have approved quality inspection before store-in");
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
            throw new RuntimeException(
                    "GRN must be inspected by Quality before submission for approval. Current status: "
                            + grn.getStatus());
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
                saved.getGrnNumber(), userId, saved.getTotalAmount());

        return mapToDto(saved);
    }

    @Transactional
    public void deleteGRN(Integer id) {
        GoodsReceiptNote grn = grnRepo.findByIdWithItems(id)
                .orElseThrow(() -> new ResourceNotFoundException("إذن الإضافة غير موجود"));
        if ("Completed".equals(grn.getStatus())) {
            throw new BadRequestException("لا يمكن حذف إذن إضافة تمت إضافته للمخزن. يمكن إصدار مرتجع شراء إذا لزم.");
        }
        PurchaseOrder po = grn.getPurchaseOrder();
        if (grn.getItems() != null && !grn.getItems().isEmpty()) {
            for (GRNItem grnItem : grn.getItems()) {
                PurchaseOrderItem poItem = po.getItems().stream()
                        .filter(pi -> pi.getId().equals(grnItem.getPoItemId()))
                        .findFirst()
                        .orElse(null);
                if (poItem != null) {
                    BigDecimal reverted = poItem.getReceivedQty().subtract(grnItem.getReceivedQty());
                    poItem.setReceivedQty(reverted.max(BigDecimal.ZERO));
                    poItem.setStatus(reverted.compareTo(BigDecimal.ZERO) <= 0 ? "Open" : "PartiallyReceived");
                }
            }
            boolean allOpen = po.getItems().stream().allMatch(pi -> "Open".equals(pi.getStatus()));
            po.setStatus(allOpen ? "Approved" : "PartiallyReceived");
            poRepo.save(po);
        }
        grnRepo.delete(grn);
    }

    /**
     * Recalculate GRN amounts after quality control inspection
     * Uses acceptedQty instead of receivedQty and recalculates tax/discount
     * while keeping shipping and other costs unchanged
     */
    @Transactional
    public void recalculateGRNAmountsAfterQC(Integer grnId) {
        GoodsReceiptNote grn = grnRepo.findByIdWithItems(grnId)
                .orElseThrow(() -> new RuntimeException("GRN not found: " + grnId));

        // Get Purchase Order to access discount and tax percentages
        PurchaseOrder po = grn.getPurchaseOrder();
        if (po == null) {
            throw new RuntimeException("GRN has no associated Purchase Order");
        }

        // Create a map of PO items by ID for quick lookup
        java.util.Map<Integer, PurchaseOrderItem> poItemsMap = po.getItems().stream()
                .collect(java.util.stream.Collectors.toMap(PurchaseOrderItem::getId, item -> item));

        BigDecimal subTotal = BigDecimal.ZERO;

        // Recalculate each GRN item using acceptedQty
        for (GRNItem grnItem : grn.getItems()) {
            PurchaseOrderItem poItem = poItemsMap.get(grnItem.getPoItemId());
            if (poItem == null) {
                throw new RuntimeException("PO Item not found for GRN Item: " + grnItem.getId());
            }

            // Use acceptedQty if set, otherwise fallback to receivedQty
            BigDecimal qty = grnItem.getAcceptedQty() != null ? grnItem.getAcceptedQty() : grnItem.getReceivedQty();
            if (qty == null || qty.compareTo(BigDecimal.ZERO) <= 0) {
                // If no quantity, set totalCost to zero
                grnItem.setTotalCost(BigDecimal.ZERO);
                continue;
            }

            // Get pricing info from PO item
            BigDecimal unitPrice = poItem.getUnitPrice() != null ? poItem.getUnitPrice()
                    : (grnItem.getUnitCost() != null ? grnItem.getUnitCost() : BigDecimal.ZERO);
            BigDecimal discountPercentage = poItem.getDiscountPercentage() != null
                    ? poItem.getDiscountPercentage()
                    : BigDecimal.ZERO;
            BigDecimal taxPercentage = poItem.getTaxPercentage() != null
                    ? poItem.getTaxPercentage()
                    : BigDecimal.ZERO;

            // Calculate: Gross -> Discount -> Tax on Taxable Amount
            BigDecimal grossAmount = qty.multiply(unitPrice);
            BigDecimal discountAmount = grossAmount.multiply(discountPercentage)
                    .divide(new BigDecimal("100"), 4, java.math.RoundingMode.HALF_UP);
            BigDecimal taxableAmount = grossAmount.subtract(discountAmount);
            BigDecimal taxAmount = taxableAmount.multiply(taxPercentage)
                    .divide(new BigDecimal("100"), 4, java.math.RoundingMode.HALF_UP);
            BigDecimal totalCost = taxableAmount.add(taxAmount);

            // Update GRN Item total cost
            grnItem.setTotalCost(totalCost.setScale(2, java.math.RoundingMode.HALF_UP));

            // Accumulate subtotal
            subTotal = subTotal.add(totalCost);
        }

        // Recalculate GRN total: subtotal + shipping + other costs
        // Note: shipping and other costs remain unchanged
        BigDecimal shippingCost = grn.getShippingCost() != null ? grn.getShippingCost() : BigDecimal.ZERO;
        BigDecimal otherCosts = grn.getOtherCosts() != null ? grn.getOtherCosts() : BigDecimal.ZERO;
        BigDecimal totalAmount = subTotal.add(shippingCost).add(otherCosts);

        grn.setTotalAmount(totalAmount.setScale(2, java.math.RoundingMode.HALF_UP));

        // Save updated GRN
        grnRepo.save(grn);
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
            BigDecimal qtyToRecord = item.getAcceptedQty() != null ? item.getAcceptedQty() : item.getReceivedQty();
            if (qtyToRecord.compareTo(BigDecimal.ZERO) > 0) {
                inventoryService.updateStock(
                        item.getItem().getId(),
                        grn.getWarehouseId(),
                        qtyToRecord,
                        "IN",
                        "GRN",
                        "GoodsReceiptNote",
                        grn.getId(),
                        grn.getGrnNumber(),
                        item.getUnitCost(),
                        grn.getCreatedBy());
            }
        }
    }

    private String generateGRNNumber() {
        long count = grnRepo.count() + 1;
        return "#GRN-" + count;
    }

    private GRNItem mapToItemEntity(GoodsReceiptNote grn, GRNItemDto dto) {
        return GRNItem.builder()
                .grn(grn)
                .poItemId(dto.getPoItemId())
                .item(itemRepo.findById(dto.getItemId()).orElseThrow())
                .unit(unitRepo.findById(dto.getUnitId()).orElseThrow())
                .orderedQty(dto.getOrderedQty())
                .receivedQty(dto.getReceivedQty())
                .acceptedQty(dto.getAcceptedQty() != null ? dto.getAcceptedQty() : dto.getReceivedQty())
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
                .qualityStatus(entity.getQualityStatus())
                .totalReceivedQty(entity.getTotalReceivedQty())
                .shippingCost(entity.getShippingCost())
                .otherCosts(entity.getOtherCosts())
                .totalAmount(entity.getTotalAmount())
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
                .rejectedQty(item.getRejectedQty())
                .unitId(item.getUnit().getId())
                .unitNameAr(item.getUnit().getUnitNameAr())
                .unitCost(item.getUnitCost())
                .totalCost(item.getTotalCost())
                .lotNumber(item.getLotNumber())
                .qualityStatus(item.getQualityStatus())
                .build();
    }
}
