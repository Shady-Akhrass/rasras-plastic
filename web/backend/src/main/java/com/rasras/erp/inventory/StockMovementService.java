package com.rasras.erp.inventory;

import com.rasras.erp.inventory.dto.StockMovementItemDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockMovementService {

    private final StockMovementRepository stockMovementRepository;

    /**
     * Simple helper used where full filtering/pagination is not needed.
     */
    @Transactional(readOnly = true)
    public List<StockMovementItemDto> getMovementsByItem(Integer itemId) {
        List<StockMovement> movements = stockMovementRepository.findByItemIdOrderByMovementDateDesc(itemId);
        return movements.stream()
                .map(this::toItemDto)
                .collect(Collectors.toList());
    }

    /**
     * متوسط الاستهلاك الشهري لصنف معيّن بناءً على حركات الصرف (OUT) خلال آخر عدد من الأشهر (Rolling Window).
     */
    @Transactional(readOnly = true)
    public BigDecimal getAverageMonthlyConsumption(Integer itemId, int months) {
        if (itemId == null || months <= 0) {
            return BigDecimal.ZERO;
        }

        LocalDateTime to = LocalDateTime.now();
        LocalDateTime from = to.minusMonths(months);

        // Repository query uses COALESCE, so it will never return null
        BigDecimal totalOut = stockMovementRepository.sumOutQuantityByItemAndDateRange(itemId, from, to);

        if (months == 1) {
            return totalOut.setScale(3, RoundingMode.HALF_UP);
        }

        return totalOut.divide(BigDecimal.valueOf(months), 3, RoundingMode.HALF_UP);
    }

    /**
     * فلترة حسب الصنف والمستودع ونطاق التاريخ مع ترقيم صفحات.
     */
    @Transactional(readOnly = true)
    public Page<StockMovementItemDto> getMovementsByItem(
            Integer itemId,
            Integer warehouseId,
            LocalDate fromDate,
            LocalDate toDate,
            Pageable pageable) {

        LocalDateTime from = fromDate != null ? fromDate.atStartOfDay() : null;
        // make "to" inclusive by moving to start of next day and using < to
        LocalDateTime to = toDate != null ? toDate.plusDays(1).atStartOfDay() : null;

        Page<StockMovement> page;
        if (itemId != null) {
            page = stockMovementRepository.findByItemAndFilters(
                    itemId, warehouseId, from, to, pageable);
        } else {
            // Global movements if itemId is null
            page = stockMovementRepository.findAll(pageable);
        }

        return page.map(this::toItemDto);
    }

    @Transactional(readOnly = true)
    public Page<StockMovementItemDto> getAllMovements(Pageable pageable) {
        return stockMovementRepository.findAll(pageable).map(this::toItemDto);
    }

    private StockMovementItemDto toItemDto(StockMovement m) {
        return StockMovementItemDto.builder()
                .date(m.getMovementDate())
                .type(m.getMovementType())
                .movementType(m.getDirection())
                .qty(m.getQuantity())
                .balance(m.getBalanceAfter())
                .ref(buildRef(m))
                .itemNameAr(m.getItem() != null ? m.getItem().getItemNameAr() : null)
                .itemNameEn(m.getItem() != null ? m.getItem().getItemNameEn() : null)
                .warehouseNameAr(m.getWarehouse() != null ? m.getWarehouse().getWarehouseNameAr() : null)
                .warehouseNameEn(m.getWarehouse() != null ? m.getWarehouse().getWarehouseNameEn() : null)
                .build();
    }

    private String buildRef(StockMovement m) {
        if (m.getReferenceNumber() != null && !m.getReferenceNumber().isBlank()) {
            return m.getReferenceNumber();
        }
        if (m.getReferenceType() == null) {
            return null;
        }
        return m.getReferenceType() + (m.getReferenceId() != null ? " #" + m.getReferenceId() : "");
    }
}