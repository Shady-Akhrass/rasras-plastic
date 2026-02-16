package com.rasras.erp.inventory;

import com.rasras.erp.inventory.dto.StockMovementItemDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        LocalDateTime to = toDate != null ? toDate.plusDays(1).atStartOfDay() : null;

        Page<StockMovement> page = stockMovementRepository.findByItemAndFilters(
                itemId, warehouseId, from, to, pageable);

        return page.map(this::toItemDto);
    }

    private StockMovementItemDto toItemDto(StockMovement m) {
        String ref = m.getReferenceNumber() != null && !m.getReferenceNumber().isBlank()
                ? m.getReferenceNumber()
                : (m.getReferenceType() != null
                ? m.getReferenceType() + (m.getReferenceId() != null ? " #" + m.getReferenceId() : "")
                : null);

        return StockMovementItemDto.builder()
                .date(m.getMovementDate())
                .type(m.getMovementType())
                .qty(m.getQuantity())
                .balance(m.getBalanceAfter())
                .ref(ref)
                .build();
    }
}
