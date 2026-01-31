package com.rasras.erp.sales;

import com.rasras.erp.crm.Customer;
import com.rasras.erp.crm.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeliveryOrderService {

    private final DeliveryOrderRepository deliveryOrderRepository;
    private final StockIssueNoteRepository issueNoteRepository;
    private final CustomerRepository customerRepository;

    @Transactional(readOnly = true)
    public List<DeliveryOrderDto> getAll() {
        return deliveryOrderRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DeliveryOrderDto getById(Integer id) {
        return deliveryOrderRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException("Delivery Order not found"));
    }

    @Transactional(readOnly = true)
    public List<DeliveryOrderDto> getByIssueNoteId(Integer issueNoteId) {
        return deliveryOrderRepository.findByStockIssueNote_IdOrderByOrderDateDesc(issueNoteId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public DeliveryOrderDto createFromIssueNote(Integer issueNoteId, Integer createdByUserId) {
        StockIssueNote issueNote = issueNoteRepository.findById(issueNoteId)
                .orElseThrow(() -> new RuntimeException("Stock Issue Note not found"));

        if (!"Approved".equals(issueNote.getStatus())) {
            throw new RuntimeException("Issue Note must be Approved to create Delivery Order");
        }

        DeliveryOrder order = DeliveryOrder.builder()
                .deliveryOrderNumber(generateDeliveryOrderNumber())
                .orderDate(LocalDateTime.now())
                .stockIssueNote(issueNote)
                .customer(issueNote.getCustomer())
                .deliveryAddress(issueNote.getSalesOrder() != null ? issueNote.getSalesOrder().getShippingAddress() : null)
                .driverName(issueNote.getDriverName())
                .vehicleId(null)
                .status("Pending")
                .build();

        DeliveryOrder saved = deliveryOrderRepository.save(order);
        return mapToDto(saved);
    }

    @Transactional
    public DeliveryOrderDto create(DeliveryOrderDto dto) {
        StockIssueNote issueNote = issueNoteRepository.findById(dto.getIssueNoteId())
                .orElseThrow(() -> new RuntimeException("Stock Issue Note not found"));
        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        DeliveryOrder order = DeliveryOrder.builder()
                .deliveryOrderNumber(dto.getDeliveryOrderNumber() != null ? dto.getDeliveryOrderNumber() : generateDeliveryOrderNumber())
                .orderDate(dto.getOrderDate() != null ? dto.getOrderDate() : LocalDateTime.now())
                .stockIssueNote(issueNote)
                .customer(customer)
                .deliveryAddress(dto.getDeliveryAddress())
                .zoneId(dto.getZoneId())
                .deliveryType(dto.getDeliveryType())
                .vehicleId(dto.getVehicleId())
                .contractorId(dto.getContractorId())
                .driverName(dto.getDriverName())
                .driverPhone(dto.getDriverPhone())
                .scheduledDate(dto.getScheduledDate())
                .scheduledTime(dto.getScheduledTime())
                .actualDeliveryDate(dto.getActualDeliveryDate())
                .deliveryCost(dto.getDeliveryCost())
                .isCostOnCustomer(dto.getIsCostOnCustomer() != null ? dto.getIsCostOnCustomer() : false)
                .status(dto.getStatus() != null ? dto.getStatus() : "Pending")
                .receiverName(dto.getReceiverName())
                .receiverPhone(dto.getReceiverPhone())
                .receiverSignature(dto.getReceiverSignature())
                .podAttachmentPath(dto.getPodAttachmentPath())
                .notes(dto.getNotes())
                .build();

        DeliveryOrder saved = deliveryOrderRepository.save(order);
        return mapToDto(saved);
    }

    @Transactional
    public DeliveryOrderDto update(Integer id, DeliveryOrderDto dto) {
        DeliveryOrder order = deliveryOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Delivery Order not found"));

        order.setDeliveryAddress(dto.getDeliveryAddress());
        order.setZoneId(dto.getZoneId());
        order.setDeliveryType(dto.getDeliveryType());
        order.setVehicleId(dto.getVehicleId());
        order.setContractorId(dto.getContractorId());
        order.setDriverName(dto.getDriverName());
        order.setDriverPhone(dto.getDriverPhone());
        order.setScheduledDate(dto.getScheduledDate());
        order.setScheduledTime(dto.getScheduledTime());
        order.setActualDeliveryDate(dto.getActualDeliveryDate());
        order.setDeliveryCost(dto.getDeliveryCost());
        order.setIsCostOnCustomer(dto.getIsCostOnCustomer());
        order.setStatus(dto.getStatus());
        order.setReceiverName(dto.getReceiverName());
        order.setReceiverPhone(dto.getReceiverPhone());
        order.setReceiverSignature(dto.getReceiverSignature());
        order.setPodAttachmentPath(dto.getPodAttachmentPath());
        order.setNotes(dto.getNotes());
        order.setUpdatedBy(dto.getUpdatedBy() != null ? dto.getUpdatedBy() : 1);

        return mapToDto(deliveryOrderRepository.save(order));
    }

    @Transactional
    public void delete(Integer id) {
        DeliveryOrder order = deliveryOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Delivery Order not found"));
        if ("Delivered".equals(order.getStatus())) {
            throw new RuntimeException("Cannot delete a delivered order");
        }
        deliveryOrderRepository.delete(order);
    }

    private String generateDeliveryOrderNumber() {
        return "DO-" + System.currentTimeMillis();
    }

    private DeliveryOrderDto mapToDto(DeliveryOrder order) {
        return DeliveryOrderDto.builder()
                .id(order.getId())
                .deliveryOrderNumber(order.getDeliveryOrderNumber())
                .orderDate(order.getOrderDate())
                .issueNoteId(order.getStockIssueNote().getId())
                .issueNoteNumber(order.getStockIssueNote().getIssueNoteNumber())
                .customerId(order.getCustomer().getId())
                .customerNameAr(order.getCustomer().getCustomerNameAr())
                .customerCode(order.getCustomer().getCustomerCode())
                .deliveryAddress(order.getDeliveryAddress())
                .zoneId(order.getZoneId())
                .deliveryType(order.getDeliveryType())
                .vehicleId(order.getVehicleId())
                .contractorId(order.getContractorId())
                .driverName(order.getDriverName())
                .driverPhone(order.getDriverPhone())
                .scheduledDate(order.getScheduledDate())
                .scheduledTime(order.getScheduledTime())
                .actualDeliveryDate(order.getActualDeliveryDate())
                .deliveryCost(order.getDeliveryCost())
                .isCostOnCustomer(order.getIsCostOnCustomer())
                .status(order.getStatus())
                .receiverName(order.getReceiverName())
                .receiverPhone(order.getReceiverPhone())
                .receiverSignature(order.getReceiverSignature())
                .podAttachmentPath(order.getPodAttachmentPath())
                .notes(order.getNotes())
                .createdAt(order.getCreatedAt())
                .createdBy(order.getCreatedBy())
                .updatedAt(order.getUpdatedAt())
                .updatedBy(order.getUpdatedBy())
                .build();
    }
}
