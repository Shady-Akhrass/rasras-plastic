package com.rasras.erp.supplier;

import com.rasras.erp.inventory.ItemRepository;
import com.rasras.erp.inventory.UnitRepository;
import com.rasras.erp.supplier.dto.SupplierInvoiceDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierInvoiceService {

        private final SupplierInvoiceRepository invoiceRepo;
        private final SupplierRepository supplierRepo;
        private final ItemRepository itemRepository;
        private final UnitRepository unitRepository;

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
                                .invoiceNumber(dto.getInvoiceNumber())
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
                                .totalAmount(dto.getTotalAmount())
                                .paidAmount(BigDecimal.ZERO)
                                .status("Pending")
                                .notes(dto.getNotes())
                                .build();

                if (dto.getItems() != null) {
                        invoice.setItems(dto.getItems().stream()
                                        .map(itemDto -> mapToItemEntity(invoice, itemDto))
                                        .collect(Collectors.toList()));
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
                                .totalAmount(entity.getTotalAmount())
                                .paidAmount(entity.getPaidAmount())
                                .remainingAmount(entity.getTotalAmount().subtract(entity.getPaidAmount()))
                                .status(entity.getStatus())
                                .build();
        }
}
