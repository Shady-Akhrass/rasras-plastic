package com.rasras.erp.inventory;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockBalanceService {

    private final StockBalanceRepository balanceRepo;
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

    private StockBalanceDto mapToDto(StockBalance balance) {
        return StockBalanceDto.builder()
                .id(balance.getId())
                .itemId(balance.getItem().getId())
                .itemCode(balance.getItem().getItemCode())
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
