package com.rasras.erp.sales;

import com.rasras.erp.crm.Customer;
import com.rasras.erp.crm.CustomerRepository;
import com.rasras.erp.approval.ApprovalService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeliveryOrderService {

        private final DeliveryOrderRepository deliveryOrderRepository;
        private final StockIssueNoteRepository issueNoteRepository;
        private final CustomerRepository customerRepository;
        private final SalesOrderRepository salesOrderRepository;
        private final SalesQuotationRepository salesQuotationRepository;
        private final CustomerRequestDeliveryScheduleRepository scheduleRepository;
        private final ApprovalService approvalService;

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
        public DeliveryOrderDto createFromIssueNote(Integer issueNoteId, Integer scheduleId, Integer createdByUserId) {
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
                                .deliveryAddress(
                                                issueNote.getSalesOrder() != null
                                                                ? issueNote.getSalesOrder().getShippingAddress()
                                                                : null)
                                .driverName(issueNote.getDriverName())
                                .vehicleId(null)
                                .scheduleId(scheduleId)
                                .deliveryCost(issueNote.getSalesOrder() != null
                                                ? issueNote.getSalesOrder().getDeliveryCost()
                                                : null)
                                .otherCosts(issueNote.getSalesOrder() != null
                                                ? issueNote.getSalesOrder().getOtherCosts()
                                                : null)
                                .status("Draft")
                                .build();

                DeliveryOrder saved = deliveryOrderRepository.save(order);
                syncCostsToLinkedDocuments(saved);
                if (scheduleId != null) {
                        syncScheduleStatuses(saved, java.util.Collections.singletonList(scheduleId));
                }
                return mapToDto(saved);
        }

        @Transactional
        public DeliveryOrderDto create(DeliveryOrderDto dto) {
                StockIssueNote issueNote = issueNoteRepository.findById(dto.getIssueNoteId())
                                .orElseThrow(() -> new RuntimeException("Stock Issue Note not found"));
                Customer customer = customerRepository.findById(dto.getCustomerId())
                                .orElseThrow(() -> new RuntimeException("Customer not found"));

                DeliveryOrder order = DeliveryOrder.builder()
                                .deliveryOrderNumber(dto.getDeliveryOrderNumber() != null ? dto.getDeliveryOrderNumber()
                                                : generateDeliveryOrderNumber())
                                .orderDate(dto.getOrderDate() != null ? dto.getOrderDate().atStartOfDay()
                                                : LocalDateTime.now())
                                .stockIssueNote(issueNote)
                                .customer(customer)
                                .deliveryAddress(dto.getDeliveryAddress())
                                .zoneId(dto.getZoneId())
                                .deliveryType(dto.getDeliveryType())
                                .vehicleId(dto.getVehicleId())
                                .scheduleId(dto.getScheduleId())
                                .contractorId(dto.getContractorId())
                                .driverName(dto.getDriverName())
                                .driverPhone(dto.getDriverPhone())
                                .scheduledDate(dto.getScheduledDate())
                                .scheduledTime(dto.getScheduledTime())
                                .actualDeliveryDate(
                                                dto.getActualDeliveryDate() != null
                                                                ? dto.getActualDeliveryDate().atStartOfDay()
                                                                : null)
                                .deliveryCost(dto.getDeliveryCost())
                                .otherCosts(dto.getOtherCosts())
                                .isCostOnCustomer(dto.getIsCostOnCustomer() != null ? dto.getIsCostOnCustomer() : false)
                                .status(dto.getStatus() != null ? dto.getStatus() : "Pending")
                                .approvalStatus(dto.getApprovalStatus() != null ? dto.getApprovalStatus() : "Pending")
                                .receiverName(dto.getReceiverName())
                                .receiverPhone(dto.getReceiverPhone())
                                .receiverSignature(dto.getReceiverSignature())
                                .podAttachmentPath(dto.getPodAttachmentPath())
                                .notes(dto.getNotes())
                                .build();

                DeliveryOrder saved = deliveryOrderRepository.save(order);
                syncCostsToLinkedDocuments(saved);
                syncScheduleStatuses(saved, dto.getSelectedScheduleIds());
                return mapToDto(saved);
        }

        @Transactional
        public DeliveryOrderDto update(Integer id, DeliveryOrderDto dto) {
                DeliveryOrder order = deliveryOrderRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Delivery Order not found"));

                if (!"Draft".equals(order.getStatus()) && !"Pending".equals(order.getStatus())
                                && !"Rejected".equals(order.getStatus())) {
                        throw new RuntimeException(
                                        "Cannot edit delivery order that is not in Draft, Pending, or Rejected status");
                }

                if ("Rejected".equals(order.getStatus())) {
                        order.setApprovalStatus("Pending");
                }

                order.setDeliveryAddress(dto.getDeliveryAddress());
                order.setZoneId(dto.getZoneId());
                order.setDeliveryType(dto.getDeliveryType());
                order.setVehicleId(dto.getVehicleId());
                order.setContractorId(dto.getContractorId());
                order.setDriverName(dto.getDriverName());
                order.setDriverPhone(dto.getDriverPhone());
                order.setScheduledDate(dto.getScheduledDate());
                order.setScheduledTime(dto.getScheduledTime());
                order.setActualDeliveryDate(
                                dto.getActualDeliveryDate() != null ? dto.getActualDeliveryDate().atStartOfDay()
                                                : null);
                order.setDeliveryCost(dto.getDeliveryCost());
                order.setOtherCosts(dto.getOtherCosts());
                order.setIsCostOnCustomer(dto.getIsCostOnCustomer());
                order.setStatus(dto.getStatus());
                order.setReceiverName(dto.getReceiverName());
                order.setReceiverPhone(dto.getReceiverPhone());
                order.setReceiverSignature(dto.getReceiverSignature());
                order.setPodAttachmentPath(dto.getPodAttachmentPath());
                order.setNotes(dto.getNotes());
                order.setUpdatedBy(dto.getUpdatedBy() != null ? dto.getUpdatedBy() : 1);

                DeliveryOrder saved = deliveryOrderRepository.save(order);
                syncCostsToLinkedDocuments(saved);
                syncScheduleStatuses(saved, dto.getSelectedScheduleIds());
                return mapToDto(saved);
        }

        @Transactional
        public DeliveryOrderDto submitForApproval(Integer id) {
                DeliveryOrder order = deliveryOrderRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Delivery Order not found"));

                if (!"Draft".equals(order.getStatus()) && !"Rejected".equals(order.getStatus())) {
                        throw new RuntimeException(
                                        "Delivery Order must be in Draft or Rejected status to submit. Current status: "
                                                        + order.getStatus());
                }

                order.setStatus("Pending");
                DeliveryOrder saved = deliveryOrderRepository.save(order);

                approvalService.initiateApproval("DELIVERY_APPROVAL", "DeliveryOrder", saved.getId(),
                                saved.getDeliveryOrderNumber(), saved.getCreatedBy() != null ? saved.getCreatedBy() : 1,
                                saved.getDeliveryCost() != null ? saved.getDeliveryCost() : BigDecimal.ZERO);

                return mapToDto(saved);
        }

        @Transactional
        public void delete(Integer id) {
                DeliveryOrder order = deliveryOrderRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Delivery Order not found"));
                if (!"Draft".equals(order.getStatus()) && !"Pending".equals(order.getStatus())
                                && !"Rejected".equals(order.getStatus())) {
                        throw new RuntimeException(
                                        "Cannot delete delivery order that is not in Draft, Pending, or Rejected status");
                }
                SalesOrder so = order.getStockIssueNote() != null ? order.getStockIssueNote().getSalesOrder() : null;
                SalesQuotation sq = so != null ? so.getSalesQuotation() : null;

                resetScheduleStatuses(order.getId());
                deliveryOrderRepository.delete(order);

                if (so != null) {
                        updateSalesOrderCosts(so.getId());
                }
                if (sq != null) {
                        updateSalesQuotationCosts(sq.getId());
                }
        }

        private void syncCostsToLinkedDocuments(DeliveryOrder order) {
                if (order.getStockIssueNote() == null || order.getStockIssueNote().getSalesOrder() == null) {
                        return;
                }

                SalesOrder so = order.getStockIssueNote().getSalesOrder();
                updateSalesOrderCosts(so.getId());

                if (so.getSalesQuotation() != null) {
                        updateSalesQuotationCosts(so.getSalesQuotation().getId());
                }
        }

        private void updateSalesOrderCosts(Integer soId) {
                SalesOrder so = salesOrderRepository.findById(soId).orElse(null);
                if (so == null)
                        return;

                List<DeliveryOrder> dos = deliveryOrderRepository.findByStockIssueNote_SalesOrder_Id(soId);

                BigDecimal totalDeliv = dos.stream()
                                .map(d -> d.getDeliveryCost() != null ? d.getDeliveryCost() : BigDecimal.ZERO)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal totalOther = dos.stream()
                                .map(d -> d.getOtherCosts() != null ? d.getOtherCosts() : BigDecimal.ZERO)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                so.setDeliveryCost(totalDeliv);
                so.setOtherCosts(totalOther);
                so.recalculateTotal();
                salesOrderRepository.save(so);
        }

        private void updateSalesQuotationCosts(Integer sqId) {
                SalesQuotation sq = salesQuotationRepository.findById(sqId).orElse(null);
                if (sq == null)
                        return;

                List<DeliveryOrder> dos = deliveryOrderRepository
                                .findByStockIssueNote_SalesOrder_SalesQuotation_Id(sqId);

                BigDecimal totalDeliv = dos.stream()
                                .map(d -> d.getDeliveryCost() != null ? d.getDeliveryCost() : BigDecimal.ZERO)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal totalOther = dos.stream()
                                .map(d -> d.getOtherCosts() != null ? d.getOtherCosts() : BigDecimal.ZERO)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                sq.setDeliveryCost(totalDeliv);
                sq.setOtherCosts(totalOther);
                sq.recalculateTotal();
                salesQuotationRepository.save(sq);
        }

        private void syncScheduleStatuses(DeliveryOrder order, List<Integer> selectedScheduleIds) {
                resetScheduleStatuses(order.getId());
                if (selectedScheduleIds == null || selectedScheduleIds.isEmpty())
                        return;

                for (Integer scheduleId : selectedScheduleIds) {
                        scheduleRepository.findById(scheduleId).ifPresent(schedule -> {
                                schedule.setStatus("Fulfilled");
                                schedule.setDeliveryOrderId(order.getId());
                                scheduleRepository.save(schedule);
                        });
                }
        }

        private void resetScheduleStatuses(Integer deliveryOrderId) {
                List<CustomerRequestDeliverySchedule> schedules = scheduleRepository
                                .findByDeliveryOrderId(deliveryOrderId);
                for (CustomerRequestDeliverySchedule schedule : schedules) {
                        schedule.setStatus("Pending");
                        schedule.setDeliveryOrderId(null);
                        scheduleRepository.save(schedule);
                }
        }

        private String generateDeliveryOrderNumber() {
                return "DO-" + (deliveryOrderRepository.count() + 1);
        }

        private DeliveryOrderDto mapToDto(DeliveryOrder order) {
                SalesOrder so = order.getStockIssueNote().getSalesOrder();
                List<DeliveryOrderItemDto> items = order.getStockIssueNote().getItems().stream()
                                .map(item -> {
                                        SalesOrderItem soItem = so != null ? so.getItems().stream()
                                                        .filter(si -> si.getItem().getId()
                                                                        .equals(item.getItem().getId()))
                                                        .findFirst().orElse(null) : null;

                                        BigDecimal qty = item.getIssuedQty() != null ? item.getIssuedQty()
                                                        : (item.getRequestedQty() != null ? item.getRequestedQty()
                                                                        : BigDecimal.ZERO);
                                        BigDecimal unitPrice = soItem != null ? soItem.getUnitPrice()
                                                        : (item.getUnitCost() != null ? item.getUnitCost()
                                                                        : BigDecimal.ZERO);
                                        BigDecimal discPerc = soItem != null && soItem.getDiscountPercentage() != null
                                                        ? soItem.getDiscountPercentage()
                                                        : BigDecimal.ZERO;
                                        BigDecimal subtotal = qty.multiply(unitPrice);
                                        BigDecimal discAmt = subtotal.multiply(discPerc)
                                                        .divide(new BigDecimal(100), 2, java.math.RoundingMode.HALF_UP);

                                        return DeliveryOrderItemDto.builder()
                                                        .itemId(item.getItem().getId())
                                                        .itemNameAr(item.getItem().getItemNameAr())
                                                        .itemCode(item.getItem().getItemCode())
                                                        .qty(qty)
                                                        .unitId(item.getUnit().getId())
                                                        .unitNameAr(item.getUnit().getUnitNameAr())
                                                        .unitPrice(unitPrice)
                                                        .discountPercentage(discPerc)
                                                        .totalPrice(subtotal.subtract(discAmt))
                                                        .notes(item.getNotes())
                                                        .build();
                                }).collect(Collectors.toList());

                BigDecimal subtotalSum = items.stream()
                                .map(i -> i.getTotalPrice() != null ? i.getTotalPrice() : BigDecimal.ZERO)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal taxAmt = so != null && so.getTaxAmount() != null ? so.getTaxAmount() : BigDecimal.ZERO;

                return DeliveryOrderDto.builder()
                                .id(order.getId())
                                .deliveryOrderNumber(order.getDeliveryOrderNumber())
                                .orderDate(order.getOrderDate() != null ? order.getOrderDate().toLocalDate() : null)
                                .issueNoteId(order.getStockIssueNote().getId())
                                .issueNoteNumber(order.getStockIssueNote().getIssueNoteNumber())
                                .customerId(order.getCustomer().getId())
                                .customerNameAr(order.getCustomer().getCustomerNameAr())
                                .customerCode(order.getCustomer().getCustomerCode())
                                .deliveryAddress(order.getDeliveryAddress())
                                .zoneId(order.getZoneId())
                                .deliveryType(order.getDeliveryType())
                                .vehicleId(order.getVehicleId())
                                .scheduleId(order.getScheduleId())
                                .contractorId(order.getContractorId())
                                .driverName(order.getDriverName())
                                .driverPhone(order.getDriverPhone())
                                .scheduledDate(order.getScheduledDate())
                                .scheduledTime(order.getScheduledTime())
                                .actualDeliveryDate(
                                                order.getActualDeliveryDate() != null
                                                                ? order.getActualDeliveryDate().toLocalDate()
                                                                : null)
                                .deliveryCost(order.getDeliveryCost())
                                .otherCosts(order.getOtherCosts())
                                .subTotal(subtotalSum)
                                .taxAmount(taxAmt)
                                .totalAmount(subtotalSum.add(taxAmt)
                                                .add(order.getDeliveryCost() != null ? order.getDeliveryCost()
                                                                : BigDecimal.ZERO)
                                                .add(order.getOtherCosts() != null ? order.getOtherCosts()
                                                                : BigDecimal.ZERO))
                                .isCostOnCustomer(order.getIsCostOnCustomer())
                                .status(order.getStatus())
                                .approvalStatus(order.getApprovalStatus())
                                .receiverName(order.getReceiverName())
                                .receiverPhone(order.getReceiverPhone())
                                .receiverSignature(order.getReceiverSignature())
                                .podAttachmentPath(order.getPodAttachmentPath())
                                .notes(order.getNotes())
                                .createdAt(order.getCreatedAt())
                                .createdBy(order.getCreatedBy())
                                .updatedAt(order.getUpdatedAt())
                                .updatedBy(order.getUpdatedBy())
                                .vehicleNo(order.getStockIssueNote().getVehicleNo())
                                .items(items)
                                .selectedScheduleIds(scheduleRepository.findByDeliveryOrderId(order.getId())
                                                .stream()
                                                .map(CustomerRequestDeliverySchedule::getScheduleId)
                                                .collect(Collectors.toList()))
                                .build();
        }
}
