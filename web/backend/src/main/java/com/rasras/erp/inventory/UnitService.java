package com.rasras.erp.inventory;

import com.rasras.erp.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UnitService {

    private final UnitRepository unitRepository;

    public List<UnitDto> getAllUnits() {
        List<UnitOfMeasure> units = unitRepository.findAll();
        // Create a map for quick base unit name lookup
        var unitMap = units.stream()
                .collect(Collectors.toMap(UnitOfMeasure::getId, UnitOfMeasure::getUnitNameAr));

        return units.stream()
                .map(u -> mapToDtoWithLookup(u, unitMap))
                .collect(Collectors.toList());
    }

    public List<UnitDto> getActiveUnits() {
        // For active, we might miss the base unit if it's inactive, but generally safe
        // to use findAll logic or optimized repo query
        // Re-using getAllUnits logic but filtering for simplicity and safety
        return getAllUnits().stream().filter(UnitDto::getIsActive).collect(Collectors.toList());
    }

    public UnitDto getUnitById(Integer id) {
        return unitRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new ResourceNotFoundException("Unit", "id", id));
    }

    @Transactional
    public UnitDto createUnit(UnitDto dto) {
        validateUnit(dto);
        UnitOfMeasure unit = UnitOfMeasure.builder()
                .unitCode(dto.getUnitCode())
                .unitNameAr(dto.getUnitNameAr())
                .unitNameEn(dto.getUnitNameEn())
                .isBaseUnit(dto.getIsBaseUnit())
                .baseUnitId(dto.getIsBaseUnit() ? null : dto.getBaseUnitId())
                .conversionFactor(dto.getIsBaseUnit() ? java.math.BigDecimal.ONE : dto.getConversionFactor())
                .isActive(true)
                .build();
        return mapToDto(unitRepository.save(unit));
    }

    @Transactional
    public UnitDto updateUnit(Integer id, UnitDto dto) {
        validateUnit(dto);
        UnitOfMeasure unit = unitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unit", "id", id));

        unit.setUnitCode(dto.getUnitCode());
        unit.setUnitNameAr(dto.getUnitNameAr());
        unit.setUnitNameEn(dto.getUnitNameEn());
        unit.setIsBaseUnit(dto.getIsBaseUnit());

        if (dto.getIsBaseUnit()) {
            unit.setBaseUnitId(null);
            unit.setConversionFactor(java.math.BigDecimal.ONE);
        } else {
            unit.setBaseUnitId(dto.getBaseUnitId());
            unit.setConversionFactor(dto.getConversionFactor());
        }

        unit.setIsActive(dto.getIsActive());

        return mapToDto(unitRepository.save(unit));
    }

    @Transactional
    public void deleteUnit(Integer id) {
        UnitOfMeasure unit = unitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unit", "id", id));
        unit.setIsActive(false);
        unitRepository.save(unit);
    }

    private void validateUnit(UnitDto dto) {
        if (!dto.getIsBaseUnit()) {
            if (dto.getBaseUnitId() == null) {
                throw new IllegalArgumentException("Sub-units must have a Base Unit selected.");
            }
            if (dto.getConversionFactor() == null) {
                throw new IllegalArgumentException("Sub-units must have a Conversion Factor.");
            }
        }
    }

    private UnitDto mapToDto(UnitOfMeasure entity) {
        // Fallback for individual fetch
        String baseUnitName = null;
        if (entity.getBaseUnitId() != null) {
            baseUnitName = unitRepository.findById(entity.getBaseUnitId())
                    .map(UnitOfMeasure::getUnitNameAr)
                    .orElse(null);
        }
        return mapToDtoInternal(entity, baseUnitName);
    }

    private UnitDto mapToDtoWithLookup(UnitOfMeasure entity, java.util.Map<Integer, String> lookup) {
        String baseUnitName = lookup.get(entity.getBaseUnitId());
        return mapToDtoInternal(entity, baseUnitName);
    }

    private UnitDto mapToDtoInternal(UnitOfMeasure entity, String baseUnitName) {
        return UnitDto.builder()
                .id(entity.getId())
                .unitCode(entity.getUnitCode())
                .unitNameAr(entity.getUnitNameAr())
                .unitNameEn(entity.getUnitNameEn())
                .isBaseUnit(entity.getIsBaseUnit())
                .baseUnitId(entity.getBaseUnitId())
                .baseUnitName(baseUnitName)
                .conversionFactor(entity.getConversionFactor())
                .isActive(entity.getIsActive())
                .build();
    }
}
