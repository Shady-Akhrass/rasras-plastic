package com.rasras.erp.sales;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    @Transactional(readOnly = true)
    public List<VehicleDto> getAll() {
        return vehicleRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VehicleDto> getActive() {
        return vehicleRepository.findByIsActiveTrueOrderByVehicleCodeAsc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VehicleDto getById(Integer id) {
        return vehicleRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
    }

    @Transactional
    public VehicleDto create(VehicleDto dto) {
        // Check if vehicle code already exists
        if (vehicleRepository.findByVehicleCode(dto.getVehicleCode()).isPresent()) {
            throw new RuntimeException("Vehicle code already exists: " + dto.getVehicleCode());
        }

        // Check if plate number already exists
        if (vehicleRepository.findByPlateNumber(dto.getPlateNumber()).isPresent()) {
            throw new RuntimeException("Plate number already exists: " + dto.getPlateNumber());
        }

        Vehicle vehicle = Vehicle.builder()
                .vehicleCode(dto.getVehicleCode())
                .plateNumber(dto.getPlateNumber())
                .vehicleType(dto.getVehicleType())
                .brand(dto.getBrand())
                .model(dto.getModel())
                .year(dto.getYear())
                .capacity(dto.getCapacity())
                .ownershipType(dto.getOwnershipType())
                .driverId(dto.getDriverId())
                .driverName(dto.getDriverName())
                .driverPhone(dto.getDriverPhone())
                .licenseExpiry(dto.getLicenseExpiry())
                .insuranceExpiry(dto.getInsuranceExpiry())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .notes(dto.getNotes())
                .build();

        Vehicle saved = vehicleRepository.save(vehicle);
        return mapToDto(saved);
    }

    @Transactional
    public VehicleDto update(Integer id, VehicleDto dto) {
        Vehicle existing = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        // Check if vehicle code is being changed and if it conflicts with another vehicle
        if (!existing.getVehicleCode().equals(dto.getVehicleCode())) {
            if (vehicleRepository.findByVehicleCode(dto.getVehicleCode()).isPresent()) {
                throw new RuntimeException("Vehicle code already exists: " + dto.getVehicleCode());
            }
        }

        // Check if plate number is being changed and if it conflicts with another vehicle
        if (!existing.getPlateNumber().equals(dto.getPlateNumber())) {
            if (vehicleRepository.findByPlateNumber(dto.getPlateNumber()).isPresent()) {
                throw new RuntimeException("Plate number already exists: " + dto.getPlateNumber());
            }
        }

        existing.setVehicleCode(dto.getVehicleCode());
        existing.setPlateNumber(dto.getPlateNumber());
        existing.setVehicleType(dto.getVehicleType());
        existing.setBrand(dto.getBrand());
        existing.setModel(dto.getModel());
        existing.setYear(dto.getYear());
        existing.setCapacity(dto.getCapacity());
        existing.setOwnershipType(dto.getOwnershipType());
        existing.setDriverId(dto.getDriverId());
        existing.setDriverName(dto.getDriverName());
        existing.setDriverPhone(dto.getDriverPhone());
        existing.setLicenseExpiry(dto.getLicenseExpiry());
        existing.setInsuranceExpiry(dto.getInsuranceExpiry());
        existing.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        existing.setNotes(dto.getNotes());

        Vehicle saved = vehicleRepository.save(existing);
        return mapToDto(saved);
    }

    @Transactional
    public void delete(Integer id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        vehicleRepository.delete(vehicle);
    }

    private VehicleDto mapToDto(Vehicle vehicle) {
        return VehicleDto.builder()
                .id(vehicle.getId())
                .vehicleCode(vehicle.getVehicleCode())
                .plateNumber(vehicle.getPlateNumber())
                .vehicleType(vehicle.getVehicleType())
                .brand(vehicle.getBrand())
                .model(vehicle.getModel())
                .year(vehicle.getYear())
                .capacity(vehicle.getCapacity())
                .ownershipType(vehicle.getOwnershipType())
                .driverId(vehicle.getDriverId())
                .driverName(vehicle.getDriverName())
                .driverPhone(vehicle.getDriverPhone())
                .licenseExpiry(vehicle.getLicenseExpiry())
                .insuranceExpiry(vehicle.getInsuranceExpiry())
                .isActive(vehicle.getIsActive())
                .notes(vehicle.getNotes())
                .build();
    }
}
