package com.rasras.erp.procurement;

import com.rasras.erp.inventory.ItemRepository;
import com.rasras.erp.inventory.UnitRepository;
import com.rasras.erp.inventory.WarehouseRepository;
import com.rasras.erp.inventory.GRNService;
import com.rasras.erp.inventory.GoodsReceiptNoteDto;
import com.rasras.erp.inventory.GRNItemDto;
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
public class PurchaseOrderService {

        private final PurchaseOrderRepository poRepo;
        private final SupplierRepository supplierRepo;
        private final ItemRepository itemRepo;
        private final UnitRepository unitRepo;
        private final WarehouseRepository warehouseRepo;
        private final GRNService grnService;
        private final com.rasras.erp.approval.ApprovalService approvalService;

        @Transactional(readOnly = true)
        public List<PurchaseOrderDto> getAllPOs() {
                return poRepo.findAll().stream()
                                .map(this::mapToDto)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public List<PurchaseOrderDto> getWaitingForArrivalPOs() {
                return poRepo.findAll().stream()
                                .filter(po -> "Approved".equals(po.getApprovalStatus()) 
                                        && ("Confirmed".equals(po.getStatus()) || "Approved".equals(po.getStatus()))
                                        && !"PartiallyReceived".equals(po.getStatus())
                                        && !"Received".equals(po.getStatus())
                                        && !"Closed".equals(po.getStatus()))
                                .map(this::mapToDto)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public PurchaseOrderDto getPOById(Integer id) {
                PurchaseOrder po = poRepo.findById(id)
                                .orElseThrow(() -> new RuntimeException("Purchase Order not found"));
                return mapToDto(po);
        }

        @Transactional
        public PurchaseOrderDto createPO(PurchaseOrderDto dto) {
                Supplier supplier = supplierRepo.findById(dto.getSupplierId())
                                .orElseThrow(() -> new RuntimeException("Supplier not found"));

                PurchaseOrder po = PurchaseOrder.builder()
                                .poNumber(generatePONumber())
                                .poDate(LocalDateTime.now())
                                .prId(dto.getPrId())
                                .quotationId(dto.getQuotationId())
                                .supplier(supplier)
                                .expectedDeliveryDate(dto.getExpectedDeliveryDate())
                                .deliveryDays(dto.getDeliveryDays())
                                .shippingMethod(dto.getShippingMethod())
                                .shippingTerms(dto.getShippingTerms())
                                .paymentTerms(dto.getPaymentTerms())
                                .paymentTermDays(dto.getPaymentTermDays())
                                .currency(dto.getCurrency() != null ? dto.getCurrency() : "EGP")
                                .exchangeRate(dto.getExchangeRate() != null ? dto.getExchangeRate() : BigDecimal.ONE)
                                .subTotal(dto.getSubTotal())
                                .discountPercentage(dto.getDiscountPercentage())
                                .discountAmount(dto.getDiscountAmount())
                                .taxAmount(dto.getTaxAmount())
                                .shippingCost(dto.getShippingCost())
                                .otherCosts(dto.getOtherCosts())
                                .totalAmount(dto.getTotalAmount())
                                .status("Draft")
                                .approvalStatus("Pending")
                                .notes(dto.getNotes())
                                .termsAndConditions(dto.getTermsAndConditions())
                                .build();

                if (dto.getItems() != null) {
                        po.setItems(dto.getItems().stream()
                                        .map(itemDto -> mapToItemEntity(po, itemDto))
                                        .collect(Collectors.toList()));
                }

                PurchaseOrder savedPo = poRepo.save(po);
                return mapToDto(savedPo);
        }

        @Transactional
        public PurchaseOrderDto submitPO(Integer id) {
                PurchaseOrder po = poRepo.findById(id)
                                .orElseThrow(() -> new RuntimeException("PO not found"));

                if (!"Draft".equals(po.getStatus())) {
                        throw new RuntimeException("PO must be in Draft status to submit");
                }

                po.setStatus("Pending");
                PurchaseOrder saved = poRepo.save(po);

                // Initiate approval workflow
                approvalService.initiateApproval("PO_APPROVAL", "PurchaseOrder", saved.getId(),
                                saved.getPoNumber(), 1, saved.getTotalAmount()); // Assuming admin for now

                return mapToDto(saved);
        }

        @Transactional
        public GoodsReceiptNoteDto markAsArrived(Integer poId, Integer userId) {
                PurchaseOrder po = poRepo.findById(poId)
                                .orElseThrow(() -> new RuntimeException("Purchase Order not found"));

                // Verify PO is in waiting status
                if (!"Approved".equals(po.getApprovalStatus()) || 
                    (!"Confirmed".equals(po.getStatus()) && !"Approved".equals(po.getStatus()))) {
                        throw new RuntimeException("Purchase Order is not in approved/confirmed status");
                }

                // Get first active warehouse
                Integer warehouseId = warehouseRepo.findByIsActiveTrue().stream()
                                .findFirst()
                                .map(warehouse -> warehouse.getId())
                                .orElseThrow(() -> new RuntimeException(
                                                "No active warehouses available. Please create a warehouse first."));

                // Create GRN DTO with all PO items
                GoodsReceiptNoteDto grnDto = GoodsReceiptNoteDto.builder()
                                .poId(poId)
                                .supplierId(po.getSupplier().getId())
                                .warehouseId(warehouseId)
                                .receivedByUserId(userId != null ? userId : 1)
                                .status("Pending Inspection")
                                .approvalStatus("Pending")
                                .qualityStatus("Pending")
                                .notes("تم إنشاء تلقائياً عند وصول الشحنة من أمر الشراء: " + po.getPoNumber())
                                .items(po.getItems() != null ? po.getItems().stream()
                                                .map(poItem -> GRNItemDto.builder()
                                                                .poItemId(poItem.getId())
                                                                .itemId(poItem.getItem().getId())
                                                                .itemNameAr(poItem.getItem().getItemNameAr())
                                                                .orderedQty(poItem.getOrderedQty())
                                                                .receivedQty(poItem.getOrderedQty()) // Full quantity received
                                                                .acceptedQty(poItem.getOrderedQty()) // Initially all accepted
                                                                .unitId(poItem.getUnit().getId())
                                                                .unitNameAr(poItem.getUnit().getUnitNameAr())
                                                                .unitCost(poItem.getUnitPrice())
                                                                .totalCost(poItem.getTotalPrice())
                                                                .build())
                                                .collect(Collectors.toList()) : null)
                                .build();

                // Create GRN using GRNService
                GoodsReceiptNoteDto createdGRN = grnService.createGRN(grnDto);

                // Update PO status to PartiallyReceived (will be updated to Closed when all items received)
                po.setStatus("PartiallyReceived");
                poRepo.save(po);

                return createdGRN;
        }

        @Transactional
        public void deletePO(Integer id) {
                PurchaseOrder po = poRepo.findById(id)
                                .orElseThrow(() -> new RuntimeException("Purchase Order not found"));
                poRepo.delete(po);
        }

        private String generatePONumber() {
                long count = poRepo.count() + 1;
                return "#PO-" + count;
        }

        private PurchaseOrderItem mapToItemEntity(PurchaseOrder po, PurchaseOrderItemDto dto) {
                return PurchaseOrderItem.builder()
                                .purchaseOrder(po)
                                .item(itemRepo.findById(dto.getItemId()).orElseThrow())
                                .unit(unitRepo.findById(dto.getUnitId()).orElseThrow())
                                .description(dto.getDescription())
                                .orderedQty(dto.getOrderedQty())
                                .unitPrice(dto.getUnitPrice())
                                .discountPercentage(dto.getDiscountPercentage())
                                .discountAmount(dto.getDiscountAmount())
                                .taxPercentage(dto.getTaxPercentage())
                                .taxAmount(dto.getTaxAmount())
                                .totalPrice(dto.getTotalPrice())
                                .polymerGrade(dto.getPolymerGrade())
                                .receivedQty(BigDecimal.ZERO)
                                .status("Pending")
                                .notes(dto.getNotes())
                                .build();
        }

        private PurchaseOrderDto mapToDto(PurchaseOrder entity) {
                return PurchaseOrderDto.builder()
                                .id(entity.getId())
                                .poNumber(entity.getPoNumber())
                                .poDate(entity.getPoDate())
                                .prId(entity.getPrId())
                                .quotationId(entity.getQuotationId())
                                .supplierId(entity.getSupplier().getId())
                                .supplierNameAr(entity.getSupplier().getSupplierNameAr())
                                .expectedDeliveryDate(entity.getExpectedDeliveryDate())
                                .deliveryDays(entity.getDeliveryDays())
                                .shippingMethod(entity.getShippingMethod())
                                .shippingTerms(entity.getShippingTerms())
                                .paymentTerms(entity.getPaymentTerms())
                                .paymentTermDays(entity.getPaymentTermDays())
                                .currency(entity.getCurrency())
                                .exchangeRate(entity.getExchangeRate())
                                .subTotal(entity.getSubTotal())
                                .discountPercentage(entity.getDiscountPercentage())
                                .discountAmount(entity.getDiscountAmount())
                                .taxAmount(entity.getTaxAmount())
                                .shippingCost(entity.getShippingCost())
                                .otherCosts(entity.getOtherCosts())
                                .totalAmount(entity.getTotalAmount())
                                .status(entity.getStatus())
                                .approvalStatus(entity.getApprovalStatus())
                                .notes(entity.getNotes())
                                .termsAndConditions(entity.getTermsAndConditions())
                                .items(entity.getItems() != null ? entity.getItems().stream()
                                                .map(this::mapToItemDto)
                                                .collect(Collectors.toList()) : null)
                                .build();
        }

        private PurchaseOrderItemDto mapToItemDto(PurchaseOrderItem item) {
                return PurchaseOrderItemDto.builder()
                                .id(item.getId())
                                .itemId(item.getItem().getId())
                                .itemNameAr(item.getItem().getItemNameAr())
                                .description(item.getDescription())
                                .orderedQty(item.getOrderedQty())
                                .unitId(item.getUnit().getId())
                                .unitNameAr(item.getUnit().getUnitNameAr())
                                .unitPrice(item.getUnitPrice())
                                .discountPercentage(item.getDiscountPercentage())
                                .discountAmount(item.getDiscountAmount())
                                .taxPercentage(item.getTaxPercentage())
                                .taxAmount(item.getTaxAmount())
                                .totalPrice(item.getTotalPrice())
                                .polymerGrade(item.getPolymerGrade())
                                .receivedQty(item.getReceivedQty())
                                .remainingQty(item.getRemainingQty())
                                .status(item.getStatus())
                                .notes(item.getNotes())
                                .build();
        }
}
