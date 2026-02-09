package com.rasras.erp.supplier;

import com.rasras.erp.inventory.GRNItem;
import com.rasras.erp.inventory.GoodsReceiptNote;
import com.rasras.erp.inventory.GoodsReceiptNoteRepository;
import com.rasras.erp.inventory.ItemRepository;
import com.rasras.erp.inventory.UnitRepository;
import com.rasras.erp.procurement.PurchaseOrder;
import com.rasras.erp.procurement.PurchaseOrderItem;
import com.rasras.erp.procurement.PurchaseOrderRepository;
import com.rasras.erp.supplier.dto.SupplierInvoiceDto;
import com.rasras.erp.supplier.dto.SupplierInvoiceItemDto;
import com.rasras.erp.supplier.service.SupplierInvoicePdfService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierInvoiceService {

        private final SupplierInvoiceRepository invoiceRepo;
        private final SupplierRepository supplierRepo;
        private final ItemRepository itemRepository;
        private final UnitRepository unitRepository;
        private final GoodsReceiptNoteRepository grnRepo;
        private final PurchaseOrderRepository poRepo;
        private final SupplierInvoicePdfService pdfService;

        @Transactional(readOnly = true)
        public List<SupplierInvoiceDto> getAllInvoices() {
                return invoiceRepo.findAll().stream()
                                .map(this::mapToDto)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public SupplierInvoiceDto getInvoiceById(Integer id) {
                SupplierInvoice invoice = invoiceRepo.findById(id)
                                .orElseThrow(() -> new RuntimeException("Invoice not found"));
                return mapToDto(invoice);
        }

        @Transactional
        public SupplierInvoiceDto createInvoice(SupplierInvoiceDto dto) {
                Supplier supplier = supplierRepo.findById(dto.getSupplierId())
                                .orElseThrow(() -> new RuntimeException("Supplier not found"));

                SupplierInvoice invoice = SupplierInvoice.builder()
                                .invoiceNumber(
                                                (dto.getInvoiceNumber() != null && !dto.getInvoiceNumber().isEmpty())
                                                                ? dto.getInvoiceNumber()
                                                                : generateInvoiceNumber())
                                .supplierInvoiceNo(dto.getSupplierInvoiceNo())
                                .invoiceDate(dto.getInvoiceDate())
                                .dueDate(dto.getDueDate())
                                .poId(dto.getPoId())
                                .grnId(dto.getGrnId())
                                .supplier(supplier)
                                .currency(dto.getCurrency() != null ? dto.getCurrency() : "EGP")
                                .exchangeRate(dto.getExchangeRate() != null ? dto.getExchangeRate() : BigDecimal.ONE)
                                .subTotal(dto.getSubTotal())
                                .discountAmount(dto.getDiscountAmount() != null ? dto.getDiscountAmount()
                                                : BigDecimal.ZERO)
                                .taxAmount(dto.getTaxAmount() != null ? dto.getTaxAmount() : BigDecimal.ZERO)
                                .deliveryCost(dto.getDeliveryCost() != null ? dto.getDeliveryCost() : BigDecimal.ZERO)
                                .otherCosts(dto.getOtherCosts() != null ? dto.getOtherCosts() : BigDecimal.ZERO)
                                .totalAmount(dto.getTotalAmount())
                                .paidAmount(BigDecimal.ZERO)
                                .status("Unpaid")
                                .approvalStatus("Pending")
                                .notes(dto.getNotes())
                                .build();

                if (dto.getItems() != null) {
                        invoice.setItems(dto.getItems().stream()
                                        .map(itemDto -> mapToItemEntity(invoice, itemDto))
                                        .collect(Collectors.toList()));
                }

                // Update GRN status if linked
                if (dto.getGrnId() != null) {
                        grnRepo.findById(dto.getGrnId()).ifPresent(grn -> {
                                grn.setStatus("Billed");
                                grnRepo.save(grn);
                        });
                }

                return mapToDto(invoiceRepo.save(invoice));
        }

        private SupplierInvoiceItem mapToItemEntity(SupplierInvoice invoice,
                        com.rasras.erp.supplier.dto.SupplierInvoiceItemDto itemDto) {
                return SupplierInvoiceItem.builder()
                                .invoice(invoice)
                                .item(itemRepository.findById(itemDto.getItemId()).orElseThrow())
                                .unit(unitRepository.findById(itemDto.getUnitId()).orElseThrow())
                                .description(itemDto.getDescription())
                                .quantity(itemDto.getQuantity())
                                .unitPrice(itemDto.getUnitPrice())
                                .discountPercentage(itemDto.getDiscountPercentage())
                                .discountAmount(itemDto.getDiscountAmount())
                                .taxPercentage(itemDto.getTaxPercentage())
                                .taxAmount(itemDto.getTaxAmount())
                                .totalPrice(itemDto.getTotalPrice())
                                .grnItemId(itemDto.getGrnItemId())
                                .build();
        }

        private SupplierInvoiceDto mapToDto(SupplierInvoice entity) {
                return SupplierInvoiceDto.builder()
                                .id(entity.getId())
                                .invoiceNumber(entity.getInvoiceNumber())
                                .supplierInvoiceNo(entity.getSupplierInvoiceNo())
                                .invoiceDate(entity.getInvoiceDate())
                                .dueDate(entity.getDueDate())
                                .poId(entity.getPoId())
                                .grnId(entity.getGrnId())
                                .supplierId(entity.getSupplier().getId())
                                .supplierNameAr(entity.getSupplier().getSupplierNameAr())
                                .currency(entity.getCurrency())
                                .subTotal(entity.getSubTotal())
                                .discountAmount(entity.getDiscountAmount())
                                .taxAmount(entity.getTaxAmount())
                                .totalAmount(entity.getTotalAmount())
                                .deliveryCost(entity.getDeliveryCost())
                                .otherCosts(entity.getOtherCosts())
                                .paidAmount(entity.getPaidAmount())
                                .remainingAmount(entity.getTotalAmount().subtract(entity.getPaidAmount()))
                                .status(entity.getStatus())
                                .approvalStatus(entity.getApprovalStatus())
                                .items(entity.getItems() != null ? entity.getItems().stream()
                                                .map(this::mapToItemDto)
                                                .collect(Collectors.toList()) : null)
                                .build();
        }

        private SupplierInvoiceItemDto mapToItemDto(SupplierInvoiceItem entity) {
                return SupplierInvoiceItemDto.builder()
                                .id(entity.getId())
                                .itemId(entity.getItem().getId())
                                .itemNameAr(entity.getItem().getItemNameAr())
                                .description(entity.getDescription())
                                .quantity(entity.getQuantity())
                                .unitId(entity.getUnit().getId())
                                .unitNameAr(entity.getUnit().getUnitNameAr())
                                .unitPrice(entity.getUnitPrice())
                                .discountPercentage(entity.getDiscountPercentage())
                                .discountAmount(entity.getDiscountAmount())
                                .taxPercentage(entity.getTaxPercentage())
                                .taxAmount(entity.getTaxAmount())
                                .totalPrice(entity.getTotalPrice())
                                .grnItemId(entity.getGrnItemId())
                                .build();
        }

        @Transactional
        public SupplierInvoiceDto approvePayment(Integer invoiceId, Integer userId, boolean approved) {
                SupplierInvoice invoice = invoiceRepo.findById(invoiceId)
                                .orElseThrow(() -> new RuntimeException("Invoice not found"));

                String oldStatus = invoice.getApprovalStatus();
                invoice.setApprovalStatus(approved ? "Approved" : "Rejected");

                // If newly approved, update supplier balance
                if (approved && !"Approved".equals(oldStatus)) {
                        Supplier supplier = invoice.getSupplier();
                        BigDecimal totalInvoiced = supplier.getTotalInvoiced() != null ? supplier.getTotalInvoiced()
                                        : BigDecimal.ZERO;
                        BigDecimal currentBalance = supplier.getCurrentBalance() != null ? supplier.getCurrentBalance()
                                        : BigDecimal.ZERO;

                        supplier.setTotalInvoiced(totalInvoiced.add(invoice.getTotalAmount()));
                        supplier.setCurrentBalance(currentBalance.add(invoice.getTotalAmount()));
                        supplierRepo.save(supplier);
                }

                return mapToDto(invoiceRepo.save(invoice));
        }

        @Transactional
        public void createInvoiceFromGRN(Integer grnId) {
                GoodsReceiptNote grn = grnRepo.findById(grnId)
                                .orElseThrow(() -> new RuntimeException("GRN not found"));

                if (invoiceRepo.existsByGrnId(grnId)) {
                        return; // Already invoiced
                }

                // Get Purchase Order to get pricing and discount/tax info
                PurchaseOrder po = grn.getPurchaseOrder();
                if (po == null) {
                        throw new RuntimeException("GRN has no associated Purchase Order");
                }

                // Create a map of PO items by ID for quick lookup
                Map<Integer, PurchaseOrderItem> poItemsMap = po.getItems().stream()
                                .collect(Collectors.toMap(PurchaseOrderItem::getId, item -> item));

                SupplierInvoice invoice = SupplierInvoice.builder()
                                .invoiceNumber(generateInvoiceNumber())
                                .supplierInvoiceNo(grn.getSupplierInvoiceNo() != null ? grn.getSupplierInvoiceNo()
                                                : "AUTO-" + grn.getGrnNumber())
                                .invoiceDate(LocalDate.now())
                                .dueDate(LocalDate.now().plusDays(30)) // Default credit term
                                .poId(po.getId())
                                .grnId(grn.getId())
                                .supplier(grn.getSupplier())
                                .currency(po.getCurrency() != null ? po.getCurrency() : "EGP")
                                .exchangeRate(po.getExchangeRate() != null ? po.getExchangeRate() : BigDecimal.ONE)
                                .status("Unpaid")
                                .approvalStatus("Approved") // Inherited approval
                                .notes("Generated automatically from " + grn.getGrnNumber())
                                .build();

                // Calculate totals using PO-style calculation: Gross -> Discount -> Tax on
                // Taxable Amount
                BigDecimal totalSubTotal = BigDecimal.ZERO;
                BigDecimal totalDiscountAmount = BigDecimal.ZERO;
                BigDecimal totalTaxAmount = BigDecimal.ZERO;
                java.util.ArrayList<SupplierInvoiceItem> items = new java.util.ArrayList<>();

                for (com.rasras.erp.inventory.GRNItem gi : grn.getItems()) {
                        BigDecimal qty = gi.getAcceptedQty() != null ? gi.getAcceptedQty() : gi.getReceivedQty();
                        if (qty == null || qty.compareTo(BigDecimal.ZERO) <= 0) {
                                continue;
                        }

                        // Get corresponding PO item to get pricing, discount, and tax info
                        PurchaseOrderItem poItem = poItemsMap.get(gi.getPoItemId());
                        if (poItem == null) {
                                throw new RuntimeException("PO Item not found for GRN Item: " + gi.getId());
                        }

                        // Use PO unit price, discount, and tax percentages
                        BigDecimal unitPrice = poItem.getUnitPrice() != null ? poItem.getUnitPrice()
                                        : (gi.getUnitCost() != null ? gi.getUnitCost() : BigDecimal.ZERO);
                        BigDecimal discountPercentage = poItem.getDiscountPercentage() != null
                                        ? poItem.getDiscountPercentage()
                                        : BigDecimal.ZERO;
                        BigDecimal taxPercentage = poItem.getTaxPercentage() != null
                                        ? poItem.getTaxPercentage()
                                        : BigDecimal.ZERO;

                        // Calculate: Gross -> Discount -> Tax on Taxable Amount
                        BigDecimal grossAmount = qty.multiply(unitPrice);
                        BigDecimal discountAmount = grossAmount.multiply(discountPercentage)
                                        .divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
                        BigDecimal taxableAmount = grossAmount.subtract(discountAmount);
                        BigDecimal taxAmount = taxableAmount.multiply(taxPercentage)
                                        .divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
                        BigDecimal totalPrice = taxableAmount.add(taxAmount);

                        // Accumulate totals
                        totalSubTotal = totalSubTotal.add(grossAmount);
                        totalDiscountAmount = totalDiscountAmount.add(discountAmount);
                        totalTaxAmount = totalTaxAmount.add(taxAmount);

                        items.add(SupplierInvoiceItem.builder()
                                        .invoice(invoice)
                                        .grnItemId(gi.getId())
                                        .item(gi.getItem())
                                        .unit(gi.getUnit())
                                        .description(gi.getItem().getItemNameAr())
                                        .quantity(qty)
                                        .unitPrice(unitPrice)
                                        .discountPercentage(discountPercentage)
                                        .discountAmount(discountAmount.setScale(2, RoundingMode.HALF_UP))
                                        .taxPercentage(taxPercentage)
                                        .taxAmount(taxAmount.setScale(2, RoundingMode.HALF_UP))
                                        .totalPrice(totalPrice.setScale(2, RoundingMode.HALF_UP))
                                        .build());
                }

                invoice.setItems(items);

                // Set calculated totals
                invoice.setSubTotal(totalSubTotal.setScale(2, RoundingMode.HALF_UP));
                invoice.setDiscountAmount(totalDiscountAmount.setScale(2, RoundingMode.HALF_UP));
                invoice.setTaxAmount(totalTaxAmount.setScale(2, RoundingMode.HALF_UP));

                // Get costs from PO
                BigDecimal deliveryCost = po.getShippingCost() != null ? po.getShippingCost() : BigDecimal.ZERO;
                BigDecimal otherCosts = po.getOtherCosts() != null ? po.getOtherCosts() : BigDecimal.ZERO;
                invoice.setDeliveryCost(deliveryCost);
                invoice.setOtherCosts(otherCosts);

                // Final Calculation: (Subtotal - Discount) + Tax + Delivery + Other
                BigDecimal grandTotal = totalSubTotal.subtract(totalDiscountAmount)
                                .add(totalTaxAmount)
                                .add(deliveryCost)
                                .add(otherCosts);
                invoice.setTotalAmount(grandTotal.setScale(2, RoundingMode.HALF_UP));

                invoiceRepo.save(invoice);

                // Update GRN status
                grn.setStatus("Billed");
                grnRepo.save(grn);

                // Update Supplier Balance
                Supplier supplier = grn.getSupplier();
                BigDecimal totalInvoiced = supplier.getTotalInvoiced() != null ? supplier.getTotalInvoiced()
                                : BigDecimal.ZERO;
                BigDecimal currentBalance = supplier.getCurrentBalance() != null ? supplier.getCurrentBalance()
                                : BigDecimal.ZERO;
                supplier.setTotalInvoiced(totalInvoiced.add(invoice.getTotalAmount()));
                supplier.setCurrentBalance(currentBalance.add(invoice.getTotalAmount()));
                supplierRepo.save(supplier);
        }

        @Transactional(readOnly = true)
        public byte[] generateInvoicePdf(Integer id) {
                SupplierInvoiceDto invoice = getInvoiceById(id);
                return pdfService.generateInvoicePdf(invoice);
        }

        private String generateInvoiceNumber() {
                long count = invoiceRepo.count() + 1;
                return "#INV-" + count;
        }
}
