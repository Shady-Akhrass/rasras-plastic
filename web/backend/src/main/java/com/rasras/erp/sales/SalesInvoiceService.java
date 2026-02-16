package com.rasras.erp.sales;

import com.rasras.erp.crm.Customer;
import com.rasras.erp.crm.CustomerRepository;
import com.rasras.erp.inventory.Item;
import com.rasras.erp.inventory.ItemRepository;
import com.rasras.erp.inventory.UnitOfMeasure;
import com.rasras.erp.inventory.UnitRepository;
import com.rasras.erp.approval.ApprovalService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalesInvoiceService {

    private final SalesInvoiceRepository invoiceRepository;
    private final SalesOrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ItemRepository itemRepository;
    private final UnitRepository unitRepository;
    private final ApprovalService approvalService;

    @Transactional(readOnly = true)
    public List<SalesInvoiceDto> getAllInvoices() {
        return invoiceRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SalesInvoiceDto getInvoiceById(Integer id) {
        return invoiceRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException("Sales Invoice not found"));
    }

    @Transactional
    public SalesInvoiceDto createInvoice(SalesInvoiceDto dto) {
        SalesInvoice invoice = new SalesInvoice();
        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setInvoiceDate(
                dto.getInvoiceDate() != null ? dto.getInvoiceDate().atStartOfDay() : LocalDateTime.now());
        invoice.setDueDate(dto.getDueDate() != null ? dto.getDueDate() : LocalDate.now().plusDays(30));

        if (dto.getSalesOrderId() != null) {
            SalesOrder order = orderRepository.findById(dto.getSalesOrderId())
                    .orElse(null);
            invoice.setSalesOrder(order);
        }

        invoice.setIssueNoteId(dto.getIssueNoteId());

        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        invoice.setCustomer(customer);

        invoice.setSalesRepId(dto.getSalesRepId());
        invoice.setCurrency(dto.getCurrency() != null ? dto.getCurrency() : "EGP");
        invoice.setExchangeRate(dto.getExchangeRate() != null ? dto.getExchangeRate() : BigDecimal.ONE);
        invoice.setSubTotal(dto.getSubTotal() != null ? dto.getSubTotal() : BigDecimal.ZERO);
        invoice.setDiscountPercentage(
                dto.getDiscountPercentage() != null ? dto.getDiscountPercentage() : BigDecimal.ZERO);
        invoice.setDiscountAmount(dto.getDiscountAmount() != null ? dto.getDiscountAmount() : BigDecimal.ZERO);
        invoice.setTaxAmount(dto.getTaxAmount() != null ? dto.getTaxAmount() : BigDecimal.ZERO);
        invoice.setShippingCost(dto.getShippingCost() != null ? dto.getShippingCost() : BigDecimal.ZERO);
        invoice.setTotalAmount(dto.getTotalAmount() != null ? dto.getTotalAmount() : BigDecimal.ZERO);
        invoice.setPaidAmount(dto.getPaidAmount() != null ? dto.getPaidAmount() : BigDecimal.ZERO);
        invoice.setStatus(dto.getStatus() != null ? dto.getStatus() : "Draft");
        invoice.setApprovalStatus(dto.getApprovalStatus() != null ? dto.getApprovalStatus() : "Pending");
        invoice.setPaymentTerms(dto.getPaymentTerms());
        invoice.setNotes(dto.getNotes());
        invoice.setCreatedBy(dto.getCreatedBy() != null ? dto.getCreatedBy() : 1);

        if (dto.getItems() != null && !dto.getItems().isEmpty()) {
            List<SalesInvoiceItem> items = new ArrayList<>();
            for (SalesInvoiceItemDto itemDto : dto.getItems()) {
                SalesInvoiceItem item = mapItemToEntity(itemDto, invoice);
                items.add(item);
            }
            invoice.setItems(items);
        }

        SalesInvoice saved = invoiceRepository.save(invoice);
        return mapToDto(saved);
    }

    @Transactional
    public SalesInvoiceDto updateInvoice(Integer id, SalesInvoiceDto dto) {
        SalesInvoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sales Invoice not found"));

        if (!"Draft".equals(invoice.getStatus()) && !"Rejected".equals(invoice.getStatus())) {
            throw new RuntimeException("Cannot edit invoice that is not in Draft or Rejected status");
        }

        // Reset approval status if rejected and being edited
        if ("Rejected".equals(invoice.getStatus())) {
            invoice.setApprovalStatus("Pending");
        }

        invoice.setDueDate(dto.getDueDate());
        invoice.setSubTotal(dto.getSubTotal());
        invoice.setDiscountPercentage(dto.getDiscountPercentage());
        invoice.setDiscountAmount(dto.getDiscountAmount());
        invoice.setTaxAmount(dto.getTaxAmount());
        invoice.setShippingCost(dto.getShippingCost());
        invoice.setTotalAmount(dto.getTotalAmount());
        invoice.setPaymentTerms(dto.getPaymentTerms());
        invoice.setNotes(dto.getNotes());
        invoice.setUpdatedBy(dto.getUpdatedBy() != null ? dto.getUpdatedBy() : 1);

        if (invoice.getItems() != null) {
            invoice.getItems().clear();
        } else {
            invoice.setItems(new ArrayList<>());
        }

        if (dto.getItems() != null) {
            for (SalesInvoiceItemDto itemDto : dto.getItems()) {
                SalesInvoiceItem item = mapItemToEntity(itemDto, invoice);
                invoice.getItems().add(item);
            }
        }

        return mapToDto(invoiceRepository.save(invoice));
    }

    @Transactional
    public SalesInvoiceDto submitForApproval(Integer id) {
        SalesInvoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sales Invoice not found"));

        if (!"Draft".equals(invoice.getStatus()) && !"Rejected".equals(invoice.getStatus())) {
            throw new RuntimeException("Sales Invoice must be in Draft or Rejected status to submit");
        }

        invoice.setStatus("Pending");
        SalesInvoice saved = invoiceRepository.save(invoice);

        // Initiate approval workflow
        approvalService.initiateApproval("INVOICE_APPROVAL", "SalesInvoice", saved.getId(),
                saved.getInvoiceNumber(), saved.getCreatedBy() != null ? saved.getCreatedBy() : 1,
                saved.getTotalAmount());

        return mapToDto(saved);
    }

    @Transactional
    public void deleteInvoice(Integer id) {
        SalesInvoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sales Invoice not found"));

        if (!"Draft".equals(invoice.getStatus()) && !"Pending".equals(invoice.getStatus()) && !"Rejected".equals(invoice.getStatus())) {
            throw new RuntimeException("Cannot delete invoice that is not in Draft, Pending, or Rejected status");
        }

        invoiceRepository.delete(invoice);
    }

    private String generateInvoiceNumber() {
        return "INV-" + System.currentTimeMillis();
    }

    private SalesInvoiceDto mapToDto(SalesInvoice invoice) {
        SalesInvoiceDto dto = SalesInvoiceDto.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .invoiceDate(invoice.getInvoiceDate() != null ? invoice.getInvoiceDate().toLocalDate() : null)
                .dueDate(invoice.getDueDate())
                .issueNoteId(invoice.getIssueNoteId())
                .customerId(invoice.getCustomer().getId())
                .customerNameAr(invoice.getCustomer().getCustomerNameAr())
                .customerCode(invoice.getCustomer().getCustomerCode())
                .salesRepId(invoice.getSalesRepId())
                .currency(invoice.getCurrency())
                .exchangeRate(invoice.getExchangeRate())
                .subTotal(invoice.getSubTotal())
                .discountPercentage(invoice.getDiscountPercentage())
                .discountAmount(invoice.getDiscountAmount())
                .taxAmount(invoice.getTaxAmount())
                .shippingCost(invoice.getShippingCost())
                .totalAmount(invoice.getTotalAmount())
                .paidAmount(invoice.getPaidAmount())
                .remainingAmount(invoice.getTotalAmount().subtract(invoice.getPaidAmount()))
                .status(invoice.getStatus())
                .approvalStatus(invoice.getApprovalStatus())
                .eInvoiceStatus(invoice.getEInvoiceStatus())
                .eInvoiceUUID(invoice.getEInvoiceUUID())
                .paymentTerms(invoice.getPaymentTerms())
                .notes(invoice.getNotes())
                .createdAt(invoice.getCreatedAt())
                .createdBy(invoice.getCreatedBy())
                .updatedAt(invoice.getUpdatedAt())
                .updatedBy(invoice.getUpdatedBy())
                .build();

        if (invoice.getSalesOrder() != null) {
            dto.setSalesOrderId(invoice.getSalesOrder().getId());
            dto.setSoNumber(invoice.getSalesOrder().getSoNumber());
        }

        if (invoice.getItems() != null) {
            dto.setItems(invoice.getItems().stream()
                    .map(this::mapItemToDto)
                    .collect(Collectors.toList()));
        } else {
            dto.setItems(new ArrayList<>());
        }

        return dto;
    }

    private SalesInvoiceItemDto mapItemToDto(SalesInvoiceItem item) {
        return SalesInvoiceItemDto.builder()
                .id(item.getId())
                .salesInvoiceId(item.getSalesInvoice().getId())
                .issueItemId(item.getIssueItemId())
                .itemId(item.getItem().getId())
                .itemCode(item.getItem().getItemCode())
                .itemNameAr(item.getItem().getItemNameAr())
                .itemNameEn(item.getItem().getItemNameEn())
                .description(item.getDescription())
                .quantity(item.getQuantity())
                .unitId(item.getUnit().getId())
                .unitNameAr(item.getUnit().getUnitNameAr())
                .unitPrice(item.getUnitPrice())
                .unitCost(item.getUnitCost())
                .discountPercentage(item.getDiscountPercentage())
                .discountAmount(item.getDiscountAmount())
                .taxPercentage(item.getTaxPercentage())
                .taxAmount(item.getTaxAmount())
                .totalPrice(item.getTotalPrice())
                .grossProfit(item.getTotalPrice().subtract(
                        item.getQuantity().multiply(item.getUnitCost() != null ? item.getUnitCost() : BigDecimal.ZERO)))
                .build();
    }

    private SalesInvoiceItem mapItemToEntity(SalesInvoiceItemDto dto, SalesInvoice invoice) {
        Item item = itemRepository.findById(dto.getItemId())
                .orElseThrow(() -> new RuntimeException("Item not found"));

        UnitOfMeasure unit = unitRepository.findById(dto.getUnitId())
                .orElseThrow(() -> new RuntimeException("Unit not found"));

        return SalesInvoiceItem.builder()
                .salesInvoice(invoice)
                .issueItemId(dto.getIssueItemId())
                .item(item)
                .description(dto.getDescription())
                .quantity(dto.getQuantity())
                .unit(unit)
                .unitPrice(dto.getUnitPrice())
                .unitCost(dto.getUnitCost())
                .discountPercentage(dto.getDiscountPercentage() != null ? dto.getDiscountPercentage() : BigDecimal.ZERO)
                .discountAmount(dto.getDiscountAmount() != null ? dto.getDiscountAmount() : BigDecimal.ZERO)
                .taxPercentage(dto.getTaxPercentage() != null ? dto.getTaxPercentage() : BigDecimal.ZERO)
                .taxAmount(dto.getTaxAmount() != null ? dto.getTaxAmount() : BigDecimal.ZERO)
                .totalPrice(dto.getTotalPrice())
                .build();
    }
}
