package com.rasras.erp.crm;

import com.rasras.erp.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerContactRepository customerContactRepository;

    public List<CustomerDto> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<CustomerDto> getActiveCustomers() {
        return customerRepository.findAll().stream()
                .filter(c -> Boolean.TRUE.equals(c.getIsActive()))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public CustomerDto getCustomerById(Integer id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        return mapToDto(customer);
    }

    @Transactional
    public CustomerDto createCustomer(CustomerDto dto) {
        if (customerRepository.existsByCustomerCode(dto.getCustomerCode())) {
            throw new RuntimeException("Customer code already exists: " + dto.getCustomerCode());
        }

        Customer customer = Customer.builder()
                .customerCode(dto.getCustomerCode())
                .customerNameAr(dto.getCustomerNameAr())
                .customerNameEn(dto.getCustomerNameEn())
                .customerType(dto.getCustomerType())
                .customerClass(dto.getCustomerClass())
                .taxRegistrationNo(dto.getTaxRegistrationNo())
                .commercialRegNo(dto.getCommercialRegNo())
                .address(dto.getAddress())
                .city(dto.getCity())
                .country(dto.getCountry())
                .phone(dto.getPhone())
                .fax(dto.getFax())
                .email(dto.getEmail())
                .website(dto.getWebsite())
                .contactPerson(dto.getContactPerson())
                .contactPhone(dto.getContactPhone())
                .paymentTermDays(dto.getPaymentTermDays())
                .creditLimit(dto.getCreditLimit())
                .currentBalance(dto.getCurrentBalance() != null ? dto.getCurrentBalance() : java.math.BigDecimal.ZERO)
                .currency(dto.getCurrency() != null ? dto.getCurrency() : "EGP")
                .salesRepId(normalizeFk(dto.getSalesRepId()))
                .priceListId(normalizeFk(dto.getPriceListId()))
                .discountPercentage(dto.getDiscountPercentage())
                .isApproved(false)
                .isActive(true)
                .notes(dto.getNotes())
                .createdAt(java.time.LocalDateTime.now())
                .build();

        customer.setSalesRepId(normalizeFk(customer.getSalesRepId()));
        customer.setPriceListId(normalizeFk(customer.getPriceListId()));

        Customer savedCustomer = customerRepository.save(customer);

        if (dto.getContacts() != null) {
            for (CustomerContactDto contactDto : dto.getContacts()) {
                CustomerContact contact = CustomerContact.builder()
                        .customerId(savedCustomer.getId())
                        .contactName(contactDto.getContactName())
                        .jobTitle(contactDto.getJobTitle())
                        .phone(contactDto.getPhone())
                        .mobile(contactDto.getMobile())
                        .email(contactDto.getEmail())
                        .isPrimary(contactDto.getIsPrimary())
                        .isActive(true)
                        .build();
                customerContactRepository.save(contact);
            }
        }

        return mapToDto(savedCustomer);
    }

    @Transactional
    public CustomerDto updateCustomer(Integer id, CustomerDto dto) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));

        customer.setCustomerNameAr(dto.getCustomerNameAr());
        customer.setCustomerNameEn(dto.getCustomerNameEn());
        customer.setCustomerType(dto.getCustomerType());
        customer.setCustomerClass(dto.getCustomerClass());
        customer.setTaxRegistrationNo(dto.getTaxRegistrationNo());
        customer.setCommercialRegNo(dto.getCommercialRegNo());
        customer.setAddress(dto.getAddress());
        customer.setCity(dto.getCity());
        customer.setCountry(dto.getCountry());
        customer.setPhone(dto.getPhone());
        customer.setFax(dto.getFax());
        customer.setEmail(dto.getEmail());
        customer.setWebsite(dto.getWebsite());
        customer.setContactPerson(dto.getContactPerson());
        customer.setContactPhone(dto.getContactPhone());
        customer.setPaymentTermDays(dto.getPaymentTermDays());
        customer.setCreditLimit(dto.getCreditLimit());
        customer.setCurrency(dto.getCurrency());
        customer.setSalesRepId(normalizeFk(dto.getSalesRepId()));
        customer.setPriceListId(normalizeFk(dto.getPriceListId()));
        customer.setDiscountPercentage(dto.getDiscountPercentage());
        customer.setIsActive(dto.getIsActive());
        customer.setNotes(dto.getNotes());
        customer.setUpdatedAt(java.time.LocalDateTime.now());

        // Update contacts (Simple strategy: delete and recreate for now, or match by
        // ID)
        // For simplicity and to match common ERP patterns where contacts are replaced:
        if (dto.getContacts() != null) {
            List<CustomerContact> existingContacts = customerContactRepository.findByCustomerId(id);
            customerContactRepository.deleteAll(existingContacts);

            for (CustomerContactDto contactDto : dto.getContacts()) {
                CustomerContact contact = CustomerContact.builder()
                        .customerId(id)
                        .contactName(contactDto.getContactName())
                        .jobTitle(contactDto.getJobTitle())
                        .phone(contactDto.getPhone())
                        .mobile(contactDto.getMobile())
                        .email(contactDto.getEmail())
                        .isPrimary(contactDto.getIsPrimary())
                        .isActive(true)
                        .build();
                customerContactRepository.save(contact);
            }
        }

        return mapToDto(customerRepository.save(customer));
    }

    @Transactional
    public void deleteCustomer(Integer id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        List<CustomerContact> contacts = customerContactRepository.findByCustomerId(id);
        customerContactRepository.deleteAll(contacts);
        customerRepository.delete(customer);
    }

    private CustomerDto mapToDto(Customer entity) {
        List<CustomerContactDto> contacts = customerContactRepository.findByCustomerId(entity.getId())
                .stream()
                .map(this::mapToContactDto)
                .collect(Collectors.toList());

        return CustomerDto.builder()
                .id(entity.getId())
                .customerCode(entity.getCustomerCode())
                .customerNameAr(entity.getCustomerNameAr())
                .customerNameEn(entity.getCustomerNameEn())
                .customerType(entity.getCustomerType())
                .customerClass(entity.getCustomerClass())
                .taxRegistrationNo(entity.getTaxRegistrationNo())
                .commercialRegNo(entity.getCommercialRegNo())
                .address(entity.getAddress())
                .city(entity.getCity())
                .country(entity.getCountry())
                .phone(entity.getPhone())
                .fax(entity.getFax())
                .email(entity.getEmail())
                .website(entity.getWebsite())
                .contactPerson(entity.getContactPerson())
                .contactPhone(entity.getContactPhone())
                .paymentTermDays(entity.getPaymentTermDays())
                .creditLimit(entity.getCreditLimit())
                .currentBalance(entity.getCurrentBalance())
                .currency(entity.getCurrency())
                .salesRepId(entity.getSalesRepId())
                .priceListId(entity.getPriceListId())
                .discountPercentage(entity.getDiscountPercentage())
                .isApproved(entity.getIsApproved())
                .isActive(entity.getIsActive())
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .contacts(contacts)
                .build();
    }

    private CustomerContactDto mapToContactDto(CustomerContact entity) {
        return CustomerContactDto.builder()
                .id(entity.getId())
                .customerId(entity.getCustomerId())
                .contactName(entity.getContactName())
                .jobTitle(entity.getJobTitle())
                .phone(entity.getPhone())
                .mobile(entity.getMobile())
                .email(entity.getEmail())
                .isPrimary(entity.getIsPrimary())
                .isActive(entity.getIsActive())
                .build();
    }

    /** لا نُدخل 0 كقيمة لـ Foreign Key؛ نستبدلها بـ null لتفادي انتهاك القيد في قاعدة البيانات */
    private static Integer normalizeFk(Integer id) {
        return (id != null && id != 0) ? id : null;
    }
}
