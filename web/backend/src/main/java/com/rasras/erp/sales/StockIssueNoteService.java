package com.rasras.erp.sales;

import com.rasras.erp.crm.Customer;
import com.rasras.erp.crm.CustomerRepository;
import com.rasras.erp.inventory.*;
import com.rasras.erp.approval.ApprovalService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockIssueNoteService {

    private final StockIssueNoteRepository issueNoteRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final CustomerRepository customerRepository;
    private final WarehouseRepository warehouseRepository;
    private final ItemRepository itemRepository;
    private final UnitRepository unitRepository;
    private final InventoryService inventoryService;
    private final StockBalanceRepository stockBalanceRepository;
    private final ApprovalService approvalService;

    @Transactional(readOnly = true)
    public List<StockIssueNoteDto> getAll() {
        return issueNoteRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StockIssueNoteDto getById(Integer id) {
        return issueNoteRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException("Stock Issue Note not found"));
    }

    @Transactional(readOnly = true)
    public List<StockIssueNoteDto> getBySalesOrderId(Integer salesOrderId) {
        return issueNoteRepository.findBySalesOrder_IdOrderByIssueDateDesc(salesOrderId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * التحقق من توفر المخزون قبل إنشاء إذن الصرف (تحذير فقط).
     * يرجع قائمة أصناف الكمية المتوفرة فيها أقل من المطلوب.
     */
    @Transactional(readOnly = true)
    public List<StockAvailabilityWarningDto> checkStockAvailability(Integer salesOrderId, Integer warehouseId) {
        SalesOrder so = salesOrderRepository.findById(salesOrderId)
                .orElseThrow(() -> new RuntimeException("Sales Order not found"));
        List<StockAvailabilityWarningDto> warnings = new ArrayList<>();
        if (so.getItems() == null)
            return warnings;

        for (SalesOrderItem soItem : so.getItems()) {
            BigDecimal remaining = soItem.getOrderedQty().subtract(
                    soItem.getDeliveredQty() != null ? soItem.getDeliveredQty() : BigDecimal.ZERO);
            if (remaining.compareTo(BigDecimal.ZERO) <= 0)
                continue;

            Integer itemId = soItem.getItem().getId();
            Optional<StockBalance> balanceOpt = stockBalanceRepository.findByItemIdAndWarehouseId(itemId, warehouseId);
            BigDecimal available = BigDecimal.ZERO;
            if (balanceOpt.isPresent()) {
                StockBalance b = balanceOpt.get();
                BigDecimal onHand = b.getQuantityOnHand() != null ? b.getQuantityOnHand() : BigDecimal.ZERO;
                BigDecimal reserved = b.getQuantityReserved() != null ? b.getQuantityReserved() : BigDecimal.ZERO;
                available = onHand.subtract(reserved);
            }

            if (available.compareTo(remaining) < 0) {
                BigDecimal shortfall = remaining.subtract(available);
                warnings.add(StockAvailabilityWarningDto.builder()
                        .itemId(itemId)
                        .itemCode(soItem.getItem().getItemCode())
                        .itemNameAr(soItem.getItem().getItemNameAr())
                        .unitNameAr(soItem.getUnit() != null ? soItem.getUnit().getUnitNameAr() : null)
                        .requestedQty(remaining)
                        .availableQty(available)
                        .shortfall(shortfall)
                        .build());
            }
        }
        return warnings;
    }

    /**
     * إنشاء إذن صرف من أمر البيع
     */
    @Transactional
    public StockIssueNoteDto createFromSalesOrder(Integer salesOrderId, Integer warehouseId, Integer issuedByUserId) {
        SalesOrder so = salesOrderRepository.findById(salesOrderId)
                .orElseThrow(() -> new RuntimeException("Sales Order not found"));

        if (!"Draft".equals(so.getStatus()) && !"Approved".equals(so.getStatus())) {
            throw new RuntimeException("Sales Order must be Draft or Approved to create Issue Note");
        }

        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));

        StockIssueNote note = StockIssueNote.builder()
                .issueNoteNumber(generateIssueNoteNumber())
                .issueDate(LocalDateTime.now())
                .issueType("SALE_ORDER")
                .salesOrder(so)
                .customer(so.getCustomer())
                .warehouse(warehouse)
                .issuedByUserId(issuedByUserId != null ? issuedByUserId : 1)
                .status("Draft")
                .build();

        List<StockIssueNoteItem> items = new ArrayList<>();
        if (so.getItems() != null) {
            for (SalesOrderItem soItem : so.getItems()) {
                BigDecimal remaining = soItem.getOrderedQty()
                        .subtract(soItem.getDeliveredQty() != null ? soItem.getDeliveredQty() : BigDecimal.ZERO);
                if (remaining.compareTo(BigDecimal.ZERO) <= 0)
                    continue;

                StockIssueNoteItem issueItem = StockIssueNoteItem.builder()
                        .stockIssueNote(note)
                        .salesOrderItem(soItem)
                        .item(soItem.getItem())
                        .requestedQty(remaining)
                        .issuedQty(remaining)
                        .unit(soItem.getUnit())
                        .unitCost(soItem.getUnitCost())
                        .totalCost(soItem.getUnitCost() != null ? soItem.getUnitCost().multiply(remaining) : null)
                        .notes(soItem.getNotes())
                        .build();
                items.add(issueItem);
            }
        }
        note.setItems(items);
        StockIssueNote saved = issueNoteRepository.save(note);
        return mapToDto(saved);
    }

    @Transactional
    public StockIssueNoteDto create(StockIssueNoteDto dto) {
        String issueType = dto.getIssueType() != null ? dto.getIssueType() : "SALE_ORDER";
        Warehouse warehouse = warehouseRepository.findById(dto.getWarehouseId())
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));

        if ("SALE_ORDER".equals(issueType)) {
            if (dto.getSalesOrderId() == null || dto.getCustomerId() == null) {
                throw new RuntimeException("Sales Order and Customer are required for SALE_ORDER issue type");
            }
        } else if ("PRODUCTION".equals(issueType) || "PROJECT".equals(issueType) || "INTERNAL".equals(issueType)) {
            if (dto.getReferenceNumber() == null || dto.getReferenceNumber().isBlank()) {
                throw new RuntimeException("Reference number is required for " + issueType + " issue type");
            }
        }

        SalesOrder so = null;
        Customer customer = null;
        if (dto.getSalesOrderId() != null) {
            so = salesOrderRepository.findById(dto.getSalesOrderId())
                    .orElseThrow(() -> new RuntimeException("Sales Order not found"));
        }
        if (dto.getCustomerId() != null) {
            customer = customerRepository.findById(dto.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Customer not found"));
        }

        StockIssueNote note = StockIssueNote.builder()
                .issueNoteNumber(
                        dto.getIssueNoteNumber() != null ? dto.getIssueNoteNumber() : generateIssueNoteNumber())
                .issueDate(dto.getIssueDate() != null ? dto.getIssueDate().atStartOfDay() : LocalDateTime.now())
                .issueType(issueType)
                .referenceType(dto.getReferenceType())
                .referenceId(dto.getReferenceId())
                .referenceNumber(dto.getReferenceNumber())
                .salesOrder(so)
                .customer(customer)
                .warehouse(warehouse)
                .issuedByUserId(dto.getIssuedByUserId() != null ? dto.getIssuedByUserId() : 1)
                .receivedByName(dto.getReceivedByName())
                .receivedById(dto.getReceivedById())
                .receivedBySignature(dto.getReceivedBySignature())
                .vehicleNo(dto.getVehicleNo())
                .driverName(dto.getDriverName())
                .status(dto.getStatus() != null ? dto.getStatus() : "Draft")
                .deliveryDate(dto.getDeliveryDate() != null ? dto.getDeliveryDate().atStartOfDay() : null)
                .notes(dto.getNotes())
                .build();

        List<StockIssueNoteItem> items = new ArrayList<>();
        if (dto.getItems() != null) {
            for (StockIssueNoteItemDto itemDto : dto.getItems()) {
                Item item = itemRepository.findById(itemDto.getItemId())
                        .orElseThrow(() -> new RuntimeException("Item not found"));
                UnitOfMeasure unit = unitRepository.findById(itemDto.getUnitId())
                        .orElseThrow(() -> new RuntimeException("Unit not found"));

                SalesOrderItem soItem = null;
                if ("SALE_ORDER".equals(issueType) && so != null && itemDto.getSoItemId() != null) {
                    soItem = so.getItems().stream()
                            .filter(i -> i.getId().equals(itemDto.getSoItemId()))
                            .findFirst()
                            .orElse(null);
                }

                StockIssueNoteItem issueItem = StockIssueNoteItem.builder()
                        .stockIssueNote(note)
                        .salesOrderItem(soItem)
                        .item(item)
                        .requestedQty(itemDto.getRequestedQty())
                        .issuedQty(itemDto.getIssuedQty() != null ? itemDto.getIssuedQty() : itemDto.getRequestedQty())
                        .unit(unit)
                        .unitCost(itemDto.getUnitCost())
                        .totalCost(itemDto.getTotalCost())
                        .lotNumber(itemDto.getLotNumber())
                        .batchId(itemDto.getBatchId())
                        .locationId(itemDto.getLocationId())
                        .notes(itemDto.getNotes())
                        .build();
                items.add(issueItem);
            }
        }
        note.setItems(items);
        StockIssueNote saved = issueNoteRepository.save(note);
        return mapToDto(saved);
    }

    @Transactional
    public StockIssueNoteDto update(Integer id, StockIssueNoteDto dto) {
        StockIssueNote note = issueNoteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stock Issue Note not found"));

        if (!"Draft".equals(note.getStatus()) && !"Rejected".equals(note.getStatus())) {
            throw new RuntimeException("Cannot update Issue Note that is not in Draft or Rejected status");
        }

        // Reset approval status if rejected and being edited
        if ("Rejected".equals(note.getStatus())) {
            note.setApprovalStatus("Pending");
        }

        note.setReceivedByName(dto.getReceivedByName());
        note.setReceivedById(dto.getReceivedById());
        note.setReceivedBySignature(dto.getReceivedBySignature());
        note.setVehicleNo(dto.getVehicleNo());
        note.setDriverName(dto.getDriverName());
        note.setDeliveryDate(dto.getDeliveryDate() != null ? dto.getDeliveryDate().atStartOfDay() : null);
        note.setNotes(dto.getNotes());
        note.setUpdatedBy(dto.getUpdatedBy() != null ? dto.getUpdatedBy() : 1);

        if (dto.getItems() != null) {
            note.getItems().clear();
            String issueType = note.getIssueType() != null ? note.getIssueType() : "SALE_ORDER";
            SalesOrder so = note.getSalesOrder();
            for (StockIssueNoteItemDto itemDto : dto.getItems()) {
                SalesOrderItem soItem = null;
                if ("SALE_ORDER".equals(issueType) && so != null && itemDto.getSoItemId() != null) {
                    soItem = so.getItems().stream()
                            .filter(i -> i.getId().equals(itemDto.getSoItemId()))
                            .findFirst()
                            .orElse(null);
                }
                Item item = itemRepository.findById(itemDto.getItemId())
                        .orElseThrow(() -> new RuntimeException("Item not found"));
                UnitOfMeasure unit = unitRepository.findById(itemDto.getUnitId())
                        .orElseThrow(() -> new RuntimeException("Unit not found"));

                StockIssueNoteItem issueItem = StockIssueNoteItem.builder()
                        .stockIssueNote(note)
                        .salesOrderItem(soItem)
                        .item(item)
                        .requestedQty(itemDto.getRequestedQty())
                        .issuedQty(itemDto.getIssuedQty() != null ? itemDto.getIssuedQty() : itemDto.getRequestedQty())
                        .unit(unit)
                        .unitCost(itemDto.getUnitCost())
                        .totalCost(itemDto.getTotalCost())
                        .lotNumber(itemDto.getLotNumber())
                        .batchId(itemDto.getBatchId())
                        .locationId(itemDto.getLocationId())
                        .notes(itemDto.getNotes())
                        .build();
                note.getItems().add(issueItem);
            }
        }

        return mapToDto(issueNoteRepository.save(note));
    }

    @Transactional
    public StockIssueNoteDto submitForApproval(Integer id) {
        StockIssueNote note = issueNoteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stock Issue Note not found"));

        if (!"Draft".equals(note.getStatus()) && !"Rejected".equals(note.getStatus())) {
            throw new RuntimeException("Stock Issue Note must be in Draft or Rejected status to submit");
        }

        note.setStatus("Pending");
        StockIssueNote saved = issueNoteRepository.save(note);

        // Calculate total amount from items
        BigDecimal totalAmount = saved.getItems() != null ? saved.getItems().stream()
                .map(item -> item.getTotalCost() != null ? item.getTotalCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add) : BigDecimal.ZERO;

        // Initiate approval workflow
        approvalService.initiateApproval("ISSUE_NOTE_APPROVAL", "StockIssueNote", saved.getId(),
                saved.getIssueNoteNumber(), saved.getIssuedByUserId() != null ? saved.getIssuedByUserId() : 1,
                totalAmount);

        return mapToDto(saved);
    }

    @Transactional
    public void delete(Integer id) {
        StockIssueNote note = issueNoteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stock Issue Note not found"));

        if (!"Draft".equals(note.getStatus()) && !"Pending".equals(note.getStatus()) && !"Rejected".equals(note.getStatus())) {
            throw new RuntimeException("Cannot delete Issue Note that is not in Draft, Pending, or Rejected status");
        }
        issueNoteRepository.delete(note);
    }

    /**
     * اعتماد إذن الصرف: تحديث المخزون وتحديث الكميات المصروفة في أمر البيع
     */
    @Transactional
    public StockIssueNoteDto approve(Integer id, Integer approvedByUserId) {
        StockIssueNote note = issueNoteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stock Issue Note not found"));

        if (!"Draft".equals(note.getStatus())) {
            throw new RuntimeException("Issue Note is already approved or in another status");
        }

        int userId = approvedByUserId != null ? approvedByUserId : 1;
        Integer warehouseId = note.getWarehouse().getId();

        for (StockIssueNoteItem item : note.getItems()) {
            Integer itemId = item.getItem().getId();
            BigDecimal qty = item.getIssuedQty();
            BigDecimal unitCost = item.getUnitCost() != null ? item.getUnitCost() : BigDecimal.ZERO;

            inventoryService.updateStock(
                    itemId, warehouseId, qty, "OUT",
                    "ISSUE", "StockIssueNote", note.getId(), note.getIssueNoteNumber(),
                    unitCost, userId);

            SalesOrderItem soItem = item.getSalesOrderItem();
            if (soItem != null) {
                BigDecimal newDelivered = (soItem.getDeliveredQty() != null ? soItem.getDeliveredQty()
                        : BigDecimal.ZERO).add(qty);
                soItem.setDeliveredQty(newDelivered);
            }
        }

        note.setStatus("Approved");
        note.setUpdatedBy(userId);
        return mapToDto(issueNoteRepository.save(note));
    }

    private String generateIssueNoteNumber() {
        return "SIN-" + System.currentTimeMillis();
    }

    private StockIssueNoteDto mapToDto(StockIssueNote note) {
        StockIssueNoteDto dto = StockIssueNoteDto.builder()
                .id(note.getId())
                .issueNoteNumber(note.getIssueNoteNumber())
                .issueDate(note.getIssueDate() != null ? note.getIssueDate().toLocalDate() : null)
                .issueType(note.getIssueType())
                .referenceType(note.getReferenceType())
                .referenceId(note.getReferenceId())
                .referenceNumber(note.getReferenceNumber())
                .salesOrderId(note.getSalesOrder() != null ? note.getSalesOrder().getId() : null)
                .soNumber(note.getSalesOrder() != null ? note.getSalesOrder().getSoNumber() : null)
                .customerId(note.getCustomer() != null ? note.getCustomer().getId() : null)
                .customerNameAr(note.getCustomer() != null ? note.getCustomer().getCustomerNameAr() : null)
                .customerCode(note.getCustomer() != null ? note.getCustomer().getCustomerCode() : null)
                .warehouseId(note.getWarehouse().getId())
                .warehouseNameAr(note.getWarehouse().getWarehouseNameAr())
                .issuedByUserId(note.getIssuedByUserId())
                .receivedByName(note.getReceivedByName())
                .receivedById(note.getReceivedById())
                .receivedBySignature(note.getReceivedBySignature())
                .vehicleNo(note.getVehicleNo())
                .driverName(note.getDriverName())
                .status(note.getStatus())
                .approvalStatus(note.getApprovalStatus())
                .deliveryDate(note.getDeliveryDate() != null ? note.getDeliveryDate().toLocalDate() : null)
                .notes(note.getNotes())
                .createdAt(note.getCreatedAt())
                .createdBy(note.getCreatedBy())
                .updatedAt(note.getUpdatedAt())
                .updatedBy(note.getUpdatedBy())
                .build();

        if (note.getItems() != null) {
            dto.setItems(note.getItems().stream().map(this::mapItemToDto).collect(Collectors.toList()));
        } else {
            dto.setItems(new ArrayList<>());
        }
        return dto;
    }

    private StockIssueNoteItemDto mapItemToDto(StockIssueNoteItem item) {
        StockIssueNoteItemDto dto = StockIssueNoteItemDto.builder()
                .id(item.getId())
                .stockIssueNoteId(item.getStockIssueNote().getId())
                .soItemId(item.getSalesOrderItem() != null ? item.getSalesOrderItem().getId() : null)
                .itemId(item.getItem().getId())
                .itemCode(item.getItem().getItemCode())
                .itemNameAr(item.getItem().getItemNameAr())
                .itemNameEn(item.getItem().getItemNameEn())
                .requestedQty(item.getRequestedQty())
                .issuedQty(item.getIssuedQty())
                .unitId(item.getUnit().getId())
                .unitNameAr(item.getUnit().getUnitNameAr())
                .unitCost(item.getUnitCost())
                .totalCost(item.getTotalCost())
                .lotNumber(item.getLotNumber())
                .batchId(item.getBatchId())
                .locationId(item.getLocationId())
                .notes(item.getNotes())
                .build();
        return dto;
    }
}
