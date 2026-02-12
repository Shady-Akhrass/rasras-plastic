package com.rasras.erp.inventory;

import com.rasras.erp.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import com.rasras.erp.procurement.PurchaseReturnItem;
import com.rasras.erp.procurement.PurchaseReturnItemRepository;

@Service
@RequiredArgsConstructor
public class ItemService {

        private final ItemRepository itemRepository;
        private final ItemCategoryRepository itemCategoryRepository;
        private final UnitRepository unitRepository;
        private final StockBalanceRepository stockBalanceRepository;
        private final StockMovementRepository stockMovementRepository;
        private final GRNItemRepository grnItemRepository;
        private final PurchaseReturnItemRepository purchaseReturnItemRepository;

        public List<ItemDto> getAllItems() {
                List<Item> items = itemRepository.findAll();

                // Lookups for related names
                var categoryMap = itemCategoryRepository.findAll().stream()
                                .collect(Collectors.toMap(ItemCategory::getId, ItemCategory::getCategoryNameAr));
                var unitMap = unitRepository.findAll().stream()
                                .collect(Collectors.toMap(UnitOfMeasure::getId, UnitOfMeasure::getUnitNameAr));

                return items.stream()
                                .map(i -> mapToDtoWithLookup(i, categoryMap, unitMap))
                                .collect(Collectors.toList());
        }

        public List<ItemDto> getActiveItems() {
                return getAllItems().stream()
                                .filter(ItemDto::getIsActive)
                                .collect(Collectors.toList());
        }

        public ItemDto getItemById(Integer id) {
                return itemRepository.findById(id)
                                .map(this::mapToDto)
                                .orElseThrow(() -> new ResourceNotFoundException("Item", "id", id));
        }

        private String generateItemCode() {
                try {
                        Integer maxSeq = itemRepository.findMaxItemCodeSequence();
                        int next = (maxSeq != null ? maxSeq : 0) + 1;
                        return String.format("ITEM-%05d", next);
                } catch (Exception e) {
                        long n = itemRepository.count() + 1;
                        return String.format("ITEM-%05d", n);
                }
        }

        @Transactional
        public ItemDto createItem(ItemDto dto) {
                if (dto.getCategoryId() == null || dto.getCategoryId() <= 0) {
                        throw new org.springframework.web.server.ResponseStatusException(
                                        org.springframework.http.HttpStatus.BAD_REQUEST, "يرجى اختيار التصنيف");
                }
                if (dto.getUnitId() == null || dto.getUnitId() <= 0) {
                        throw new org.springframework.web.server.ResponseStatusException(
                                        org.springframework.http.HttpStatus.BAD_REQUEST, "يرجى اختيار وحدة القياس");
                }
                if (dto.getItemNameAr() == null || dto.getItemNameAr().trim().isEmpty()) {
                        throw new org.springframework.web.server.ResponseStatusException(
                                        org.springframework.http.HttpStatus.BAD_REQUEST, "الاسم العربي مطلوب");
                }

                validateStockLevels(dto);
                validatePriceFields(dto);
                Item item = Item.builder()
                                .itemCode(generateItemCode())
                                .itemNameAr(dto.getItemNameAr())
                                .itemNameEn(dto.getItemNameEn())
                                .grade(dto.getGrade())
                                .gradeName(dto.getGradeName())
                                .mi2(dto.getMi2())
                                .mi21(dto.getMi21())
                                .density(dto.getDensity())
                                .categoryId(dto.getCategoryId())
                                .unitId(dto.getUnitId())
                                .barcode(dto.getBarcode())
                                .description(dto.getDescription())
                                .technicalSpecs(dto.getTechnicalSpecs())
                                .minStockLevel(dto.getMinStockLevel())
                                .maxStockLevel(dto.getMaxStockLevel())
                                .reorderLevel(dto.getReorderLevel())
                                .avgMonthlyConsumption(dto.getAvgMonthlyConsumption())
                                .standardCost(dto.getStandardCost())
                                .lastPurchasePrice(dto.getLastPurchasePrice())
                                .replacementPrice(dto.getReplacementPrice())
                                .lastSalePrice(dto.getLastSalePrice())
                                .defaultVatRate(dto.getDefaultVatRate())
                                .imagePath(dto.getImagePath())
                                .isActive(true)
                                .isSellable(dto.getIsSellable() != null ? dto.getIsSellable() : true)
                                .isPurchasable(dto.getIsPurchasable() != null ? dto.getIsPurchasable() : true)
                                .createdAt(java.time.LocalDateTime.now())
                                .build();
                try {
                        return mapToDto(itemRepository.save(item));
                } catch (DataIntegrityViolationException e) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                        "البيانات المرتبطة غير صحيحة - تحقق من الحقول المرتبطة (مندوب المبيعات، قائمة الأسعار، التصنيف، أو وحدة القياس)");
                }
        }

        @Transactional
        public ItemDto updateItem(Integer id, ItemDto dto) {
                Item item = itemRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Item", "id", id));

                validateStockLevels(dto);
                validatePriceFields(dto);

                item.setItemNameAr(dto.getItemNameAr());
                item.setItemNameEn(dto.getItemNameEn());
                item.setGrade(dto.getGrade());
                item.setGradeName(dto.getGradeName());
                item.setMi2(dto.getMi2());
                item.setMi21(dto.getMi21());
                item.setDensity(dto.getDensity());
                item.setCategoryId(dto.getCategoryId());
                item.setUnitId(dto.getUnitId());
                item.setBarcode(dto.getBarcode());
                item.setDescription(dto.getDescription());
                item.setTechnicalSpecs(dto.getTechnicalSpecs());
                item.setMinStockLevel(dto.getMinStockLevel());
                item.setMaxStockLevel(dto.getMaxStockLevel());
                item.setReorderLevel(dto.getReorderLevel());
                item.setAvgMonthlyConsumption(dto.getAvgMonthlyConsumption());
                item.setStandardCost(dto.getStandardCost());
                item.setLastPurchasePrice(dto.getLastPurchasePrice());
                item.setReplacementPrice(dto.getReplacementPrice());
                item.setLastSalePrice(dto.getLastSalePrice());
                item.setDefaultVatRate(dto.getDefaultVatRate());
                item.setImagePath(dto.getImagePath());
                item.setIsActive(dto.getIsActive());
                item.setIsSellable(dto.getIsSellable());
                item.setIsPurchasable(dto.getIsPurchasable());

                try {
                        return mapToDto(itemRepository.save(item));
                } catch (DataIntegrityViolationException e) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                        "البيانات المرتبطة غير صحيحة - تحقق من الحقول المرتبطة (مندوب المبيعات، قائمة الأسعار، التصنيف، أو وحدة القياس)");
                }
        }

        private void validateStockLevels(ItemDto dto) {
                BigDecimal min = dto.getMinStockLevel();
                BigDecimal reorder = dto.getReorderLevel();
                BigDecimal max = dto.getMaxStockLevel();

                if (min == null || reorder == null || max == null) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                        "مستويات المخزون (الحد الأدنى، حد إعادة الطلب، الحد الأقصى) مطلوبة");
                }

                if (min.compareTo(BigDecimal.ZERO) <= 0
                                || reorder.compareTo(BigDecimal.ZERO) <= 0
                                || max.compareTo(BigDecimal.ZERO) <= 0) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                        "مستويات المخزون يجب أن تكون أكبر من صفر");
                }

                if (min.compareTo(reorder) > 0 || reorder.compareTo(max) > 0) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                        "الحد الأدنى يجب أن يكون ≤ حد إعادة الطلب ≤ الحد الأقصى");
                }
        }

        private void validatePriceFields(ItemDto dto) {
                BigDecimal standardCost = dto.getStandardCost();
                BigDecimal lastPurchasePrice = dto.getLastPurchasePrice();
                BigDecimal lastSalePrice = dto.getLastSalePrice();
                BigDecimal replacementPrice = dto.getReplacementPrice();

                if (standardCost == null || lastPurchasePrice == null
                                || lastSalePrice == null || replacementPrice == null) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                        "الأسعار والتكاليف (التكلفة المعيارية، آخر سعر شراء، آخر سعر بيع، السعر الاستبدالي) مطلوبة");
                }

                if (standardCost.compareTo(BigDecimal.ZERO) <= 0
                                || lastPurchasePrice.compareTo(BigDecimal.ZERO) <= 0
                                || lastSalePrice.compareTo(BigDecimal.ZERO) <= 0
                                || replacementPrice.compareTo(BigDecimal.ZERO) <= 0) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                        "الأسعار والتكاليف يجب أن تكون أكبر من صفر");
                }
        }

        @Transactional
        public void deleteItem(Integer id) {
                Item item = itemRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Item", "id", id));

                List<StockBalance> balances = stockBalanceRepository.findByItemId(id);
                BigDecimal totalStock = balances.stream()
                                .map(StockBalance::getQuantityOnHand)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                if (totalStock.compareTo(BigDecimal.ZERO) > 0) {
                        throw new ResponseStatusException(HttpStatus.CONFLICT,
                                        "لا يمكن حذف الصنف لوجود كمية في المخزون. يجب أن تكون الكمية صفراً للحذف.");
                }

                try {
                        List<GRNItem> grnItems = grnItemRepository.findByItemId(id);
                        List<Integer> grnItemIds = grnItems.stream().map(GRNItem::getId).toList();
                        if (!grnItemIds.isEmpty()) {
                                List<PurchaseReturnItem> returnItems = purchaseReturnItemRepository
                                                .findByGrnItemIdIn(grnItemIds);
                                purchaseReturnItemRepository.deleteAll(returnItems);
                        }
                        grnItemRepository.deleteAll(grnItems);
                        List<StockMovement> movements = stockMovementRepository.findByItemId(id);
                        stockMovementRepository.deleteAll(movements);
                        stockBalanceRepository.deleteAll(balances);
                        itemRepository.delete(item);
                } catch (DataIntegrityViolationException e) {
                        throw new ResponseStatusException(HttpStatus.CONFLICT,
                                        "لا يمكن حذف الصنف لوجود استخدامات له في مستندات أخرى (مثل عروض الأسعار، أوامر الشراء/البيع، قوائم الأسعار، ...). يرجى مراجعة المستندات المرتبطة أولاً.");
                }
        }

        private ItemDto mapToDto(Item entity) {
                String categoryName = itemCategoryRepository.findById(entity.getCategoryId())
                                .map(ItemCategory::getCategoryNameAr)
                                .orElse(null);
                String unitName = unitRepository.findById(entity.getUnitId())
                                .map(UnitOfMeasure::getUnitNameAr)
                                .orElse(null);
                return mapToDtoInternal(entity, categoryName, unitName);
        }

        private ItemDto mapToDtoWithLookup(Item entity, java.util.Map<Integer, String> categoryMap,
                        java.util.Map<Integer, String> unitMap) {
                String categoryName = categoryMap.get(entity.getCategoryId());
                String unitName = unitMap.get(entity.getUnitId());
                return mapToDtoInternal(entity, categoryName, unitName);
        }

        private ItemDto mapToDtoInternal(Item entity, String categoryName, String unitName) {
                return ItemDto.builder()
                                .id(entity.getId())
                                .itemCode(entity.getItemCode())
                                .itemNameAr(entity.getItemNameAr())
                                .itemNameEn(entity.getItemNameEn())
                                .grade(entity.getGrade())
                                .gradeName(entity.getGradeName())
                                .mi2(entity.getMi2())
                                .mi21(entity.getMi21())
                                .density(entity.getDensity())
                                .categoryId(entity.getCategoryId())
                                .categoryName(categoryName)
                                .unitId(entity.getUnitId())
                                .unitName(unitName)
                                .barcode(entity.getBarcode())
                                .description(entity.getDescription())
                                .technicalSpecs(entity.getTechnicalSpecs())
                                .minStockLevel(entity.getMinStockLevel())
                                .maxStockLevel(entity.getMaxStockLevel())
                                .reorderLevel(entity.getReorderLevel())
                                .avgMonthlyConsumption(entity.getAvgMonthlyConsumption())
                                .standardCost(entity.getStandardCost())
                                .lastPurchasePrice(entity.getLastPurchasePrice())
                                .replacementPrice(entity.getReplacementPrice())
                                .lastSalePrice(entity.getLastSalePrice())
                                .defaultVatRate(entity.getDefaultVatRate())
                                .imagePath(entity.getImagePath())
                                .isActive(entity.getIsActive())
                                .isSellable(entity.getIsSellable())
                                .isPurchasable(entity.getIsPurchasable())
                                .createdAt(entity.getCreatedAt())
                                .build();
        }
}
