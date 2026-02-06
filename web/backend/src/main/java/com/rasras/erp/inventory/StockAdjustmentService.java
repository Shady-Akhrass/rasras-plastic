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
public class StockAdjustmentService {

    private final StockAdjustmentRepository adjustmentRepo;
    private final StockAdjustmentItemRepository adjustmentItemRepo;
    private final StockBalanceRepository balanceRepo;
    private final WarehouseRepository warehouseRepo;
    private final ItemRepository itemRepo;
    private final UnitRepository unitRepo;
    private final InventoryService inventoryService;

    @Transactional(readOnly = true)
    public List<StockAdjustmentDto> getAll() {
        return adjustmentRepo.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StockAdjustmentDto getById(Integer id) {
        return adjustmentRepo.findById(id).map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException("Stock adjustment not found"));
    }

    @Transactional(readOnly = true)
    public List<StockAdjustmentDto> getByWarehouse(Integer warehouseId) {
        return adjustmentRepo.findByWarehouse_IdOrderByAdjustmentDateDesc(warehouseId).stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    /**
     * إنشاء جرد جديد: يجلب أرصدة المستودع ويجهزها للتسجيل
     */
    @Transactional
    public StockAdjustmentDto createCount(Integer warehouseId, String countType, LocalDateTime countDate, Integer userId) {
        Warehouse warehouse = warehouseRepo.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));

        String adjType = "PERIODIC".equalsIgnoreCase(countType) ? "PERIODIC" : "SURPRISE";
        String adjNumber = generateAdjustmentNumber();

        StockAdjustment adj = StockAdjustment.builder()
                .adjustmentNumber(adjNumber)
                .adjustmentDate(countDate != null ? countDate : LocalDateTime.now())
                .warehouse(warehouse)
                .adjustmentType(adjType)
                .reason("جرد " + ("PERIODIC".equals(adjType) ? "دوري" : "مفاجئ"))
                .status("Draft")
                .createdAt(LocalDateTime.now())
                .createdBy(userId != null ? userId : 1)
                .build();

        List<StockAdjustmentItem> items = new ArrayList<>();
        List<StockBalance> balances = balanceRepo.findByWarehouseId(warehouseId);
        for (StockBalance b : balances) {
            Item item = b.getItem();
            BigDecimal sysQty = b.getQuantityOnHand() != null ? b.getQuantityOnHand() : BigDecimal.ZERO;

            UnitOfMeasure unit = unitRepo.findById(item.getUnitId()).orElseThrow(() -> new RuntimeException("Unit not found for item: " + item.getId()));
            StockAdjustmentItem ai = StockAdjustmentItem.builder()
                    .adjustment(adj)
                    .item(item)
                    .systemQty(sysQty)
                    .actualQty(sysQty)
                    .unit(unit)
                    .unitCost(b.getAverageCost())
                    .notes(null)
                    .build();
            items.add(ai);
        }
        adj.setItems(items);
        StockAdjustment saved = adjustmentRepo.save(adj);
        return mapToDto(saved);
    }

    /**
     * تحديث كميات الجرد الفعلية
     */
    @Transactional
    public StockAdjustmentDto updateCountItems(Integer adjustmentId, List<StockAdjustmentItemDto> items, Integer userId) {
        StockAdjustment adj = adjustmentRepo.findById(adjustmentId)
                .orElseThrow(() -> new RuntimeException("Stock adjustment not found"));
        if (!"Draft".equals(adj.getStatus())) {
            throw new RuntimeException("Only Draft adjustment can be updated");
        }

        adj.getItems().clear();
        for (StockAdjustmentItemDto dto : items) {
            Item item = itemRepo.findById(dto.getItemId()).orElseThrow();
            UnitOfMeasure unit = unitRepo.findById(dto.getUnitId() != null ? dto.getUnitId() : item.getUnitId())
                    .orElseThrow(() -> new RuntimeException("Unit not found"));

            BigDecimal adjQty = (dto.getActualQty() != null ? dto.getActualQty() : BigDecimal.ZERO)
                    .subtract(dto.getSystemQty() != null ? dto.getSystemQty() : BigDecimal.ZERO);
            BigDecimal adjVal = adjQty.multiply(dto.getUnitCost() != null ? dto.getUnitCost() : BigDecimal.ZERO);

            StockAdjustmentItem ai = StockAdjustmentItem.builder()
                    .adjustment(adj)
                    .item(item)
                    .systemQty(dto.getSystemQty())
                    .actualQty(dto.getActualQty())
                    .unit(unit)
                    .unitCost(dto.getUnitCost())
                    .adjustmentValue(adjVal)
                    .notes(dto.getNotes())
                    .build();
            adj.getItems().add(ai);
        }
        return mapToDto(adjustmentRepo.save(adj));
    }

    /**
     * اعتماد الجرد وتطبيق التسويات على المخزون
     */
    @Transactional
    public StockAdjustmentDto approve(Integer adjustmentId, Integer userId) {
        StockAdjustment adj = adjustmentRepo.findById(adjustmentId)
                .orElseThrow(() -> new RuntimeException("Stock adjustment not found"));
        if (!"Draft".equals(adj.getStatus()) && !"Submitted".equals(adj.getStatus())) {
            throw new RuntimeException("Adjustment must be Draft or Submitted to approve");
        }

        int uid = userId != null ? userId : 1;
        Integer warehouseId = adj.getWarehouse().getId();

        for (StockAdjustmentItem ai : adj.getItems()) {
            BigDecimal diff = (ai.getActualQty() != null ? ai.getActualQty() : BigDecimal.ZERO)
                    .subtract(ai.getSystemQty() != null ? ai.getSystemQty() : BigDecimal.ZERO);
            if (diff.compareTo(BigDecimal.ZERO) == 0) continue;

            String direction = diff.compareTo(BigDecimal.ZERO) > 0 ? "IN" : "OUT";
            BigDecimal qty = diff.abs();
            BigDecimal unitCost = ai.getUnitCost() != null ? ai.getUnitCost() : BigDecimal.ZERO;

            inventoryService.updateStock(
                    ai.getItem().getId(),
                    warehouseId,
                    qty,
                    direction,
                    "ADJUSTMENT",
                    "StockAdjustment",
                    adj.getId(),
                    adj.getAdjustmentNumber(),
                    unitCost,
                    uid
            );
        }

        adj.setStatus("Approved");
        adj.setApprovedByUserId(uid);
        adj.setApprovedDate(LocalDateTime.now());
        adj.setPostedDate(LocalDateTime.now());
        return mapToDto(adjustmentRepo.save(adj));
    }

    @Transactional(readOnly = true)
    public List<StockAdjustmentDto> getApprovedForVarianceReport() {
        return adjustmentRepo.findApprovedAdjustments().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    private String generateAdjustmentNumber() {
        long c = adjustmentRepo.count() + 1;
        LocalDateTime n = LocalDateTime.now();
        return String.format("ADJ-%d%02d-%03d", n.getYear(), n.getMonthValue(), c);
    }

    private StockAdjustmentDto mapToDto(StockAdjustment a) {
        StockAdjustmentDto dto = StockAdjustmentDto.builder()
                .id(a.getId())
                .adjustmentNumber(a.getAdjustmentNumber())
                .adjustmentDate(a.getAdjustmentDate())
                .warehouseId(a.getWarehouse().getId())
                .warehouseNameAr(a.getWarehouse().getWarehouseNameAr())
                .adjustmentType(a.getAdjustmentType())
                .reason(a.getReason())
                .status(a.getStatus())
                .approvedByUserId(a.getApprovedByUserId())
                .approvedDate(a.getApprovedDate())
                .postedDate(a.getPostedDate())
                .notes(a.getNotes())
                .createdAt(a.getCreatedAt())
                .createdBy(a.getCreatedBy())
                .build();
        if (a.getItems() != null) {
            dto.setItems(a.getItems().stream().map(this::mapItemToDto).collect(Collectors.toList()));
        }
        return dto;
    }

    private StockAdjustmentItemDto mapItemToDto(StockAdjustmentItem ai) {
        BigDecimal sys = ai.getSystemQty() != null ? ai.getSystemQty() : BigDecimal.ZERO;
        BigDecimal act = ai.getActualQty() != null ? ai.getActualQty() : BigDecimal.ZERO;
        BigDecimal diff = ai.getAdjustmentQty() != null ? ai.getAdjustmentQty() : act.subtract(sys);

        return StockAdjustmentItemDto.builder()
                .id(ai.getId())
                .itemId(ai.getItem().getId())
                .itemCode(ai.getItem().getItemCode())
                .itemNameAr(ai.getItem().getItemNameAr())
                .unitId(ai.getUnit().getId())
                .unitNameAr(ai.getUnit().getUnitNameAr())
                .systemQty(sys)
                .actualQty(act)
                .adjustmentQty(diff)
                .unitCost(ai.getUnitCost())
                .adjustmentValue(ai.getAdjustmentValue())
                .notes(ai.getNotes())
                .build();
    }
}
