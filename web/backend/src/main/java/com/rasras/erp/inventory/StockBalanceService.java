package com.rasras.erp.inventory;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockBalanceService {

    private final StockBalanceRepository balanceRepo;
    private final StockMovementRepository movementRepo;
    private final ItemRepository itemRepo;
    private final WarehouseRepository warehouseRepo;

    @Transactional(readOnly = true)
    public List<StockBalanceDto> getAllBalances() {
        return balanceRepo.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StockBalanceDto getBalanceById(Integer id) {
        return balanceRepo.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException("Stock balance not found"));
    }

    @Transactional
    public StockBalanceDto createBalance(StockBalanceDto dto) {
        Item item = itemRepo.findById(dto.getItemId()).orElseThrow();
        Warehouse warehouse = warehouseRepo.findById(dto.getWarehouseId()).orElseThrow();

        StockBalance balance = StockBalance.builder()
                .item(item)
                .warehouse(warehouse)
                .quantityOnHand(dto.getQuantityOnHand() != null ? dto.getQuantityOnHand() : BigDecimal.ZERO)
                .quantityReserved(dto.getQuantityReserved() != null ? dto.getQuantityReserved() : BigDecimal.ZERO)
                .averageCost(dto.getAverageCost() != null ? dto.getAverageCost() : BigDecimal.ZERO)
                .lastMovementDate(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return mapToDto(balanceRepo.save(balance));
    }

    @Transactional
    public StockBalanceDto updateBalance(Integer id, StockBalanceDto dto) {
        StockBalance balance = balanceRepo.findById(id).orElseThrow();

        if (dto.getQuantityOnHand() != null)
            balance.setQuantityOnHand(dto.getQuantityOnHand());
        if (dto.getQuantityReserved() != null)
            balance.setQuantityReserved(dto.getQuantityReserved());
        if (dto.getAverageCost() != null)
            balance.setAverageCost(dto.getAverageCost());

        balance.setUpdatedAt(LocalDateTime.now());
        return mapToDto(balanceRepo.save(balance));
    }

    @Transactional
    public void deleteBalance(Integer id) {
        balanceRepo.deleteById(id);
    }

    /**
     * تقرير المخزون الدوري: رصيد أول المدة، إضافات، مصروفات، رصيد آخر المدة
     */
    @Transactional(readOnly = true)
    public List<PeriodicInventoryReportDto> getPeriodicReport(int month, int year, Integer warehouseId) {
        LocalDateTime periodStart = LocalDateTime.of(year, month, 1, 0, 0);
        LocalDateTime periodEnd = periodStart.plusMonths(1);
        List<StockMovement> movements = warehouseId != null
                ? movementRepo.findByWarehouseAndDateRange(warehouseId, periodStart, periodEnd)
                : movementRepo.findByDateRange(periodStart, periodEnd);

        List<StockBalance> balances = warehouseId != null
                ? balanceRepo.findByWarehouseId(warehouseId)
                : balanceRepo.findAll();

        Map<String, BigDecimal> additionsMap = new HashMap<>();
        Map<String, BigDecimal> issuesMap = new HashMap<>();
        for (StockMovement m : movements) {
            String key = m.getItem().getId() + "|" + m.getWarehouse().getId();
            BigDecimal qty = m.getQuantity() != null ? m.getQuantity() : BigDecimal.ZERO;
            if ("IN".equals(m.getDirection())) {
                additionsMap.merge(key, qty, BigDecimal::add);
            } else {
                issuesMap.merge(key, qty, BigDecimal::add);
            }
        }

        List<PeriodicInventoryReportDto> result = new ArrayList<>();
        for (StockBalance b : balances) {
            if (warehouseId != null && !b.getWarehouse().getId().equals(warehouseId)) continue;
            int itemId = b.getItem().getId();
            int whId = b.getWarehouse().getId();
            String key = itemId + "|" + whId;
            BigDecimal closing = b.getQuantityOnHand() != null ? b.getQuantityOnHand() : BigDecimal.ZERO;
            BigDecimal addQty = additionsMap.getOrDefault(key, BigDecimal.ZERO);
            BigDecimal issQty = issuesMap.getOrDefault(key, BigDecimal.ZERO);
            BigDecimal opening = closing.subtract(addQty).add(issQty);

            BigDecimal avgCost = b.getAverageCost() != null ? b.getAverageCost() : BigDecimal.ZERO;
            Item item = b.getItem();

            result.add(PeriodicInventoryReportDto.builder()
                    .itemId(itemId)
                    .itemCode(item.getItemCode())
                    .itemNameAr(item.getItemNameAr())
                    .grade(item.getGrade())
                    .warehouseId(whId)
                    .warehouseNameAr(b.getWarehouse().getWarehouseNameAr())
                    .openingQty(opening.max(BigDecimal.ZERO))
                    .additionsQty(addQty)
                    .issuesQty(issQty)
                    .closingQty(closing)
                    .averageCost(avgCost)
                    .openingValue(opening.max(BigDecimal.ZERO).multiply(avgCost))
                    .additionsValue(addQty.multiply(avgCost))
                    .issuesValue(issQty.multiply(avgCost))
                    .closingValue(closing.multiply(avgCost))
                    .minStockLevel(item.getMinStockLevel())
                    .build());
        }
        return result;
    }

    private StockBalanceDto mapToDto(StockBalance balance) {
        return StockBalanceDto.builder()
                .id(balance.getId())
                .itemId(balance.getItem().getId())
                .itemCode(balance.getItem().getItemCode())
                .grade(balance.getItem().getGrade())
                .itemNameAr(balance.getItem().getItemNameAr())
                .warehouseId(balance.getWarehouse().getId())
                .warehouseNameAr(balance.getWarehouse().getWarehouseNameAr())
                .quantityOnHand(balance.getQuantityOnHand())
                .quantityReserved(balance.getQuantityReserved())
                .availableQty(balance.getQuantityOnHand().subtract(balance.getQuantityReserved()))
                .averageCost(balance.getAverageCost())
                .lastMovementDate(balance.getLastMovementDate())
                .build();
    }
}
