package com.rasras.erp.sales;

import com.rasras.erp.shared.dto.ApiResponse;
import com.rasras.erp.shared.exception.ResourceNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerRequestService {

    private final CustomerRequestRepository requestRepository;
    // private final CustomerRepository customerRepository; // If needed for
    // validation/name mapping

    @Transactional
    public CustomerRequestDto createRequest(CustomerRequestDto dto) {
        CustomerRequest request = new CustomerRequest();
        request.setRequestNumber(generateRequestNumber());
        request.setRequestDate(dto.getRequestDate() != null ? dto.getRequestDate() : LocalDate.now());
        request.setCustomerId(dto.getCustomerId());
        request.setPriceListId(dto.getPriceListId());
        request.setStatus("Pending");
        request.setNotes(dto.getNotes());
        request.setCreatedBy(dto.getCreatedBy());

        if (dto.getItems() != null) {
            List<CustomerRequestItem> items = dto.getItems().stream().map(itemDto -> {
                CustomerRequestItem item = new CustomerRequestItem();
                item.setCustomerRequest(request);
                item.setProductId(itemDto.getProductId());
                item.setProductName(itemDto.getProductName());
                item.setQuantity(itemDto.getQuantity());
                item.setNotes(itemDto.getNotes());
                return item;
            }).collect(Collectors.toList());
            request.setItems(items);
        }

        if (dto.getSchedules() != null) {
            List<CustomerRequestDeliverySchedule> schedules = dto.getSchedules().stream().map(sDto -> {
                CustomerRequestDeliverySchedule schedule = new CustomerRequestDeliverySchedule();
                schedule.setCustomerRequest(request);
                schedule.setDeliveryDate(sDto.getDeliveryDate());
                schedule.setProductId(sDto.getProductId());
                schedule.setQuantity(sDto.getQuantity());
                schedule.setNotes(sDto.getNotes());
                return schedule;
            }).collect(Collectors.toList());
            request.setSchedules(schedules);
        }

        CustomerRequest saved = requestRepository.save(request);
        return mapToDto(saved);
    }

    @Transactional
    public List<CustomerRequestDto> getAllRequests() {
        return requestRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CustomerRequestDto getRequestById(Integer id) {
        CustomerRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer Request not found with id " + id));
        return mapToDto(request);
    }

    @Transactional
    public CustomerRequestDto updateRequest(Integer id, CustomerRequestDto dto) {
        CustomerRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer Request not found with id " + id));

        if ("Approved".equalsIgnoreCase(request.getStatus())) {
            throw new RuntimeException("Cannot update an approved request");
        }

        request.setCustomerId(dto.getCustomerId());
        request.setPriceListId(dto.getPriceListId());
        request.setNotes(dto.getNotes());
        request.setStatus(dto.getStatus());

        // Naive item update: clear and re-add (or improve logic to update existing)
        if (request.getItems() != null) {
            request.getItems().clear();
        }
        if (dto.getItems() != null) {
            List<CustomerRequestItem> items = dto.getItems().stream().map(itemDto -> {
                CustomerRequestItem item = new CustomerRequestItem();
                item.setCustomerRequest(request); // Link back
                item.setProductId(itemDto.getProductId());
                item.setProductName(itemDto.getProductName());
                item.setQuantity(itemDto.getQuantity());
                item.setNotes(itemDto.getNotes());
                return item;
            }).collect(Collectors.toList());
            request.getItems().addAll(items);
        }

        if (request.getSchedules() != null) {
            request.getSchedules().clear();
        } else {
            request.setSchedules(new java.util.ArrayList<>());
        }
        if (dto.getSchedules() != null) {
            List<CustomerRequestDeliverySchedule> schedules = dto.getSchedules().stream().map(sDto -> {
                CustomerRequestDeliverySchedule schedule = new CustomerRequestDeliverySchedule();
                schedule.setCustomerRequest(request);
                schedule.setDeliveryDate(sDto.getDeliveryDate());
                schedule.setProductId(sDto.getProductId());
                schedule.setQuantity(sDto.getQuantity());
                schedule.setNotes(sDto.getNotes());
                return schedule;
            }).collect(Collectors.toList());
            request.getSchedules().addAll(schedules);
        }

        return mapToDto(requestRepository.save(request));
    }

    @Transactional
    public void deleteRequest(Integer id) {
        requestRepository.deleteById(id);
    }

    @Transactional
    public CustomerRequestDto approveRequest(Integer id) {
        CustomerRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer Request not found with id " + id));

        request.setStatus("Approved");
        request.setApprovedAt(LocalDateTime.now());
        // request.setApprovedBy(SecurityUtils.getCurrentUserId()); // TODO: Integrate
        // with security context

        return mapToDto(requestRepository.save(request));
    }

    @Transactional
    public CustomerRequestDto rejectRequest(Integer id, String reason) {
        CustomerRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer Request not found with id " + id));

        request.setStatus("Rejected");
        request.setRejectionReason(reason);

        return mapToDto(requestRepository.save(request));
    }

    private CustomerRequestDto mapToDto(CustomerRequest entity) {
        return CustomerRequestDto.builder()
                .requestId(entity.getRequestId())
                .requestNumber(entity.getRequestNumber())
                .requestDate(entity.getRequestDate())
                .customerId(entity.getCustomerId())
                .priceListId(entity.getPriceListId())
                .status(entity.getStatus())
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .items(entity.getItems() != null
                        ? entity.getItems().stream().map(this::mapItemToDto).collect(Collectors.toList())
                        : null)
                .schedules(entity.getSchedules() != null
                        ? entity.getSchedules().stream().map(this::mapScheduleToDto).collect(Collectors.toList())
                        : null)
                .build();
    }

    private CustomerRequestDeliveryScheduleDto mapScheduleToDto(CustomerRequestDeliverySchedule entity) {
        return CustomerRequestDeliveryScheduleDto.builder()
                .scheduleId(entity.getScheduleId())
                .requestId(entity.getCustomerRequest().getRequestId())
                .deliveryDate(entity.getDeliveryDate())
                .productId(entity.getProductId())
                .quantity(entity.getQuantity())
                .notes(entity.getNotes())
                .build();
    }

    private CustomerRequestItemDto mapItemToDto(CustomerRequestItem entity) {
        return CustomerRequestItemDto.builder()
                .itemId(entity.getItemId())
                .requestId(entity.getCustomerRequest().getRequestId())
                .productId(entity.getProductId())
                .productName(entity.getProductName())
                .quantity(entity.getQuantity())
                .notes(entity.getNotes())
                .build();
    }

    private String generateRequestNumber() {
        // Simple generation logic, ideal implementation handles sequence table
        long count = requestRepository.count();
        return "CR-" + (2026000 + count + 1);
    }
}
