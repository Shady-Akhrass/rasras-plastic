package com.rasras.erp.inventory;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QualityParameterService {
    private final QualityParameterRepository repository;

    @Transactional(readOnly = true)
    public List<QualityParameterDto> getAll() {
        return repository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<QualityParameterDto> getActive() {
        return repository.findByIsActiveTrue().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public QualityParameterDto create(QualityParameterDto dto) {
        QualityParameter entity = mapToEntity(dto);
        return mapToDto(repository.save(entity));
    }

    @Transactional
    public QualityParameterDto update(Integer id, QualityParameterDto dto) {
        QualityParameter entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quality Parameter not found"));

        entity.setParameterCode(dto.getParameterCode());
        entity.setParameterNameAr(dto.getParameterNameAr());
        entity.setParameterNameEn(dto.getParameterNameEn());
        entity.setUnit(dto.getUnit());
        entity.setDataType(dto.getDataType());
        entity.setDescription(dto.getDescription());
        entity.setStandardValue(dto.getStandardValue());
        entity.setMinValue(dto.getMinValue());
        entity.setMaxValue(dto.getMaxValue());
        entity.setIsActive(dto.getIsActive());

        return mapToDto(repository.save(entity));
    }

    @Transactional
    public void delete(Integer id) {
        repository.deleteById(id);
    }

    private QualityParameterDto mapToDto(QualityParameter entity) {
        return QualityParameterDto.builder()
                .id(entity.getId())
                .parameterCode(entity.getParameterCode())
                .parameterNameAr(entity.getParameterNameAr())
                .parameterNameEn(entity.getParameterNameEn())
                .unit(entity.getUnit())
                .dataType(entity.getDataType())
                .description(entity.getDescription())
                .standardValue(entity.getStandardValue())
                .minValue(entity.getMinValue())
                .maxValue(entity.getMaxValue())
                .isActive(entity.getIsActive())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private QualityParameter mapToEntity(QualityParameterDto dto) {
        return QualityParameter.builder()
                .parameterCode(dto.getParameterCode())
                .parameterNameAr(dto.getParameterNameAr())
                .parameterNameEn(dto.getParameterNameEn())
                .unit(dto.getUnit())
                .dataType(dto.getDataType())
                .description(dto.getDescription())
                .standardValue(dto.getStandardValue())
                .minValue(dto.getMinValue())
                .maxValue(dto.getMaxValue())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();
    }
}
