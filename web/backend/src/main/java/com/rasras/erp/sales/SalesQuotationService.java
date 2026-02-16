package com.rasras.erp.sales;

import com.rasras.erp.crm.Customer;
import com.rasras.erp.crm.CustomerRepository;
import com.rasras.erp.inventory.Item;
import com.rasras.erp.inventory.ItemRepository;
import com.rasras.erp.inventory.PriceList;
import com.rasras.erp.inventory.PriceListRepository;
import com.rasras.erp.inventory.UnitOfMeasure;
import com.rasras.erp.inventory.UnitRepository;
import com.rasras.erp.approval.ApprovalService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalesQuotationService {

    private final SalesQuotationRepository quotationRepository;
    private final CustomerRepository customerRepository;
    private final ItemRepository itemRepository;
    private final UnitRepository unitRepository;
    private final PriceListRepository priceListRepository;
    private final ApprovalService approvalService;

    @Transactional(readOnly = true)
    public List<SalesQuotationDto> getAllQuotations() {
        return quotationRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SalesQuotationDto getQuotationById(Integer id) {
        return quotationRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException("Sales Quotation not found"));
    }

    @Transactional
    public SalesQuotationDto createQuotation(SalesQuotationDto dto) {
        SalesQuotation quotation = new SalesQuotation();
        quotation.setQuotationNumber(generateQuotationNumber());
        quotation.setQuotationDate(
                dto.getQuotationDate() != null ? dto.getQuotationDate().atStartOfDay() : LocalDateTime.now());
        quotation.setValidUntilDate(dto.getValidUntilDate());

        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        quotation.setCustomer(customer);

        quotation.setContactId(dto.getContactId());
        quotation.setSalesRepId(dto.getSalesRepId());
        quotation.setCurrency(dto.getCurrency() != null ? dto.getCurrency() : "EGP");
        quotation.setExchangeRate(dto.getExchangeRate() != null ? dto.getExchangeRate() : BigDecimal.ONE);

        if (dto.getPriceListId() != null) {
            PriceList priceList = priceListRepository.findById(dto.getPriceListId())
                    .orElse(null);
            quotation.setPriceList(priceList);
        }

        quotation.setSubTotal(dto.getSubTotal() != null ? dto.getSubTotal() : BigDecimal.ZERO);
        quotation.setDiscountPercentage(
                dto.getDiscountPercentage() != null ? dto.getDiscountPercentage() : BigDecimal.ZERO);
        quotation.setDiscountAmount(dto.getDiscountAmount() != null ? dto.getDiscountAmount() : BigDecimal.ZERO);
        quotation.setTaxAmount(dto.getTaxAmount() != null ? dto.getTaxAmount() : BigDecimal.ZERO);
        quotation.setTotalAmount(dto.getTotalAmount() != null ? dto.getTotalAmount() : BigDecimal.ZERO);
        quotation.setPaymentTerms(dto.getPaymentTerms());
        quotation.setDeliveryTerms(dto.getDeliveryTerms());
        quotation.setStatus(dto.getStatus() != null ? dto.getStatus() : "Draft");
        quotation.setApprovalStatus(dto.getApprovalStatus() != null ? dto.getApprovalStatus() : "Pending");
        quotation.setNotes(dto.getNotes());
        quotation.setTermsAndConditions(dto.getTermsAndConditions());
        quotation.setCreatedBy(dto.getCreatedBy() != null ? dto.getCreatedBy() : 1);

        // Handle Items
        if (dto.getItems() != null && !dto.getItems().isEmpty()) {
            List<SalesQuotationItem> items = new ArrayList<>();
            for (SalesQuotationItemDto itemDto : dto.getItems()) {
                SalesQuotationItem item = mapItemToEntity(itemDto, quotation);
                items.add(item);
            }
            quotation.setItems(items);
        }

        SalesQuotation saved = quotationRepository.save(quotation);
        return mapToDto(saved);
    }

    @Transactional
    public SalesQuotationDto updateQuotation(Integer id, SalesQuotationDto dto) {
        SalesQuotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sales Quotation not found"));

        if (!"Draft".equals(quotation.getStatus()) && !"Rejected".equals(quotation.getStatus())) {
            throw new RuntimeException("Cannot edit quotation that is not in Draft or Rejected status");
        }

        // Reset approval status if rejected and being edited
        if ("Rejected".equals(quotation.getStatus())) {
            quotation.setApprovalStatus("Pending");
        }

        quotation.setValidUntilDate(dto.getValidUntilDate());

        if (dto.getCustomerId() != null && !dto.getCustomerId().equals(quotation.getCustomer().getId())) {
            Customer customer = customerRepository.findById(dto.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Customer not found"));
            quotation.setCustomer(customer);
        }

        quotation.setContactId(dto.getContactId());
        quotation.setSalesRepId(dto.getSalesRepId());
        quotation.setCurrency(dto.getCurrency());
        quotation.setExchangeRate(dto.getExchangeRate());

        if (dto.getPriceListId() != null) {
            PriceList priceList = priceListRepository.findById(dto.getPriceListId())
                    .orElse(null);
            quotation.setPriceList(priceList);
        }

        quotation.setSubTotal(dto.getSubTotal());
        quotation.setDiscountPercentage(dto.getDiscountPercentage());
        quotation.setDiscountAmount(dto.getDiscountAmount());
        quotation.setTaxAmount(dto.getTaxAmount());
        quotation.setTotalAmount(dto.getTotalAmount());
        quotation.setPaymentTerms(dto.getPaymentTerms());
        quotation.setDeliveryTerms(dto.getDeliveryTerms());
        quotation.setNotes(dto.getNotes());
        quotation.setTermsAndConditions(dto.getTermsAndConditions());
        quotation.setUpdatedBy(dto.getUpdatedBy() != null ? dto.getUpdatedBy() : 1);

        // Update Items - clear and recreate
        if (quotation.getItems() != null) {
            quotation.getItems().clear();
        } else {
            quotation.setItems(new ArrayList<>());
        }

        if (dto.getItems() != null) {
            for (SalesQuotationItemDto itemDto : dto.getItems()) {
                SalesQuotationItem item = mapItemToEntity(itemDto, quotation);
                quotation.getItems().add(item);
            }
        }

        return mapToDto(quotationRepository.save(quotation));
    }

    @Transactional
    public SalesQuotationDto submitForApproval(Integer id) {
        SalesQuotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sales Quotation not found"));

        if (!"Draft".equals(quotation.getStatus()) && !"Rejected".equals(quotation.getStatus())) {
            throw new RuntimeException("Sales Quotation must be in Draft or Rejected status to submit");
        }

        quotation.setStatus("Pending");
        SalesQuotation saved = quotationRepository.save(quotation);

        // Initiate approval workflow
        approvalService.initiateApproval("QUOTATION_APPROVAL", "SalesQuotation", saved.getId(),
                saved.getQuotationNumber(), saved.getCreatedBy() != null ? saved.getCreatedBy() : 1,
                saved.getTotalAmount());

        return mapToDto(saved);
    }

    @Transactional
    public void deleteQuotation(Integer id) {
        SalesQuotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sales Quotation not found"));

        if (!"Draft".equals(quotation.getStatus()) && !"Pending".equals(quotation.getStatus()) && !"Rejected".equals(quotation.getStatus())) {
            throw new RuntimeException("Cannot delete quotation that is not in Draft, Pending, or Rejected status");
        }

        quotationRepository.delete(quotation);
    }

    @Transactional
    public SalesQuotationDto convertToSalesOrder(Integer quotationId) {
        SalesQuotation quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new RuntimeException("Sales Quotation not found"));

        if (!"Accepted".equals(quotation.getStatus())) {
            throw new RuntimeException("Quotation must be accepted before converting to Sales Order");
        }

        // This will be handled by SalesOrderService
        // For now, just return the quotation DTO
        return mapToDto(quotation);
    }

    private String generateQuotationNumber() {
        return "SQ-" + System.currentTimeMillis();
    }

    private SalesQuotationDto mapToDto(SalesQuotation quotation) {
        SalesQuotationDto dto = SalesQuotationDto.builder()
                .id(quotation.getId())
                .quotationNumber(quotation.getQuotationNumber())
                .quotationDate(quotation.getQuotationDate() != null ? quotation.getQuotationDate().toLocalDate() : null)
                .validUntilDate(quotation.getValidUntilDate())
                .customerId(quotation.getCustomer().getId())
                .customerNameAr(quotation.getCustomer().getCustomerNameAr())
                .customerCode(quotation.getCustomer().getCustomerCode())
                .contactId(quotation.getContactId())
                .salesRepId(quotation.getSalesRepId())
                .currency(quotation.getCurrency())
                .exchangeRate(quotation.getExchangeRate())
                .subTotal(quotation.getSubTotal())
                .discountPercentage(quotation.getDiscountPercentage())
                .discountAmount(quotation.getDiscountAmount())
                .taxAmount(quotation.getTaxAmount())
                .totalAmount(quotation.getTotalAmount())
                .paymentTerms(quotation.getPaymentTerms())
                .deliveryTerms(quotation.getDeliveryTerms())
                .status(quotation.getStatus())
                .approvalStatus(quotation.getApprovalStatus())
                .sentDate(quotation.getSentDate())
                .acceptedDate(quotation.getAcceptedDate())
                .rejectedReason(quotation.getRejectedReason())
                .notes(quotation.getNotes())
                .termsAndConditions(quotation.getTermsAndConditions())
                .createdAt(quotation.getCreatedAt())
                .createdBy(quotation.getCreatedBy())
                .updatedAt(quotation.getUpdatedAt())
                .updatedBy(quotation.getUpdatedBy())
                .build();

        if (quotation.getPriceList() != null) {
            dto.setPriceListId(quotation.getPriceList().getId());
            dto.setPriceListName(quotation.getPriceList().getPriceListName());
        }

        if (quotation.getItems() != null) {
            dto.setItems(quotation.getItems().stream()
                    .map(this::mapItemToDto)
                    .collect(Collectors.toList()));
        } else {
            dto.setItems(new ArrayList<>());
        }

        return dto;
    }

    private SalesQuotationItemDto mapItemToDto(SalesQuotationItem item) {
        return SalesQuotationItemDto.builder()
                .id(item.getId())
                .salesQuotationId(item.getSalesQuotation().getId())
                .itemId(item.getItem().getId())
                .itemCode(item.getItem().getItemCode())
                .itemNameAr(item.getItem().getItemNameAr())
                .itemNameEn(item.getItem().getItemNameEn())
                .description(item.getDescription())
                .quantity(item.getQuantity())
                .unitId(item.getUnit().getId())
                .unitNameAr(item.getUnit().getUnitNameAr())
                .unitPrice(item.getUnitPrice())
                .discountPercentage(item.getDiscountPercentage())
                .discountAmount(item.getDiscountAmount())
                .taxPercentage(item.getTaxPercentage())
                .taxAmount(item.getTaxAmount())
                .totalPrice(item.getTotalPrice())
                .notes(item.getNotes())
                .build();
    }

    private SalesQuotationItem mapItemToEntity(SalesQuotationItemDto dto, SalesQuotation quotation) {
        Item item = itemRepository.findById(dto.getItemId())
                .orElseThrow(() -> new RuntimeException("Item not found"));

        UnitOfMeasure unit = unitRepository.findById(dto.getUnitId())
                .orElseThrow(() -> new RuntimeException("Unit not found"));

        SalesQuotationItem entity = SalesQuotationItem.builder()
                .salesQuotation(quotation)
                .item(item)
                .description(dto.getDescription())
                .quantity(dto.getQuantity())
                .unit(unit)
                .unitPrice(dto.getUnitPrice())
                .discountPercentage(dto.getDiscountPercentage() != null ? dto.getDiscountPercentage() : BigDecimal.ZERO)
                .discountAmount(dto.getDiscountAmount() != null ? dto.getDiscountAmount() : BigDecimal.ZERO)
                .taxPercentage(dto.getTaxPercentage() != null ? dto.getTaxPercentage() : BigDecimal.ZERO)
                .taxAmount(dto.getTaxAmount() != null ? dto.getTaxAmount() : BigDecimal.ZERO)
                .totalPrice(dto.getTotalPrice())
                .notes(dto.getNotes())
                .build();

        return entity;
    }
}
