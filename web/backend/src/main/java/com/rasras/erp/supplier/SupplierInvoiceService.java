package com.rasras.erp.supplier;

import com.rasras.erp.inventory.GRNItem;
import com.rasras.erp.inventory.GoodsReceiptNote;
import com.rasras.erp.inventory.GoodsReceiptNoteRepository;
import com.rasras.erp.inventory.ItemRepository;
import com.rasras.erp.inventory.UnitRepository;
import com.rasras.erp.supplier.dto.SupplierInvoiceDto;
import com.rasras.erp.supplier.dto.SupplierInvoiceItemDto;
import com.rasras.erp.supplier.service.SupplierInvoicePdfService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierInvoiceService {

        private final SupplierInvoiceRepository invoiceRepo;
        private final SupplierRepository supplierRepo;
        private final ItemRepository itemRepository;
        private final UnitRepository unitRepository;
        private final GoodsReceiptNoteRepository grnRepo;
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

                SupplierInvoice invoice = SupplierInvoice.builder()
                                .invoiceNumber(generateInvoiceNumber())
                                .supplierInvoiceNo(grn.getSupplierInvoiceNo() != null ? grn.getSupplierInvoiceNo()
                                                : "AUTO-" + grn.getGrnNumber())
                                .invoiceDate(LocalDate.now())
                                .dueDate(LocalDate.now().plusDays(30)) // Default credit term
                                .poId(grn.getPurchaseOrder().getId())
                                .grnId(grn.getId())
                                .supplier(grn.getSupplier())
                                .currency("EGP")
                                .exchangeRate(BigDecimal.ONE)
                                .status("Unpaid")
                                .approvalStatus("Approved") // Inherited approval
                                .notes("Generated automatically from " + grn.getGrnNumber())
                                .build();

                List<SupplierInvoiceItem> items = grn.getItems().stream()
                                .filter(gi -> {
                                        BigDecimal qty = gi.getAcceptedQty() != null ? gi.getAcceptedQty()
                                                        : gi.getReceivedQty();
                                        return qty != null && qty.compareTo(BigDecimal.ZERO) > 0;
                                })
                                .map(gi -> {
                                        BigDecimal acceptedQty = gi.getAcceptedQty() != null ? gi.getAcceptedQty()
                                                        : gi.getReceivedQty();
                                        BigDecimal unitCost = gi.getUnitCost() != null ? gi.getUnitCost()
                                                        : BigDecimal.ZERO;
                                        BigDecimal taxRate = new BigDecimal("0.14"); // Standard VAT
                                        BigDecimal subTotal = acceptedQty.multiply(unitCost);
                                        BigDecimal taxAmount = subTotal.multiply(taxRate);

                                        return SupplierInvoiceItem.builder()
                                                        .invoice(invoice)
                                                        .grnItemId(gi.getId())
                                                        .item(gi.getItem())
                                                        .unit(gi.getUnit())
                                                        .description(gi.getItem().getItemNameAr())
                                                        .quantity(acceptedQty)
                                                        .unitPrice(unitCost)
                                                        .taxPercentage(taxRate.multiply(new BigDecimal("100")))
                                                        .taxAmount(taxAmount)
                                                        .totalPrice(subTotal.add(taxAmount))
                                                        .build();
                                })
                                .collect(Collectors.toList());

                invoice.setItems(items);

                BigDecimal subTotal = items.stream().map(SupplierInvoiceItem::getTotalPrice)
                                .reduce(BigDecimal.ZERO, BigDecimal::subtract)
                                .add(items.stream().map(SupplierInvoiceItem::getTotalPrice).reduce(BigDecimal.ZERO,
                                                BigDecimal::add));
                // Wait, better re-calc
                BigDecimal totalSub = items.stream()
                                .map(i -> i.getQuantity().multiply(i.getUnitPrice()))
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
                BigDecimal totalTax = items.stream()
                                .map(i -> i.getTaxAmount())
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                invoice.setSubTotal(totalSub);
                invoice.setTaxAmount(totalTax);
                invoice.setTotalAmount(totalSub.add(totalTax));

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
