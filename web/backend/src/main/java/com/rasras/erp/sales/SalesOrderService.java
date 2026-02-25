package com.rasras.erp.sales;

import com.rasras.erp.crm.Customer;
import com.rasras.erp.crm.CustomerRepository;
import com.rasras.erp.inventory.Item;
import com.rasras.erp.inventory.ItemRepository;
import com.rasras.erp.inventory.PriceList;
import com.rasras.erp.inventory.PriceListRepository;
import com.rasras.erp.inventory.UnitOfMeasure;
import com.rasras.erp.inventory.UnitRepository;
import com.rasras.erp.inventory.Warehouse;
import com.rasras.erp.inventory.WarehouseRepository;
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
public class SalesOrderService {

    private final SalesOrderRepository orderRepository;
    private final SalesQuotationRepository quotationRepository;
    private final CustomerRepository customerRepository;
    private final ItemRepository itemRepository;
    private final UnitRepository unitRepository;
    private final PriceListRepository priceListRepository;
    private final WarehouseRepository warehouseRepository;
    private final ApprovalService approvalService;

    @Transactional(readOnly = true)
    public List<SalesOrderDto> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SalesOrderDto getOrderById(Integer id) {
        return orderRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException("Sales Order not found"));
    }

    @Transactional
    public SalesOrderDto createOrder(SalesOrderDto dto) {
        SalesOrder order = new SalesOrder();
        order.setSoNumber(generateOrderNumber());
        order.setSoDate(dto.getSoDate() != null ? dto.getSoDate().atStartOfDay() : LocalDateTime.now());

        if (dto.getSalesQuotationId() != null) {
            SalesQuotation quotation = quotationRepository.findById(dto.getSalesQuotationId())
                    .orElse(null);
            order.setSalesQuotation(quotation);
        }

        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        order.setCustomer(customer);

        order.setContactId(dto.getContactId());
        order.setSalesRepId(dto.getSalesRepId());
        order.setShippingAddress(dto.getShippingAddress());
        order.setExpectedDeliveryDate(dto.getExpectedDeliveryDate());
        order.setCurrency(dto.getCurrency() != null ? dto.getCurrency() : "EGP");
        order.setExchangeRate(dto.getExchangeRate() != null ? dto.getExchangeRate() : BigDecimal.ONE);

        if (dto.getPriceListId() != null) {
            PriceList priceList = priceListRepository.findById(dto.getPriceListId())
                    .orElse(null);
            order.setPriceList(priceList);
        }

        order.setSubTotal(dto.getSubTotal() != null ? dto.getSubTotal() : BigDecimal.ZERO);
        order.setTaxAmount(dto.getTaxAmount() != null ? dto.getTaxAmount() : BigDecimal.ZERO);
        order.setDeliveryCost(dto.getDeliveryCost() != null ? dto.getDeliveryCost() : BigDecimal.ZERO);
        order.setOtherCosts(dto.getOtherCosts() != null ? dto.getOtherCosts() : BigDecimal.ZERO);
        order.setTotalAmount(dto.getTotalAmount() != null ? dto.getTotalAmount() : BigDecimal.ZERO);
        order.setPaymentTerms(dto.getPaymentTerms());
        order.setPaymentTermDays(dto.getPaymentTermDays());
        order.setStatus(dto.getStatus() != null ? dto.getStatus() : "Draft");
        order.setApprovalStatus(dto.getApprovalStatus() != null ? dto.getApprovalStatus() : "Pending");
        order.setNotes(dto.getNotes());
        order.setCreatedBy(dto.getCreatedBy() != null ? dto.getCreatedBy() : 1);

        // Handle Items
        if (dto.getItems() != null && !dto.getItems().isEmpty()) {
            List<SalesOrderItem> items = new ArrayList<>();
            for (SalesOrderItemDto itemDto : dto.getItems()) {
                SalesOrderItem item = mapItemToEntity(itemDto, order);
                items.add(item);
            }
            order.setItems(items);
        }

        SalesOrder saved = orderRepository.save(order);
        return mapToDto(saved);
    }

    @Transactional
    public SalesOrderDto createOrderFromQuotation(Integer quotationId) {
        SalesQuotation quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new RuntimeException("Sales Quotation not found"));

        if (!"Accepted".equals(quotation.getStatus())) {
            throw new RuntimeException("Quotation must be accepted before creating Sales Order");
        }

        SalesOrderDto orderDto = SalesOrderDto.builder()
                .salesQuotationId(quotation.getId())
                .quotationNumber(quotation.getQuotationNumber())
                .customerId(quotation.getCustomer().getId())
                .customerNameAr(quotation.getCustomer().getCustomerNameAr())
                .customerCode(quotation.getCustomer().getCustomerCode())
                .contactId(quotation.getContactId())
                .salesRepId(quotation.getSalesRepId())
                .currency(quotation.getCurrency())
                .exchangeRate(quotation.getExchangeRate())
                .priceListId(quotation.getPriceList() != null ? quotation.getPriceList().getId() : null)
                .subTotal(quotation.getSubTotal())
                .taxAmount(quotation.getTaxAmount())
                .deliveryCost(quotation.getDeliveryCost())
                .otherCosts(quotation.getOtherCosts())
                .totalAmount(quotation.getTotalAmount())
                .paymentTerms(quotation.getPaymentTerms())
                .status("Draft")
                .notes(quotation.getNotes())
                .items(quotation.getItems() != null ? quotation.getItems().stream()
                        .map(item -> SalesOrderItemDto.builder()
                                .itemId(item.getItem().getId())
                                .itemCode(item.getItem().getItemCode())
                                .itemNameAr(item.getItem().getItemNameAr())
                                .itemNameEn(item.getItem().getItemNameEn())
                                .description(item.getDescription())
                                .orderedQty(item.getQuantity())
                                .unitId(item.getUnit().getId())
                                .unitNameAr(item.getUnit().getUnitNameAr())
                                .unitPrice(item.getUnitPrice())
                                .discountPercentage(item.getDiscountPercentage())
                                .discountAmount(item.getDiscountAmount())
                                .taxPercentage(item.getTaxPercentage())
                                .taxAmount(item.getTaxAmount())
                                .totalPrice(item.getTotalPrice())
                                .status("Pending")
                                .notes(item.getNotes())
                                .build())
                        .collect(Collectors.toList()) : new ArrayList<>())
                .build();

        return createOrder(orderDto);
    }

    @Transactional
    public SalesOrderDto updateOrder(Integer id, SalesOrderDto dto) {
        SalesOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sales Order not found"));

        if (!"Draft".equals(order.getStatus()) && !"Rejected".equals(order.getStatus())) {
            throw new RuntimeException("Cannot edit order that is not in Draft or Rejected status");
        }

        // Reset approval status if rejected and being edited
        if ("Rejected".equals(order.getStatus())) {
            order.setApprovalStatus("Pending");
        }

        order.setExpectedDeliveryDate(dto.getExpectedDeliveryDate());
        order.setShippingAddress(dto.getShippingAddress());
        order.setCurrency(dto.getCurrency());
        order.setExchangeRate(dto.getExchangeRate());
        order.setSubTotal(dto.getSubTotal());
        order.setTaxAmount(dto.getTaxAmount());
        order.setDeliveryCost(dto.getDeliveryCost());
        order.setOtherCosts(dto.getOtherCosts());
        order.setTotalAmount(dto.getTotalAmount());
        order.setPaymentTerms(dto.getPaymentTerms());
        order.setPaymentTermDays(dto.getPaymentTermDays());
        order.setNotes(dto.getNotes());
        order.setUpdatedBy(dto.getUpdatedBy() != null ? dto.getUpdatedBy() : 1);

        // Update Items - clear and recreate
        if (order.getItems() != null) {
            order.getItems().clear();
        } else {
            order.setItems(new ArrayList<>());
        }

        if (dto.getItems() != null) {
            for (SalesOrderItemDto itemDto : dto.getItems()) {
                SalesOrderItem item = mapItemToEntity(itemDto, order);
                order.getItems().add(item);
            }
        }

        return mapToDto(orderRepository.save(order));
    }

    @Transactional
    public SalesOrderDto submitForApproval(Integer id) {
        SalesOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sales Order not found"));

        if (!"Draft".equals(order.getStatus()) && !"Rejected".equals(order.getStatus())) {
            throw new RuntimeException("Sales Order must be in Draft or Rejected status to submit");
        }

        order.setStatus("Pending");
        SalesOrder saved = orderRepository.save(order);

        // Initiate approval workflow
        approvalService.initiateApproval("SO_APPROVAL", "SalesOrder", saved.getId(),
                saved.getSoNumber(), saved.getCreatedBy() != null ? saved.getCreatedBy() : 1,
                saved.getTotalAmount());

        return mapToDto(saved);
    }

    @Transactional
    public void deleteOrder(Integer id) {
        SalesOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sales Order not found"));

        if (!"Draft".equals(order.getStatus()) && !"Pending".equals(order.getStatus())
                && !"Rejected".equals(order.getStatus())) {
            throw new RuntimeException("Cannot delete order that is not in Draft, Pending, or Rejected status");
        }

        orderRepository.delete(order);
    }

    @Transactional
    public SalesOrderDto checkCreditLimit(Integer orderId) {
        SalesOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Sales Order not found"));

        // Credit check logic - check customer's credit limit
        Customer customer = order.getCustomer();
        BigDecimal currentBalance = customer.getCurrentBalance() != null ? customer.getCurrentBalance()
                : BigDecimal.ZERO;
        BigDecimal creditLimit = customer.getCreditLimit() != null ? customer.getCreditLimit() : BigDecimal.ZERO;
        BigDecimal availableCredit = creditLimit.subtract(currentBalance);

        if (order.getTotalAmount().compareTo(availableCredit) > 0) {
            order.setCreditCheckStatus("Rejected");
            throw new RuntimeException("Order amount exceeds available credit limit");
        }

        order.setCreditCheckStatus("Approved");
        order.setCreditCheckDate(LocalDateTime.now());
        // creditCheckBy should be set from security context

        return mapToDto(orderRepository.save(order));
    }

    private String generateOrderNumber() {
        return "SO-" + System.currentTimeMillis();
    }

    private SalesOrderDto mapToDto(SalesOrder order) {
        SalesOrderDto dto = SalesOrderDto.builder()
                .id(order.getId())
                .soNumber(order.getSoNumber())
                .soDate(order.getSoDate() != null ? order.getSoDate().toLocalDate() : null)
                .customerId(order.getCustomer().getId())
                .customerNameAr(order.getCustomer().getCustomerNameAr())
                .customerCode(order.getCustomer().getCustomerCode())
                .contactId(order.getContactId())
                .salesRepId(order.getSalesRepId())
                .shippingAddress(order.getShippingAddress())
                .expectedDeliveryDate(order.getExpectedDeliveryDate())
                .currency(order.getCurrency())
                .exchangeRate(order.getExchangeRate())
                .subTotal(order.getSubTotal())
                .taxAmount(order.getTaxAmount())
                .deliveryCost(order.getDeliveryCost())
                .otherCosts(order.getOtherCosts())
                .totalAmount(order.getTotalAmount())
                .paymentTerms(order.getPaymentTerms())
                .paymentTermDays(order.getPaymentTermDays())
                .status(order.getStatus())
                .approvalStatus(order.getApprovalStatus())
                .creditCheckStatus(order.getCreditCheckStatus())
                .creditCheckBy(order.getCreditCheckBy())
                .creditCheckDate(order.getCreditCheckDate())
                .approvedByUserId(order.getApprovedByUserId())
                .approvedDate(order.getApprovedDate())
                .notes(order.getNotes())
                .createdAt(order.getCreatedAt())
                .createdBy(order.getCreatedBy())
                .updatedAt(order.getUpdatedAt())
                .updatedBy(order.getUpdatedBy())
                .build();

        if (order.getSalesQuotation() != null) {
            dto.setSalesQuotationId(order.getSalesQuotation().getId());
            dto.setQuotationNumber(order.getSalesQuotation().getQuotationNumber());
        }

        if (order.getPriceList() != null) {
            dto.setPriceListId(order.getPriceList().getId());
            dto.setPriceListName(order.getPriceList().getPriceListName());
        }

        if (order.getItems() != null) {
            dto.setItems(order.getItems().stream()
                    .map(this::mapItemToDto)
                    .collect(Collectors.toList()));
        } else {
            dto.setItems(new ArrayList<>());
        }

        return dto;
    }

    private SalesOrderItemDto mapItemToDto(SalesOrderItem item) {
        SalesOrderItemDto dto = SalesOrderItemDto.builder()
                .id(item.getId())
                .salesOrderId(item.getSalesOrder().getId())
                .itemId(item.getItem().getId())
                .itemCode(item.getItem().getItemCode())
                .itemNameAr(item.getItem().getItemNameAr())
                .itemNameEn(item.getItem().getItemNameEn())
                .description(item.getDescription())
                .orderedQty(item.getOrderedQty())
                .unitId(item.getUnit().getId())
                .unitNameAr(item.getUnit().getUnitNameAr())
                .unitPrice(item.getUnitPrice())
                .unitCost(item.getUnitCost())
                .discountPercentage(item.getDiscountPercentage())
                .discountAmount(item.getDiscountAmount())
                .taxPercentage(item.getTaxPercentage())
                .taxAmount(item.getTaxAmount())
                .totalPrice(item.getTotalPrice())
                .deliveredQty(item.getDeliveredQty())
                .status(item.getStatus())
                .notes(item.getNotes())
                .build();

        if (item.getWarehouse() != null) {
            dto.setWarehouseId(item.getWarehouse().getId());
            dto.setWarehouseName(item.getWarehouse().getWarehouseNameAr());
        }

        return dto;
    }

    private SalesOrderItem mapItemToEntity(SalesOrderItemDto dto, SalesOrder order) {
        Item item = itemRepository.findById(dto.getItemId())
                .orElseThrow(() -> new RuntimeException("Item not found"));

        UnitOfMeasure unit = unitRepository.findById(dto.getUnitId())
                .orElseThrow(() -> new RuntimeException("Unit not found"));

        SalesOrderItem entity = SalesOrderItem.builder()
                .salesOrder(order)
                .item(item)
                .description(dto.getDescription())
                .orderedQty(dto.getOrderedQty())
                .unit(unit)
                .unitPrice(dto.getUnitPrice())
                .unitCost(dto.getUnitCost())
                .discountPercentage(dto.getDiscountPercentage() != null ? dto.getDiscountPercentage() : BigDecimal.ZERO)
                .discountAmount(dto.getDiscountAmount() != null ? dto.getDiscountAmount() : BigDecimal.ZERO)
                .taxPercentage(dto.getTaxPercentage() != null ? dto.getTaxPercentage() : BigDecimal.ZERO)
                .taxAmount(dto.getTaxAmount() != null ? dto.getTaxAmount() : BigDecimal.ZERO)
                .totalPrice(dto.getTotalPrice())
                .deliveredQty(dto.getDeliveredQty() != null ? dto.getDeliveredQty() : BigDecimal.ZERO)
                .status(dto.getStatus() != null ? dto.getStatus() : "Pending")
                .notes(dto.getNotes())
                .build();

        if (dto.getWarehouseId() != null) {
            Warehouse warehouse = warehouseRepository.findById(dto.getWarehouseId())
                    .orElse(null);
            entity.setWarehouse(warehouse);
        }

        return entity;
    }
}
