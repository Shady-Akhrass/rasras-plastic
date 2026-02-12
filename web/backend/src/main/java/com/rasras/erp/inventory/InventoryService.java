package com.rasras.erp.inventory;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final StockBalanceRepository balanceRepo;
    private final StockMovementRepository movementRepo;
    private final ItemRepository itemRepo;
    private final WarehouseRepository warehouseRepo;

    @Transactional
    public void updateStock(Integer itemId, Integer warehouseId, BigDecimal quantity, String direction,
            String moveType, String refType, Integer refId, String refNumber,
            BigDecimal unitCost, Integer userId) {

        Item item = itemRepo.findById(itemId).orElseThrow();
        Warehouse warehouse = warehouseRepo.findById(warehouseId).orElseThrow();

        StockBalance balance = balanceRepo.findByItemIdAndWarehouseId(itemId, warehouseId)
                .orElse(StockBalance.builder()
                        .item(item)
                        .warehouse(warehouse)
                        .quantityOnHand(BigDecimal.ZERO)
                        .quantityReserved(BigDecimal.ZERO)
                        .build());

        BigDecimal balanceBefore = balance.getQuantityOnHand() != null ? balance.getQuantityOnHand() : BigDecimal.ZERO;
        BigDecimal newQuantity;

        if ("IN".equalsIgnoreCase(direction)) {
            newQuantity = balanceBefore.add(quantity);
            // تحديث التكلفة المتوسطة المرجحة عند حركة الإدخال
            BigDecimal currentAvgCost = balance.getAverageCost() != null ? balance.getAverageCost() : BigDecimal.ZERO;
            BigDecimal incomingCost = unitCost != null ? unitCost : BigDecimal.ZERO;
            if (newQuantity.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal valueBefore = balanceBefore.multiply(currentAvgCost);
                BigDecimal valueIncoming = quantity.multiply(incomingCost);
                BigDecimal newAverageCost = valueBefore.add(valueIncoming).divide(newQuantity, 4, RoundingMode.HALF_UP);
                balance.setAverageCost(newAverageCost);
            }
        } else {
            newQuantity = balanceBefore.subtract(quantity);
            // عند OUT: التكلفة المتوسطة للرصيد المتبقي لا تتغير
        }

        balance.setQuantityOnHand(newQuantity);
        balance.setLastMovementDate(LocalDateTime.now());
        balance.setUpdatedAt(LocalDateTime.now());
        balanceRepo.save(balance);

        StockMovement movement = StockMovement.builder()
                .item(item)
                .warehouse(warehouse)
                .quantity(quantity)
                .direction(direction.toUpperCase())
                .movementType(moveType)
                .referenceType(refType)
                .referenceId(refId)
                .referenceNumber(refNumber)
                .unitCost(unitCost)
                .totalCost(unitCost != null ? unitCost.multiply(quantity) : BigDecimal.ZERO)
                .balanceBefore(balanceBefore)
                .balanceAfter(newQuantity)
                .createdBy(userId)
                .build();
        movementRepo.save(movement);
    }
}
