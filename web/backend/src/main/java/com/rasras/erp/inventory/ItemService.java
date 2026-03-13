package com.rasras.erp.inventory;

import com.rasras.erp.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
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
        private final com.rasras.erp.finance.ExchangeRateService exchangeRateService;
        private final PriceListService priceListService;
        private final ItemExchangeRateHistoryRepository itemRateHistoryRepo;

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
                                .purchasePriceUsd(dto.getPurchasePriceUsd())
                                .purchaseExchangeRate(dto.getPurchaseExchangeRate())
                                .targetProfitMarginPercentage(dto.getTargetProfitMarginPercentage())
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
                item.setPurchasePriceUsd(dto.getPurchasePriceUsd());
                item.setPurchaseExchangeRate(dto.getPurchaseExchangeRate());
                item.setTargetProfitMarginPercentage(dto.getTargetProfitMarginPercentage());
                item.setIsActive(dto.getIsActive());
                item.setIsSellable(dto.getIsSellable());
                item.setIsPurchasable(dto.getIsPurchasable());

                try {
                        ItemDto savedDto = mapToDto(itemRepository.save(item));
                        priceListService.syncPriceListsForItem(id, item.getLastSalePrice(),
                                        item.getLastPurchasePrice());
                        return savedDto;
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
                // EGP pricing fields are now auto-calculated based on USD prices and logic,
                // so we don't strictly require them to be > 0 on manual entry.
                // We only ensure purchasePriceUsd is valid if provided.
                if (dto.getPurchasePriceUsd() != null && dto.getPurchasePriceUsd().compareTo(BigDecimal.ZERO) < 0) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                        "سعر الشراء بالدولار لا يمكن أن يكون سالباً");
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
                                .purchasePriceUsd(entity.getPurchasePriceUsd())
                                .purchaseExchangeRate(entity.getPurchaseExchangeRate())
                                .targetProfitMarginPercentage(entity.getTargetProfitMarginPercentage())
                                .isActive(entity.getIsActive())
                                .isSellable(entity.getIsSellable())
                                .isPurchasable(entity.getIsPurchasable())
                                .createdAt(entity.getCreatedAt())
                                .build();
        }

        /**
         * Calculates the suggested pricing based on current exchange rate and buffer.
         */
        public BigDecimal calculateSuggestedReplacementPrice(Item item) {
                if (item.getPurchasePriceUsd() == null)
                        return item.getReplacementPrice();

                // Use a default of 7 selling days and 1.5 safety factor for now
                // In a real app these could be settings or dynamic
                BigDecimal effectiveRate = exchangeRateService.getEffectiveExchangeRate(7, 1.5);
                return item.getPurchasePriceUsd().multiply(effectiveRate).setScale(2, java.math.RoundingMode.HALF_UP);
        }

        public BigDecimal calculateSuggestedSellingPrice(Item item) {
                BigDecimal cost = calculateSuggestedReplacementPrice(item);
                BigDecimal margin = item.getTargetProfitMarginPercentage();

                if (margin == null || margin.compareTo(BigDecimal.ZERO) == 0) {
                        return item.getLastSalePrice();
                }

                // Price = Cost * (1 + Margin/100)
                return cost.multiply(
                                BigDecimal.ONE.add(margin.divide(BigDecimal.valueOf(100), 10,
                                                java.math.RoundingMode.HALF_UP)))
                                .setScale(2, java.math.RoundingMode.HALF_UP);
        }

        /**
         * Updates item pricing automatically when a purchase is finalized (GRN
         * store-in).
         * - If current stock = 0 → standardCost uses the new purchase cost directly
         * - If current stock > 0 → standardCost = weighted average (MAC)
         * - lastPurchasePrice = USD × market rate
         * - replacementPrice = USD × effective rate (includes buffer)
         * - lastSalePrice = replacementPrice × (1 + margin/100)
         * - Syncs all price list entries for this item
         */
        @Transactional
        public void updatePricingFromPurchase(Integer itemId, BigDecimal purchasePriceUsd, BigDecimal receivedQty,
                        BigDecimal purchaseRate) {
                Item item = itemRepository.findById(itemId)
                                .orElseThrow(() -> new RuntimeException("Item not found: " + itemId));

                BigDecimal rateToRecord;
                if (purchaseRate != null && purchaseRate.compareTo(BigDecimal.ZERO) > 0) {
                        rateToRecord = purchaseRate;
                } else {
                        rateToRecord = exchangeRateService.getCurrentRate();
                }

                // Record exchange rate history for this item
                itemRateHistoryRepo.save(ItemExchangeRateHistory.builder()
                                .itemId(itemId)
                                .exchangeRate(rateToRecord)
                                .purchasePriceUsd(purchasePriceUsd)
                                .sourceType("GRN")
                                .recordedAt(java.time.LocalDateTime.now())
                                .build());

                // 1. Calculate weighted average EGP cost (Moving Average Cost)
                List<StockBalance> balances = stockBalanceRepository.findByItemId(itemId);
                BigDecimal currentTotalQty = balances.stream()
                                .map(b -> b.getQuantityOnHand() != null ? b.getQuantityOnHand() : BigDecimal.ZERO)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                // Since stock increased before this call, subtract to get previous state
                BigDecimal previousStockQty = currentTotalQty.subtract(receivedQty).max(BigDecimal.ZERO);

                // Old EGP Cost = standardCost (which is our MAC in EGP)
                BigDecimal oldEgpCost = item.getStandardCost() != null ? item.getStandardCost()
                                : BigDecimal.ZERO;

                // New transaction EGP cost
                BigDecimal newEgpCost = purchasePriceUsd.multiply(rateToRecord);

                BigDecimal weightedEgpCost;
                if (previousStockQty.compareTo(BigDecimal.ZERO) <= 0) {
                        weightedEgpCost = newEgpCost;
                } else {
                        BigDecimal totalOldValueEgp = previousStockQty.multiply(oldEgpCost);
                        BigDecimal totalNewValueEgp = receivedQty.multiply(newEgpCost);
                        BigDecimal totalQty = previousStockQty.add(receivedQty);
                        weightedEgpCost = totalOldValueEgp.add(totalNewValueEgp)
                                        .divide(totalQty, 2, RoundingMode.HALF_UP);
                }

                // Update Item fields
                item.setPurchasePriceUsd(purchasePriceUsd);
                item.setPurchaseExchangeRate(rateToRecord);

                // Standard Cost (EGP) = Moving Average Cost
                item.setStandardCost(weightedEgpCost);

                // Last Purchase Price (EGP)
                item.setLastPurchasePrice(
                                purchasePriceUsd.multiply(rateToRecord).setScale(2, RoundingMode.HALF_UP));

                // Replacement Price (EGP) = Moving Average Cost (Locked to purchase rate)
                // This ensures profit margin is relative to the actual acquired cost, not daily
                // volatility
                item.setReplacementPrice(weightedEgpCost);

                // Update selling prices based on the new replacement price
                updateSellingPrices(item);

                itemRepository.save(item);
                priceListService.syncPriceListsForItem(itemId, item.getLastSalePrice(), item.getLastPurchasePrice());
        }

        @Transactional
        public void updatePricingFromInvoice(Integer itemId, BigDecimal newUnitPriceUsd, BigDecimal receivedQty,
                        BigDecimal purchaseRate) {
                Item item = itemRepository.findById(itemId)
                                .orElseThrow(() -> new RuntimeException("Item not found: " + itemId));

                BigDecimal rateToRecord;
                if (purchaseRate != null && purchaseRate.compareTo(BigDecimal.ZERO) > 0) {
                        rateToRecord = purchaseRate;
                } else {
                        rateToRecord = exchangeRateService.getCurrentRate();
                }

                // Record exchange rate history for this item
                itemRateHistoryRepo.save(ItemExchangeRateHistory.builder()
                                .itemId(itemId)
                                .exchangeRate(rateToRecord)
                                .purchasePriceUsd(newUnitPriceUsd)
                                .sourceType("INVOICE")
                                .recordedAt(java.time.LocalDateTime.now())
                                .build());

                // 1. Calculate Weighted Average EGP Cost (Moving Average Cost)
                List<StockBalance> balances = stockBalanceRepository.findByItemId(itemId);
                BigDecimal currentTotalQty = balances.stream()
                                .map(b -> b.getQuantityOnHand() != null ? b.getQuantityOnHand() : BigDecimal.ZERO)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal previousStockQty = currentTotalQty.subtract(receivedQty).max(BigDecimal.ZERO);

                // Old EGP Cost = standardCost (MAC in EGP)
                BigDecimal oldEgpCost = item.getStandardCost() != null ? item.getStandardCost()
                                : BigDecimal.ZERO;

                // New transaction EGP cost
                BigDecimal newEgpCost = newUnitPriceUsd.multiply(rateToRecord);

                BigDecimal weightedEgpCost;
                if (previousStockQty.compareTo(BigDecimal.ZERO) <= 0) {
                        weightedEgpCost = newEgpCost;
                } else {
                        BigDecimal totalOldValueEgp = previousStockQty.multiply(oldEgpCost);
                        BigDecimal totalNewValueEgp = receivedQty.multiply(newEgpCost);
                        BigDecimal totalQty = previousStockQty.add(receivedQty);
                        weightedEgpCost = totalOldValueEgp.add(totalNewValueEgp)
                                        .divide(totalQty, 2, RoundingMode.HALF_UP);
                }

                // Update Item fields
                item.setPurchasePriceUsd(newUnitPriceUsd);
                item.setPurchaseExchangeRate(rateToRecord);

                // Standard Cost (EGP) = Moving Average Cost
                item.setStandardCost(weightedEgpCost);

                // Last Purchase Price (EGP)
                item.setLastPurchasePrice(
                                newUnitPriceUsd.multiply(rateToRecord).setScale(2, RoundingMode.HALF_UP));

                // Replacement Price (EGP) = Moving Average Cost (Locked to purchase rate)
                item.setReplacementPrice(weightedEgpCost);

                // Update selling prices
                updateSellingPrices(item);

                itemRepository.save(item);
                priceListService.syncPriceListsForItem(itemId, item.getLastSalePrice(), item.getLastPurchasePrice());
        }

        private void updateSellingPrices(Item item) {
                BigDecimal replacementPrice = item.getReplacementPrice();
                if (replacementPrice == null)
                        return;

                BigDecimal targetMargin = item.getTargetProfitMarginPercentage() != null
                                ? item.getTargetProfitMarginPercentage()
                                : BigDecimal.ZERO;

                BigDecimal sellingPrice = replacementPrice;
                if (targetMargin.compareTo(BigDecimal.ZERO) > 0) {
                        BigDecimal marginMultiplier = BigDecimal.ONE.add(
                                        targetMargin.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));
                        sellingPrice = replacementPrice.multiply(marginMultiplier).setScale(2, RoundingMode.HALF_UP);
                }
                item.setLastSalePrice(sellingPrice);
        }

        /**
         * Returns the exchange rate history for a specific item, for display on the
         * pricing tab.
         */
        public java.util.Map<String, Object> getItemPricingInfo(Integer itemId) {
                java.util.List<ItemExchangeRateHistory> history = itemRateHistoryRepo
                                .findTop10ByItemIdOrderByRecordedAtDesc(itemId);

                BigDecimal itemBuffer = exchangeRateService.calculateBufferForItem(itemId, 30, 1.5);
                BigDecimal globalBuffer = exchangeRateService.calculateBufferPercentage(30, 1.5);
                BigDecimal currentRate = exchangeRateService.getCurrentRate();
                BigDecimal effectiveRate = exchangeRateService.getEffectiveExchangeRateForItem(itemId, 30, 1.5);

                java.util.Map<String, Object> result = new java.util.HashMap<>();
                result.put("history", history);
                result.put("itemBufferPercentage", itemBuffer);
                result.put("globalBufferPercentage", globalBuffer);
                result.put("currentMarketRate", currentRate);
                result.put("effectiveRate", effectiveRate);
                return result;
        }
}