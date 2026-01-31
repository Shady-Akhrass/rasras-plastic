package com.rasras.erp.inventory;

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
public class StockTransferService {

    private final StockTransferRepository transferRepo;
    private final WarehouseRepository warehouseRepo;
    private final ItemRepository itemRepo;
    private final UnitRepository unitRepo;
    private final InventoryService inventoryService;
    private final StockBalanceRepository stockBalanceRepository;

    @Transactional(readOnly = true)
    public List<StockTransferDto> getAll() {
        return transferRepo.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StockTransferDto getById(Integer id) {
        StockTransfer transfer = transferRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Stock transfer not found: " + id));
        return mapToDto(transfer);
    }

    @Transactional
    public StockTransferDto create(StockTransferDto dto) {
        Warehouse fromWarehouse = warehouseRepo.findById(dto.getFromWarehouseId())
                .orElseThrow(() -> new RuntimeException("From warehouse not found"));
        Warehouse toWarehouse = warehouseRepo.findById(dto.getToWarehouseId())
                .orElseThrow(() -> new RuntimeException("To warehouse not found"));

        if (fromWarehouse.getId().equals(toWarehouse.getId())) {
            throw new RuntimeException("From and to warehouse must be different");
        }

        StockTransfer transfer = StockTransfer.builder()
                .transferNumber(generateTransferNumber())
                .transferDate(dto.getTransferDate() != null ? dto.getTransferDate() : LocalDateTime.now())
                .fromWarehouse(fromWarehouse)
                .toWarehouse(toWarehouse)
                .requestedByUserId(dto.getRequestedByUserId() != null ? dto.getRequestedByUserId() : 1)
                .status("Draft")
                .notes(dto.getNotes())
                .build();

        if (dto.getItems() != null && !dto.getItems().isEmpty()) {
            List<StockTransferItem> items = new ArrayList<>();
            for (StockTransferItemDto itemDto : dto.getItems()) {
                Item item = itemRepo.findById(itemDto.getItemId())
                        .orElseThrow(() -> new RuntimeException("Item not found: " + itemDto.getItemId()));
                UnitOfMeasure unit = unitRepo.findById(itemDto.getUnitId())
                        .orElseThrow(() -> new RuntimeException("Unit not found: " + itemDto.getUnitId()));

                StockTransferItem entity = StockTransferItem.builder()
                        .stockTransfer(transfer)
                        .item(item)
                        .requestedQty(itemDto.getRequestedQty())
                        .transferredQty(BigDecimal.ZERO)
                        .receivedQty(BigDecimal.ZERO)
                        .unit(unit)
                        .fromLocationId(itemDto.getFromLocationId())
                        .toLocationId(itemDto.getToLocationId())
                        .lotNumber(itemDto.getLotNumber())
                        .notes(itemDto.getNotes())
                        .build();
                items.add(entity);
            }
            transfer.setItems(items);
        }

        return mapToDto(transferRepo.save(transfer));
    }

    @Transactional
    public StockTransferDto update(Integer id, StockTransferDto dto) {
        StockTransfer transfer = transferRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Stock transfer not found: " + id));

        if (!"Draft".equals(transfer.getStatus())) {
            throw new RuntimeException("Only draft transfers can be updated");
        }

        transfer.setNotes(dto.getNotes());
        transfer.setTransferDate(dto.getTransferDate() != null ? dto.getTransferDate() : transfer.getTransferDate());

        if (dto.getItems() != null) {
            transfer.getItems().clear();
            for (StockTransferItemDto itemDto : dto.getItems()) {
                Item item = itemRepo.findById(itemDto.getItemId())
                        .orElseThrow(() -> new RuntimeException("Item not found: " + itemDto.getItemId()));
                UnitOfMeasure unit = unitRepo.findById(itemDto.getUnitId())
                        .orElseThrow(() -> new RuntimeException("Unit not found: " + itemDto.getUnitId()));

                StockTransferItem entity = StockTransferItem.builder()
                        .stockTransfer(transfer)
                        .item(item)
                        .requestedQty(itemDto.getRequestedQty())
                        .transferredQty(BigDecimal.ZERO)
                        .receivedQty(BigDecimal.ZERO)
                        .unit(unit)
                        .fromLocationId(itemDto.getFromLocationId())
                        .toLocationId(itemDto.getToLocationId())
                        .lotNumber(itemDto.getLotNumber())
                        .notes(itemDto.getNotes())
                        .build();
                transfer.getItems().add(entity);
            }
        }

        return mapToDto(transferRepo.save(transfer));
    }

    /**
     * إتمام التحويل: خصم من المخزن المصدر وإضافة إلى المخزن الهدف.
     * تطبيق FIFO عبر استخدام InventoryService الذي يحدث الأرصدة والحركات.
     */
    @Transactional
    public StockTransferDto finalizeTransfer(Integer id, Integer userId) {
        StockTransfer transfer = transferRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Stock transfer not found: " + id));

        if (!"Draft".equals(transfer.getStatus())) {
            throw new RuntimeException("Only draft transfers can be finalized");
        }

        Integer fromWarehouseId = transfer.getFromWarehouse().getId();
        Integer toWarehouseId = transfer.getToWarehouse().getId();
        int effectiveUserId = userId != null ? userId : transfer.getRequestedByUserId();

        for (StockTransferItem item : transfer.getItems()) {
            BigDecimal qty = item.getRequestedQty();
            if (qty == null || qty.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            Integer itemId = item.getItem().getId();
            BigDecimal unitCost = getAverageCost(itemId, fromWarehouseId);

            // التحقق من توفر الكمية في المخزن المصدر
            ensureStockAvailable(itemId, fromWarehouseId, qty, transfer.getTransferNumber());

            // خصم من المخزن المصدر (OUT)
            inventoryService.updateStock(
                    itemId, fromWarehouseId, qty, "OUT",
                    "TRANSFER_OUT", "StockTransfer", transfer.getId(), transfer.getTransferNumber(),
                    unitCost, effectiveUserId
            );

            // إضافة إلى المخزن الهدف (IN)
            inventoryService.updateStock(
                    itemId, toWarehouseId, qty, "IN",
                    "TRANSFER_IN", "StockTransfer", transfer.getId(), transfer.getTransferNumber(),
                    unitCost, effectiveUserId
            );

            item.setTransferredQty(qty);
            item.setReceivedQty(qty);
        }

        transfer.setStatus("Completed");
        transfer.setTransferredByUserId(effectiveUserId);
        transfer.setReceivedByUserId(effectiveUserId);
        transfer.setShippedDate(LocalDateTime.now());
        transfer.setReceivedDate(LocalDateTime.now());

        return mapToDto(transferRepo.save(transfer));
    }

    private void ensureStockAvailable(Integer itemId, Integer warehouseId, BigDecimal required, String ref) {
        BigDecimal available = stockBalanceRepository
                .findByItemIdAndWarehouseId(itemId, warehouseId)
                .map(StockBalance::getQuantityOnHand)
                .orElse(BigDecimal.ZERO);
        if (available == null) {
            available = BigDecimal.ZERO;
        }
        if (available.compareTo(required) < 0) {
            throw new RuntimeException(
                    "Insufficient stock for transfer " + ref + ": required " + required + ", available " + available);
        }
    }

    private BigDecimal getAverageCost(Integer itemId, Integer warehouseId) {
        return stockBalanceRepository
                .findByItemIdAndWarehouseId(itemId, warehouseId)
                .map(StockBalance::getAverageCost)
                .orElse(BigDecimal.ZERO);
    }

    private String generateTransferNumber() {
        long count = transferRepo.count() + 1;
        LocalDateTime now = LocalDateTime.now();
        return String.format("TRF-%d%02d-%03d", now.getYear(), now.getMonthValue(), count);
    }

    private StockTransferDto mapToDto(StockTransfer entity) {
        StockTransferDto dto = StockTransferDto.builder()
                .id(entity.getId())
                .transferNumber(entity.getTransferNumber())
                .transferDate(entity.getTransferDate())
                .fromWarehouseId(entity.getFromWarehouse().getId())
                .fromWarehouseNameAr(entity.getFromWarehouse().getWarehouseNameAr())
                .toWarehouseId(entity.getToWarehouse().getId())
                .toWarehouseNameAr(entity.getToWarehouse().getWarehouseNameAr())
                .requestedByUserId(entity.getRequestedByUserId())
                .transferredByUserId(entity.getTransferredByUserId())
                .receivedByUserId(entity.getReceivedByUserId())
                .status(entity.getStatus())
                .shippedDate(entity.getShippedDate())
                .receivedDate(entity.getReceivedDate())
                .notes(entity.getNotes())
                .build();

        if (entity.getItems() != null) {
            dto.setItems(entity.getItems().stream()
                    .map(this::mapItemToDto)
                    .collect(Collectors.toList()));
        } else {
            dto.setItems(List.of());
        }
        return dto;
    }

    private StockTransferItemDto mapItemToDto(StockTransferItem item) {
        return StockTransferItemDto.builder()
                .id(item.getId())
                .itemId(item.getItem().getId())
                .itemCode(item.getItem().getItemCode())
                .itemNameAr(item.getItem().getItemNameAr())
                .requestedQty(item.getRequestedQty())
                .transferredQty(item.getTransferredQty())
                .receivedQty(item.getReceivedQty())
                .unitId(item.getUnit().getId())
                .unitNameAr(item.getUnit().getUnitNameAr())
                .fromLocationId(item.getFromLocationId())
                .toLocationId(item.getToLocationId())
                .lotNumber(item.getLotNumber())
                .notes(item.getNotes())
                .build();
    }
}
