package com.rasras.erp.inventory;

import com.rasras.erp.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ItemCategoryService {

    private final ItemCategoryRepository itemCategoryRepository;
    private final ItemRepository itemRepository;

    public List<ItemCategoryDto> getAllCategories() {
        List<ItemCategory> categories = itemCategoryRepository.findAll();
        var categoryMap = categories.stream()
                .collect(Collectors.toMap(c -> c.getId(), c -> c.getCategoryNameAr()));

        return categories.stream()
                .map(c -> mapToDtoWithLookup(c, categoryMap))
                .collect(Collectors.toList());
    }

    public List<ItemCategoryDto> getActiveCategories() {
        return getAllCategories().stream()
                .filter(ItemCategoryDto::getIsActive)
                .collect(Collectors.toList());
    }

    public ItemCategoryDto getCategoryById(Integer id) {
        return itemCategoryRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new ResourceNotFoundException("ItemCategory", "id", id));
    }

    @Transactional
    public ItemCategoryDto createCategory(ItemCategoryDto dto) {
        ItemCategory category = ItemCategory.builder()
                .categoryCode(dto.getCategoryCode())
                .categoryNameAr(dto.getCategoryNameAr())
                .categoryNameEn(dto.getCategoryNameEn())
                .parentCategoryId(dto.getParentCategoryId())
                .description(dto.getDescription())
                .isActive(true)
                .createdAt(java.time.LocalDateTime.now())
                .build();
        return mapToDto(itemCategoryRepository.save(category));
    }

    @Transactional
    public ItemCategoryDto updateCategory(Integer id, ItemCategoryDto dto) {
        ItemCategory category = itemCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ItemCategory", "id", id));

        category.setCategoryCode(dto.getCategoryCode());
        category.setCategoryNameAr(dto.getCategoryNameAr());
        category.setCategoryNameEn(dto.getCategoryNameEn());
        category.setParentCategoryId(dto.getParentCategoryId());
        category.setDescription(dto.getDescription());
        category.setIsActive(dto.getIsActive());

        return mapToDto(itemCategoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Integer id) {
        ItemCategory category = itemCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ItemCategory", "id", id));
        if (itemRepository.existsByCategoryId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "لا يمكن حذف التصنيف لوجود أصناف مرتبطة به. انقل الأصناف لتصنيف آخر ثم احذف.");
        }
        List<ItemCategory> children = itemCategoryRepository.findByParentCategoryId(id);
        for (ItemCategory child : children) {
            child.setParentCategoryId(null);
            itemCategoryRepository.save(child);
        }
        itemCategoryRepository.delete(category);
    }

    private ItemCategoryDto mapToDto(ItemCategory entity) {
        String parentCategoryName = null;
        if (entity.getParentCategoryId() != null) {
            parentCategoryName = itemCategoryRepository.findById(entity.getParentCategoryId())
                    .map(ItemCategory::getCategoryNameAr)
                    .orElse(null);
        }
        return mapToDtoInternal(entity, parentCategoryName);
    }

    private ItemCategoryDto mapToDtoWithLookup(ItemCategory entity, java.util.Map<Integer, String> lookup) {
        String parentCategoryName = lookup.get(entity.getParentCategoryId());
        return mapToDtoInternal(entity, parentCategoryName);
    }

    private ItemCategoryDto mapToDtoInternal(ItemCategory entity, String parentCategoryName) {
        return ItemCategoryDto.builder()
                .id(entity.getId())
                .categoryCode(entity.getCategoryCode())
                .categoryNameAr(entity.getCategoryNameAr())
                .categoryNameEn(entity.getCategoryNameEn())
                .parentCategoryId(entity.getParentCategoryId())
                .parentCategoryName(parentCategoryName)
                .description(entity.getDescription())
                .isActive(entity.getIsActive())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
