package com.rasras.erp.supplier;

import com.rasras.erp.supplier.SupplierStatus;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierItemRepository supplierItemRepository;
    private final SupplierBankRepository supplierBankRepository;
    private final com.rasras.erp.inventory.ItemRepository itemRepository;
    private final com.rasras.erp.approval.ApprovalService approvalService;

    @Transactional(readOnly = true)
    public List<SupplierDto> getAllSuppliers() {
        return supplierRepository.findActiveSuppliers().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SupplierDto getSupplierById(Integer id) {
        return supplierRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException("المورد غير موجود"));
    }

    @Transactional
    public SupplierDto updateSupplier(Integer id, SupplierDto dto) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("المورد غير موجود"));

        updateEntityFromDto(supplier, dto);
        return mapToDto(supplierRepository.save(supplier));
    }

    @Transactional
    public void deleteSupplier(Integer id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("المورد غير موجود"));
        supplier.setIsActive(false);
        supplierRepository.save(supplier);
    }

    @Transactional
    public SupplierDto createSupplier(SupplierDto dto) {
        Supplier supplier = mapToEntity(dto);
        supplier.setSupplierCode(generateSupplierCode());
        supplier.setStatus(SupplierStatus.DRAFT);
        supplier.setApprovalStatus("Pending");
        return mapToDto(supplierRepository.save(supplier));
    }

    @Transactional
    public SupplierDto submitForApproval(Integer id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("المورد غير موجود"));

        supplier.setStatus(SupplierStatus.PENDING);
        supplier.setApprovalStatus("Submitted");

        Supplier saved = supplierRepository.save(supplier);

        // Initiate approval workflow
        approvalService.initiateApproval("SUPPLIER_APPROVAL", "Supplier", saved.getId(),
                saved.getSupplierCode(), 1, BigDecimal.ZERO); // Assuming admin user for now

        return mapToDto(saved);
    }

    @Transactional
    public SupplierDto approveSupplier(Integer id, Integer userId, String notes) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("المورد غير موجود"));
        supplier.setStatus(SupplierStatus.APPROVED);
        supplier.setIsApproved(true);
        supplier.setApprovedBy(userId);
        supplier.setApprovalDate(LocalDateTime.now());
        supplier.setApprovalNotes(notes);
        return mapToDto(supplierRepository.save(supplier));
    }

    @Transactional
    public SupplierDto rejectSupplier(Integer id, Integer userId, String notes) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("المورد غير موجود"));
        supplier.setStatus(SupplierStatus.REJECTED);
        supplier.setIsApproved(false);
        supplier.setApprovedBy(userId);
        supplier.setApprovalDate(LocalDateTime.now());
        supplier.setApprovalNotes(notes);
        return mapToDto(supplierRepository.save(supplier));
    }

    @Transactional(readOnly = true)
    public List<SupplierItemDto> getAllSupplierItems() {
        return supplierItemRepository.findAll().stream()
                .map(this::mapToSupplierItemDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SupplierItemDto> getSupplierItems(Integer supplierId) {
        return supplierItemRepository.findBySupplierId(supplierId).stream()
                .map(this::mapToSupplierItemDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SupplierItemDto> getSupplierItemsByItemId(Integer itemId) {
        return supplierItemRepository.findByItemId(itemId).stream()
                .map(this::mapToSupplierItemDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public SupplierItemDto linkItemToSupplier(SupplierItemDto dto) {
        Supplier supplier = supplierRepository.findById(dto.getSupplierId())
                .orElseThrow(() -> new RuntimeException("المورد غير موجود"));
        com.rasras.erp.inventory.Item item = itemRepository.findById(dto.getItemId())
                .orElseThrow(() -> new RuntimeException("المنتج غير موجود"));

        SupplierItem supplierItem = supplierItemRepository.findBySupplierIdAndItemId(supplier.getId(), item.getId())
                .orElse(null);

        if (supplierItem == null) {
            supplierItem = SupplierItem.builder()
                    .supplier(supplier)
                    .item(item)
                    .isPreferred(false)
                    .isActive(true)
                    .build();
        }

        if (dto.getSupplierItemCode() != null)
            supplierItem.setSupplierItemCode(dto.getSupplierItemCode());
        if (dto.getLastPrice() != null)
            supplierItem.setLastPrice(dto.getLastPrice());
        if (dto.getLastPriceDate() != null)
            supplierItem.setLastPriceDate(dto.getLastPriceDate());
        if (dto.getLeadTimeDays() != null)
            supplierItem.setLeadTimeDays(dto.getLeadTimeDays());
        if (dto.getMinOrderQty() != null)
            supplierItem.setMinOrderQty(dto.getMinOrderQty());
        if (dto.getIsPreferred() != null)
            supplierItem.setIsPreferred(dto.getIsPreferred());
        if (dto.getIsActive() != null)
            supplierItem.setIsActive(dto.getIsActive());

        return mapToSupplierItemDto(supplierItemRepository.save(supplierItem));
    }

    @Transactional
    public void unlinkItemFromSupplier(Integer supplierItemId) {
        supplierItemRepository.deleteById(supplierItemId);
    }

    @Transactional(readOnly = true)
    public List<SupplierBankDto> getSupplierBanks(Integer supplierId) {
        return supplierBankRepository.findBySupplierId(supplierId).stream()
                .map(this::mapToBankDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public SupplierBankDto addSupplierBank(SupplierBankDto dto) {
        Supplier supplier = supplierRepository.findById(dto.getSupplierId())
                .orElseThrow(() -> new RuntimeException("المورد غير موجود"));

        SupplierBank bank = SupplierBank.builder()
                .supplier(supplier)
                .bankName(dto.getBankName())
                .bankAccountNo(dto.getBankAccountNo())
                .iban(dto.getIban())
                .swift(dto.getSwift())
                .currency(dto.getCurrency() != null ? dto.getCurrency() : "EGP")
                .isDefault(dto.getIsDefault() != null ? dto.getIsDefault() : false)
                .build();

        return mapToBankDto(supplierBankRepository.save(bank));
    }

    @Transactional(readOnly = true)
    public List<SupplierOutstandingDto> getOutstandingSummary() {
        return supplierRepository.findAll().stream()
                .map(this::mapToOutstandingDto)
                .collect(Collectors.toList());
    }

    private SupplierOutstandingDto mapToOutstandingDto(Supplier supplier) {
        return SupplierOutstandingDto.builder()
                .id(supplier.getId())
                .supplierCode(supplier.getSupplierCode())
                .supplierNameAr(supplier.getSupplierNameAr())
                .creditLimit(supplier.getCreditLimit())
                .totalInvoiced(supplier.getTotalInvoiced())
                .totalPaid(supplier.getTotalPaid())
                .totalReturned(supplier.getTotalReturned())
                .currentBalance(supplier.getCurrentBalance())
                .currency(supplier.getCurrency())
                .build();
    }

    @Transactional
    public void deleteSupplierBank(Integer bankId) {
        supplierBankRepository.deleteById(bankId);
    }

    private SupplierBankDto mapToBankDto(SupplierBank bank) {
        return SupplierBankDto.builder()
                .id(bank.getId())
                .supplierId(bank.getSupplier().getId())
                .bankName(bank.getBankName())
                .bankAccountNo(bank.getBankAccountNo())
                .iban(bank.getIban())
                .swift(bank.getSwift())
                .currency(bank.getCurrency())
                .isDefault(bank.getIsDefault())
                .build();
    }

    private SupplierItemDto mapToSupplierItemDto(SupplierItem item) {
        return SupplierItemDto.builder()
                .id(item.getId())
                .supplierId(item.getSupplier().getId())
                .supplierNameAr(item.getSupplier().getSupplierNameAr())
                .itemId(item.getItem().getId())
                .itemNameAr(item.getItem().getItemNameAr())
                .itemCode(item.getItem().getItemCode())
                .supplierItemCode(item.getSupplierItemCode())
                .lastPrice(item.getLastPrice())
                .lastPriceDate(item.getLastPriceDate())
                .leadTimeDays(item.getLeadTimeDays())
                .minOrderQty(item.getMinOrderQty())
                .isPreferred(item.getIsPreferred())
                .isActive(item.getIsActive())
                .currency(item.getSupplier().getCurrency())
                .build();
    }

    private String generateSupplierCode() {
        long n = supplierRepository.count() + 1;
        return "SUP-" + n;
    }

    private SupplierDto mapToDto(Supplier supplier) {
        return SupplierDto.builder()
                .id(supplier.getId())
                .supplierCode(supplier.getSupplierCode())
                .supplierNameAr(supplier.getSupplierNameAr())
                .supplierNameEn(supplier.getSupplierNameEn())
                .supplierType(supplier.getSupplierType())
                .taxRegistrationNo(supplier.getTaxRegistrationNo())
                .commercialRegNo(supplier.getCommercialRegNo())
                .address(supplier.getAddress())
                .city(supplier.getCity())
                .country(supplier.getCountry())
                .phone(supplier.getPhone())
                .fax(supplier.getFax())
                .email(supplier.getEmail())
                .website(supplier.getWebsite())
                .contactPerson(supplier.getContactPerson())
                .contactPhone(supplier.getContactPhone())
                .paymentTermDays(supplier.getPaymentTermDays())
                .creditLimit(supplier.getCreditLimit())
                .currency(supplier.getCurrency())
                .bankName(supplier.getBankName())
                .bankAccountNo(supplier.getBankAccountNo())
                .iban(supplier.getIban())
                .rating(supplier.getRating())
                .totalInvoiced(supplier.getTotalInvoiced())
                .totalPaid(supplier.getTotalPaid())
                .totalReturned(supplier.getTotalReturned())
                .currentBalance(supplier.getCurrentBalance())
                .isApproved(supplier.getIsApproved())
                .isActive(supplier.getIsActive())
                .notes(supplier.getNotes())
                .status(supplier.getStatus() != null ? supplier.getStatus().name() : "DRAFT")
                .approvalNotes(supplier.getApprovalNotes())
                .approvalDate(supplier.getApprovalDate())
                .approvedBy(supplier.getApprovedBy())
                .createdAt(supplier.getCreatedAt())
                .createdBy(supplier.getCreatedBy())
                .updatedBy(supplier.getUpdatedBy())
                .build();
    }

    private Supplier mapToEntity(SupplierDto dto) {
        Supplier supplier = new Supplier();
        updateEntityFromDto(supplier, dto);
        return supplier;
    }

    private void updateEntityFromDto(Supplier supplier, SupplierDto dto) {
        supplier.setSupplierNameAr(dto.getSupplierNameAr());
        supplier.setSupplierNameEn(dto.getSupplierNameEn());
        supplier.setSupplierType(dto.getSupplierType());
        supplier.setTaxRegistrationNo(dto.getTaxRegistrationNo());
        supplier.setCommercialRegNo(dto.getCommercialRegNo());
        supplier.setAddress(dto.getAddress());
        supplier.setCity(dto.getCity());
        supplier.setCountry(dto.getCountry());
        supplier.setPhone(dto.getPhone());
        supplier.setFax(dto.getFax());
        supplier.setEmail(dto.getEmail());
        supplier.setWebsite(dto.getWebsite());
        supplier.setContactPerson(dto.getContactPerson());
        supplier.setContactPhone(dto.getContactPhone());
        supplier.setPaymentTermDays(dto.getPaymentTermDays() != null ? dto.getPaymentTermDays() : 0);
        supplier.setCreditLimit(dto.getCreditLimit());
        supplier.setCurrency(dto.getCurrency() != null ? dto.getCurrency() : "EGP");
        supplier.setBankName(dto.getBankName());
        supplier.setBankAccountNo(dto.getBankAccountNo());
        supplier.setIban(dto.getIban());
        supplier.setRating(dto.getRating());
        supplier.setTotalInvoiced(dto.getTotalInvoiced() != null ? dto.getTotalInvoiced() : BigDecimal.ZERO);
        supplier.setTotalPaid(dto.getTotalPaid() != null ? dto.getTotalPaid() : BigDecimal.ZERO);
        supplier.setTotalReturned(dto.getTotalReturned() != null ? dto.getTotalReturned() : BigDecimal.ZERO);
        supplier.setCurrentBalance(dto.getCurrentBalance() != null ? dto.getCurrentBalance() : BigDecimal.ZERO);
        supplier.setIsApproved(dto.getIsApproved() != null ? dto.getIsApproved() : false);
        supplier.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        supplier.setNotes(dto.getNotes());

        if (dto.getStatus() != null) {
            supplier.setStatus(SupplierStatus.valueOf(dto.getStatus()));
        }
        supplier.setApprovalNotes(dto.getApprovalNotes());
        supplier.setApprovalDate(dto.getApprovalDate());
        supplier.setApprovedBy(dto.getApprovedBy());
    }
}
