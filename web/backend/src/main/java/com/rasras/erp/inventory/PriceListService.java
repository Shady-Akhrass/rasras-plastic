package com.rasras.erp.inventory;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PriceListService {
    private final PriceListRepository repository;
    private final PriceListItemRepository itemRepository;
    private final ItemRepository inventoryItemRepository;

    @Transactional(readOnly = true)
    public List<PriceListDto> getAll() {
        return repository.findAll().stream()
                .map(entity -> {
                    PriceListDto dto = mapToDto(entity);
                    dto.setItems(itemRepository.findByPriceListId(entity.getId()).stream()
                            .map(this::mapToItemDto)
                            .collect(Collectors.toList()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PriceListDto getById(Integer id) {
        PriceList entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Price List not found"));
        PriceListDto dto = mapToDto(entity);
        dto.setItems(itemRepository.findByPriceListId(id).stream()
                .map(this::mapToItemDto)
                .collect(Collectors.toList()));
        return dto;
    }

    @Transactional
    public PriceListDto create(PriceListDto dto) {
        PriceList entity = mapToEntity(dto);
        PriceList saved = repository.save(entity);

        if (dto.getItems() != null) {
            Integer nextId = itemRepository.findMaxId();
            int currentId = (nextId != null) ? nextId + 1 : 1;

            for (PriceListItemDto iDto : dto.getItems()) {
                PriceListItem item = mapToItemEntity(iDto);
                item.setPriceListId(saved.getId());
                item.setId(currentId++);
                itemRepository.save(item);
            }
        }

        return getById(saved.getId());
    }

    @Transactional
    public PriceListDto update(Integer id, PriceListDto dto) {
        PriceList entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Price List not found"));

        entity.setPriceListCode(dto.getPriceListCode());
        entity.setPriceListName(dto.getPriceListName());
        entity.setLegacyListNameAr(dto.getPriceListName()); // Populate legacy field
        entity.setListType(dto.getListType());
        entity.setCurrency(
                dto.getCurrency() != null && dto.getCurrency().length() > 3 ? dto.getCurrency().substring(0, 3)
                        : dto.getCurrency());
        entity.setValidFrom(dto.getValidFrom());
        entity.setValidTo(dto.getValidTo());
        entity.setIsActive(dto.getIsActive());

        repository.save(entity);

        // Refresh items
        itemRepository.deleteByPriceListId(id);
        if (dto.getItems() != null) {
            Integer nextId = itemRepository.findMaxId();
            int currentId = (nextId != null) ? nextId + 1 : 1;

            for (PriceListItemDto iDto : dto.getItems()) {
                PriceListItem item = mapToItemEntity(iDto);
                item.setPriceListId(id);
                item.setId(currentId++);
                itemRepository.save(item);
            }
        }

        return getById(id);
    }

    @Transactional
    public void delete(Integer id) {
        itemRepository.deleteByPriceListId(id);
        repository.deleteById(id);
    }

    private PriceListDto mapToDto(PriceList entity) {
        return PriceListDto.builder()
                .id(entity.getId())
                .priceListCode(entity.getPriceListCode())
                .priceListName(entity.getPriceListName())
                .listType(entity.getListType())
                .currency(entity.getCurrency())
                .validFrom(entity.getValidFrom())
                .validTo(entity.getValidTo())
                .isActive(entity.getIsActive())
                .build();
    }

    private PriceListItemDto mapToItemDto(PriceListItem entity) {
        Item inventoryItem = inventoryItemRepository.findById(entity.getItemId()).orElse(null);
        return PriceListItemDto.builder()
                .id(entity.getId())
                .priceListId(entity.getPriceListId())
                .itemId(entity.getItemId())
                .itemNameAr(inventoryItem != null ? inventoryItem.getItemNameAr() : null)
                .itemCode(inventoryItem != null ? inventoryItem.getItemCode() : null)
                .unitPrice(entity.getUnitPrice())
                .minQty(entity.getMinQty())
                .maxQty(entity.getMaxQty())
                .discountPercentage(entity.getDiscountPercentage())
                .build();
    }

    private PriceList mapToEntity(PriceListDto dto) {
        return PriceList.builder()
                .priceListCode(
                        dto.getPriceListCode() != null ? dto.getPriceListCode() : "PL-" + System.currentTimeMillis())
                .priceListName(dto.getPriceListName())
                .legacyListNameAr(dto.getPriceListName()) // Populate legacy field
                .listType(dto.getListType())
                .currency(
                        dto.getCurrency() != null && dto.getCurrency().length() > 3 ? dto.getCurrency().substring(0, 3)
                                : dto.getCurrency())
                .validFrom(dto.getValidFrom())
                .validTo(dto.getValidTo())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();
    }

    private PriceListItem mapToItemEntity(PriceListItemDto dto) {
        return PriceListItem.builder()
                .itemId(dto.getItemId())
                .unitPrice(dto.getUnitPrice())
                .legacyPrice(dto.getUnitPrice()) // Populate legacy field
                .minQty(dto.getMinQty())
                .maxQty(dto.getMaxQty())
                .discountPercentage(dto.getDiscountPercentage())
                .build();
    }
}
