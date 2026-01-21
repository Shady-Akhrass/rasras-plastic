package com.rasras.erp.inventory;

import com.rasras.erp.employee.Employee;
import com.rasras.erp.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final WarehouseLocationRepository locationRepository;
    private final com.rasras.erp.employee.EmployeeRepository employeeRepository;

    @Transactional(readOnly = true)
    public List<WarehouseDto> getAllWarehouses() {
        return warehouseRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WarehouseDto> getActiveWarehouses() {
        return warehouseRepository.findByIsActiveTrue().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WarehouseDto getWarehouseById(Integer id) {
        return warehouseRepository.findById(id)
                .map(this::mapToDtoWithLocations)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", id));
    }

    @Transactional
    public WarehouseDto createWarehouse(WarehouseDto dto) {
        Warehouse warehouse = Warehouse.builder()
                .warehouseCode(dto.getWarehouseCode())
                .warehouseNameAr(dto.getWarehouseNameAr())
                .warehouseNameEn(dto.getWarehouseNameEn())
                .warehouseType(dto.getWarehouseType())
                .address(dto.getAddress())
                .managerId(dto.getManagerId())
                .phone(dto.getPhone())
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build();
        return mapToDto(warehouseRepository.save(warehouse));
    }

    @Transactional
    public WarehouseDto updateWarehouse(Integer id, WarehouseDto dto) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", id));

        warehouse.setWarehouseCode(dto.getWarehouseCode());
        warehouse.setWarehouseNameAr(dto.getWarehouseNameAr());
        warehouse.setWarehouseNameEn(dto.getWarehouseNameEn());
        warehouse.setWarehouseType(dto.getWarehouseType());
        warehouse.setAddress(dto.getAddress());
        warehouse.setManagerId(dto.getManagerId());
        warehouse.setPhone(dto.getPhone());
        warehouse.setIsActive(dto.getIsActive());

        return mapToDto(warehouseRepository.save(warehouse));
    }

    @Transactional
    public WarehouseLocationDto addLocation(WarehouseLocationDto dto) {
        WarehouseLocation location = WarehouseLocation.builder()
                .warehouseId(dto.getWarehouseId())
                .locationCode(dto.getLocationCode())
                .locationName(dto.getLocationName())
                .row(dto.getRow())
                .shelf(dto.getShelf())
                .bin(dto.getBin())
                .isActive(true)
                .build();
        return mapLocationToDto(locationRepository.save(location));
    }

    @Transactional
    public WarehouseLocationDto updateLocation(Integer id, WarehouseLocationDto dto) {
        WarehouseLocation location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WarehouseLocation", "id", id));

        location.setLocationCode(dto.getLocationCode());
        location.setLocationName(dto.getLocationName());
        location.setRow(dto.getRow());
        location.setShelf(dto.getShelf());
        location.setBin(dto.getBin());
        location.setIsActive(dto.getIsActive());

        return mapLocationToDto(locationRepository.save(location));
    }

    @Transactional(readOnly = true)
    public List<WarehouseLocationDto> getLocations(Integer warehouseId) {
        return locationRepository.findByWarehouseId(warehouseId).stream()
                .map(this::mapLocationToDto)
                .collect(Collectors.toList());
    }

    private WarehouseDto mapToDto(Warehouse entity) {
        String managerName = null;
        String managerDepartmentName = null;
        if (entity.getManagerId() != null) {
            Optional<Employee> manager = employeeRepository.findById(entity.getManagerId());
            if (manager.isPresent()) {
                managerName = manager.get().getFirstNameAr() + " " + manager.get().getLastNameAr();
                managerDepartmentName = manager.get().getDepartment() != null
                        ? manager.get().getDepartment().getDepartmentNameAr()
                        : null;
            }
        }

        return WarehouseDto.builder()
                .id(entity.getId())
                .warehouseCode(entity.getWarehouseCode())
                .warehouseNameAr(entity.getWarehouseNameAr())
                .warehouseNameEn(entity.getWarehouseNameEn())
                .warehouseType(entity.getWarehouseType())
                .address(entity.getAddress())
                .managerId(entity.getManagerId())
                .managerName(managerName)
                .managerDepartmentName(managerDepartmentName)
                .phone(entity.getPhone())
                .isActive(entity.getIsActive())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private WarehouseDto mapToDtoWithLocations(Warehouse entity) {
        WarehouseDto dto = mapToDto(entity);
        dto.setLocations(getLocations(entity.getId()));
        return dto;
    }

    private WarehouseLocationDto mapLocationToDto(WarehouseLocation entity) {
        return WarehouseLocationDto.builder()
                .id(entity.getId())
                .warehouseId(entity.getWarehouseId())
                .locationCode(entity.getLocationCode())
                .locationName(entity.getLocationName())
                .row(entity.getRow())
                .shelf(entity.getShelf())
                .bin(entity.getBin())
                .isActive(entity.getIsActive())
                .build();
    }
}
