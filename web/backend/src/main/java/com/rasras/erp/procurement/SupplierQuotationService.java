package com.rasras.erp.procurement;

import com.rasras.erp.inventory.ItemRepository;
import com.rasras.erp.inventory.UnitRepository;
import com.rasras.erp.supplier.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierQuotationService {

        private final SupplierQuotationRepository quotationRepository;
        private final RFQRepository rfqRepository;
        private final SupplierRepository supplierRepository;
        private final ItemRepository itemRepository;
        private final UnitRepository unitRepository;

        @Transactional(readOnly = true)
        public List<SupplierQuotationDto> getAllQuotations() {
                return quotationRepository.findAll().stream()
                                .map(this::mapToDto)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public SupplierQuotationDto getQuotationById(Integer id) {
                return quotationRepository.findById(id)
                                .map(this::mapToDto)
                                .orElseThrow(() -> new RuntimeException("Quotation not found"));
        }

        @Transactional
        public SupplierQuotationDto createQuotation(SupplierQuotationDto dto) {
                SupplierQuotation quotation = new SupplierQuotation();
                quotation.setQuotationNumber(dto.getQuotationNumber());
                quotation.setQuotationDate(dto.getQuotationDate());
                quotation.setValidUntilDate(dto.getValidUntilDate());
                quotation.setCurrency(dto.getCurrency() != null ? dto.getCurrency() : "EGP");
                quotation.setExchangeRate(dto.getExchangeRate());
                quotation.setPaymentTerms(dto.getPaymentTerms());
                quotation.setDeliveryTerms(dto.getDeliveryTerms());
                quotation.setDeliveryDays(dto.getDeliveryDays());
                quotation.setDeliveryCost(dto.getDeliveryCost());
                quotation.setOtherCosts(dto.getOtherCosts() != null ? dto.getOtherCosts() : java.math.BigDecimal.ZERO);
                quotation.setTotalAmount(dto.getTotalAmount());
                quotation.setStatus("Received");
                quotation.setNotes(dto.getNotes());
                quotation.setSupplier(supplierRepository.findById(dto.getSupplierId())
                                .orElseThrow(() -> new RuntimeException("Supplier not found")));

                if (dto.getRfqId() != null) {
                        quotation.setRfq(rfqRepository.findById(dto.getRfqId())
                                        .orElseThrow(() -> new RuntimeException("RFQ not found")));

                        if (quotationRepository.existsByRfqId(dto.getRfqId())) {
                                throw new RuntimeException(
                                                "Duplicate Quotation: A quotation has already been registered for this RFQ.");
                        }
                }

                quotation.setCreatedBy(dto.getCreatedBy() != null ? dto.getCreatedBy() : 1);

                SupplierQuotation savedQuotation = quotationRepository.save(quotation);

                if (dto.getItems() != null && !dto.getItems().isEmpty()) {
                        final SupplierQuotation finalQuotation = savedQuotation;
                        List<SupplierQuotationItem> items = dto.getItems().stream()
                                        .map(itemDto -> mapItemToEntity(itemDto, finalQuotation))
                                        .collect(Collectors.toList());
                        savedQuotation.setItems(items);
                        savedQuotation = quotationRepository.save(savedQuotation);
                }

                return mapToDto(savedQuotation);
        }

        @Transactional
        public SupplierQuotationDto updateQuotation(Integer id, SupplierQuotationDto dto) {
                SupplierQuotation quotation = quotationRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Quotation not found"));

                quotation.setQuotationNumber(dto.getQuotationNumber());
                quotation.setQuotationDate(dto.getQuotationDate());
                quotation.setValidUntilDate(dto.getValidUntilDate());
                quotation.setCurrency(dto.getCurrency() != null ? dto.getCurrency() : "EGP");
                quotation.setExchangeRate(dto.getExchangeRate());
                quotation.setPaymentTerms(dto.getPaymentTerms());
                quotation.setDeliveryTerms(dto.getDeliveryTerms());
                quotation.setDeliveryDays(dto.getDeliveryDays());
                quotation.setDeliveryCost(dto.getDeliveryCost());
                quotation.setOtherCosts(dto.getOtherCosts() != null ? dto.getOtherCosts() : java.math.BigDecimal.ZERO);
                quotation.setTotalAmount(dto.getTotalAmount());
                quotation.setNotes(dto.getNotes());
                quotation.setSupplier(supplierRepository.findById(dto.getSupplierId())
                                .orElseThrow(() -> new RuntimeException("Supplier not found")));

                if (dto.getRfqId() != null) {
                        quotation.setRfq(rfqRepository.findById(dto.getRfqId())
                                        .orElseThrow(() -> new RuntimeException("RFQ not found")));
                } else {
                        quotation.setRfq(null);
                }

                // Replace items: remove existing and add from dto
                if (quotation.getItems() != null) {
                        quotation.getItems().clear();
                } else {
                        quotation.setItems(new ArrayList<>());
                }
                if (dto.getItems() != null && !dto.getItems().isEmpty()) {
                        List<SupplierQuotationItem> items = dto.getItems().stream()
                                        .map(itemDto -> mapItemToEntity(itemDto, quotation))
                                        .collect(Collectors.toList());
                        quotation.getItems().addAll(items);
                }

                SupplierQuotation savedQuotation = quotationRepository.save(quotation);
                return mapToDto(savedQuotation);
        }

        private SupplierQuotationDto mapToDto(SupplierQuotation quotation) {
                return SupplierQuotationDto.builder()
                                .id(quotation.getId())
                                .quotationNumber(quotation.getQuotationNumber())
                                .quotationDate(quotation.getQuotationDate())
                                .validUntilDate(quotation.getValidUntilDate())
                                .currency(quotation.getCurrency())
                                .exchangeRate(quotation.getExchangeRate())
                                .paymentTerms(quotation.getPaymentTerms())
                                .deliveryTerms(quotation.getDeliveryTerms())
                                .deliveryDays(quotation.getDeliveryDays())
                                .deliveryCost(quotation.getDeliveryCost())
                                .otherCosts(quotation.getOtherCosts())
                                .totalAmount(quotation.getTotalAmount())
                                .status(quotation.getStatus())
                                .notes(quotation.getNotes())
                                .rfqId(quotation.getRfq() != null ? quotation.getRfq().getId() : null)
                                .rfqNumber(quotation.getRfq() != null ? quotation.getRfq().getRfqNumber() : null)
                                .supplierId(quotation.getSupplier().getId())
                                .supplierNameAr(quotation.getSupplier().getSupplierNameAr())
                                .createdAt(quotation.getCreatedAt())
                                .createdBy(quotation.getCreatedBy())
                                .items(quotation.getItems() != null
                                                ? quotation.getItems().stream().map(this::mapItemToDto)
                                                                .collect(Collectors.toList())
                                                : new ArrayList<>())
                                .build();
        }

        // Item Mapper
        private SupplierQuotationItemDto mapItemToDto(SupplierQuotationItem item) {
                return SupplierQuotationItemDto.builder()
                                .id(item.getId())
                                .quotationId(item.getQuotation().getId())
                                .itemId(item.getItem().getId())
                                .itemNameAr(item.getItem().getItemNameAr())
                                .itemCode(item.getItem().getItemCode())
                                .offeredQty(item.getOfferedQty())
                                .unitId(item.getUnit().getId())
                                .unitName(item.getUnit().getUnitNameAr())
                                .unitPrice(item.getUnitPrice())
                                .discountPercentage(item.getDiscountPercentage())
                                .discountAmount(item.getDiscountAmount())
                                .taxPercentage(item.getTaxPercentage())
                                .taxAmount(item.getTaxAmount())
                                .totalPrice(item.getTotalPrice())
                                .deliveryDays(item.getDeliveryDays())
                                .polymerGrade(item.getPolymerGrade())
                                .notes(item.getNotes())
                                .build();
        }

        private SupplierQuotationItem mapItemToEntity(SupplierQuotationItemDto dto, SupplierQuotation quotation) {
                return SupplierQuotationItem.builder()
                                .quotation(quotation)
                                .item(itemRepository.findById(dto.getItemId())
                                                .orElseThrow(() -> new RuntimeException("Item not found")))
                                .offeredQty(dto.getOfferedQty())
                                .unit(unitRepository.findById(dto.getUnitId())
                                                .orElseThrow(() -> new RuntimeException("Unit not found")))
                                .unitPrice(dto.getUnitPrice())
                                .discountPercentage(dto.getDiscountPercentage())
                                .discountAmount(dto.getDiscountAmount())
                                .taxPercentage(dto.getTaxPercentage())
                                .taxAmount(dto.getTaxAmount())
                                .totalPrice(dto.getTotalPrice())
                                .deliveryDays(dto.getDeliveryDays())
                                .polymerGrade(dto.getPolymerGrade())
                                .notes(dto.getNotes())
                                .build();
        }
}
