package com.rasras.erp.inventory;

import com.rasras.erp.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ItemService {

        private final ItemRepository itemRepository;
        private final ItemCategoryRepository itemCategoryRepository;
        private final UnitRepository unitRepository;

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

        @Transactional
        public ItemDto createItem(ItemDto dto) {
                Item item = Item.builder()
                                .itemCode(dto.getItemCode())
                                .itemNameAr(dto.getItemNameAr())
                                .itemNameEn(dto.getItemNameEn())
                                .gradeName(dto.getGradeName())
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
                return mapToDto(itemRepository.save(item));
        }

        @Transactional
        public ItemDto updateItem(Integer id, ItemDto dto) {
                Item item = itemRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Item", "id", id));

                item.setItemCode(dto.getItemCode());
                item.setItemNameAr(dto.getItemNameAr());
                item.setItemNameEn(dto.getItemNameEn());
                item.setGradeName(dto.getGradeName());
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

                return mapToDto(itemRepository.save(item));
        }

        @Transactional
        public void deleteItem(Integer id) {
                Item item = itemRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Item", "id", id));
                item.setIsActive(false);
                itemRepository.save(item);
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
                                .gradeName(entity.getGradeName())
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
