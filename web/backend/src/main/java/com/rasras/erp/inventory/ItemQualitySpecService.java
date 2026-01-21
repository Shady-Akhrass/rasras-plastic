package com.rasras.erp.inventory;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ItemQualitySpecService {
    private final ItemQualitySpecRepository repository;
    private final QualityParameterRepository parameterRepository;

    @Transactional(readOnly = true)
    public List<ItemQualitySpecDto> getByItemId(Integer itemId) {
        return repository.findByItemId(itemId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ItemQualitySpecDto create(ItemQualitySpecDto dto) {
        ItemQualitySpec entity = mapToEntity(dto);
        return mapToDto(repository.save(entity));
    }

    @Transactional
    public ItemQualitySpecDto update(Integer id, ItemQualitySpecDto dto) {
        ItemQualitySpec entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quality Spec not found"));

        entity.setTargetValue(dto.getTargetValue());
        entity.setMinValue(dto.getMinValue());
        entity.setMaxValue(dto.getMaxValue());
        entity.setIsRequired(dto.getIsRequired());

        return mapToDto(repository.save(entity));
    }

    @Transactional
    public void delete(Integer id) {
        repository.deleteById(id);
    }

    private ItemQualitySpecDto mapToDto(ItemQualitySpec entity) {
        QualityParameter param = parameterRepository.findById(entity.getParameterId()).orElse(null);

        return ItemQualitySpecDto.builder()
                .id(entity.getId())
                .itemId(entity.getItemId())
                .parameterId(entity.getParameterId())
                .parameterNameAr(param != null ? param.getParameterNameAr() : null)
                .parameterNameEn(param != null ? param.getParameterNameEn() : null)
                .unit(param != null ? param.getUnit() : null)
                .dataType(param != null ? param.getDataType() : null)
                .targetValue(entity.getTargetValue())
                .minValue(entity.getMinValue())
                .maxValue(entity.getMaxValue())
                .isRequired(entity.getIsRequired())
                .build();
    }

    private ItemQualitySpec mapToEntity(ItemQualitySpecDto dto) {
        return ItemQualitySpec.builder()
                .id(dto.getId())
                .itemId(dto.getItemId())
                .parameterId(dto.getParameterId())
                .targetValue(dto.getTargetValue())
                .minValue(dto.getMinValue())
                .maxValue(dto.getMaxValue())
                .isRequired(dto.getIsRequired() != null ? dto.getIsRequired() : false)
                .isActive(true)
                .build();
    }
}
