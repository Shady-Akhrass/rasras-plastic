package com.rasras.erp.procurement;

import com.rasras.erp.inventory.ItemRepository;
import com.rasras.erp.inventory.UnitRepository;
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

    @Transactional(readOnly = true)
    public List<PurchaseOrderDto> getAllPOs() {
        return poRepo.findAll().stream()
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

        return mapToDto(poRepo.save(po));
    }

    private String generatePONumber() {
        // Simple generation for now: PO-YYYY-MM-count
        long count = poRepo.count() + 1;
        LocalDateTime now = LocalDateTime.now();
        return String.format("PO-%d%02d-%03d", now.getYear(), now.getMonthValue(), count);
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
                .receivedQty(item.getReceivedQty())
                .remainingQty(item.getRemainingQty())
                .status(item.getStatus())
                .notes(item.getNotes())
                .build();
    }
}
