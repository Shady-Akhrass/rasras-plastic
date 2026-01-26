package com.rasras.erp.sales;

import com.rasras.erp.crm.Customer;
import com.rasras.erp.crm.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentReceiptService {

    private final PaymentReceiptRepository receiptRepository;
    private final SalesInvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;

    @Transactional(readOnly = true)
    public List<PaymentReceiptDto> getAllReceipts() {
        return receiptRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PaymentReceiptDto getReceiptById(Integer id) {
        return receiptRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException("Payment Receipt not found"));
    }

    @Transactional
    public PaymentReceiptDto createReceipt(PaymentReceiptDto dto) {
        PaymentReceipt receipt = new PaymentReceipt();
        receipt.setVoucherNumber(generateVoucherNumber());
        receipt.setVoucherDate(dto.getVoucherDate() != null ? dto.getVoucherDate() : LocalDateTime.now());
        
        if (dto.getCustomerId() != null) {
            Customer customer = customerRepository.findById(dto.getCustomerId())
                    .orElse(null);
            receipt.setCustomer(customer);
        }
        
        receipt.setPayerName(dto.getPayerName());
        receipt.setPaymentMethod(dto.getPaymentMethod());
        receipt.setCashRegisterId(dto.getCashRegisterId());
        receipt.setBankAccountId(dto.getBankAccountId());
        receipt.setChequeId(dto.getChequeId());
        receipt.setCurrency(dto.getCurrency() != null ? dto.getCurrency() : "EGP");
        receipt.setExchangeRate(dto.getExchangeRate() != null ? dto.getExchangeRate() : BigDecimal.ONE);
        receipt.setAmount(dto.getAmount());
        receipt.setAmountInWords(dto.getAmountInWords());
        receipt.setReferenceType(dto.getReferenceType());
        receipt.setReferenceId(dto.getReferenceId());
        receipt.setDescription(dto.getDescription());
        receipt.setStatus(dto.getStatus() != null ? dto.getStatus() : "Draft");
        receipt.setReceivedByUserId(dto.getReceivedByUserId() != null ? dto.getReceivedByUserId() : 1);
        receipt.setNotes(dto.getNotes());
        receipt.setCreatedBy(dto.getCreatedBy() != null ? dto.getCreatedBy() : 1);

        if (dto.getAllocations() != null && !dto.getAllocations().isEmpty()) {
            List<PaymentReceiptAllocation> allocations = new ArrayList<>();
            for (PaymentReceiptAllocationDto allocDto : dto.getAllocations()) {
                PaymentReceiptAllocation allocation = mapAllocationToEntity(allocDto, receipt);
                allocations.add(allocation);
            }
            receipt.setAllocations(allocations);
        }

        PaymentReceipt saved = receiptRepository.save(receipt);
        
        // Update invoice paid amount
        if (saved.getAllocations() != null) {
            for (PaymentReceiptAllocation alloc : saved.getAllocations()) {
                SalesInvoice invoice = invoiceRepository.findById(alloc.getSalesInvoiceId())
                        .orElse(null);
                if (invoice != null) {
                    BigDecimal currentPaid = invoice.getPaidAmount() != null ? invoice.getPaidAmount() : BigDecimal.ZERO;
                    invoice.setPaidAmount(currentPaid.add(alloc.getAllocatedAmount()));
                    invoiceRepository.save(invoice);
                }
            }
        }
        
        return mapToDto(saved);
    }

    @Transactional
    public PaymentReceiptDto updateReceipt(Integer id, PaymentReceiptDto dto) {
        PaymentReceipt receipt = receiptRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment Receipt not found"));

        if (!"Draft".equals(receipt.getStatus())) {
            throw new RuntimeException("Cannot edit receipt that is not in Draft status");
        }

        receipt.setPayerName(dto.getPayerName());
        receipt.setPaymentMethod(dto.getPaymentMethod());
        receipt.setAmount(dto.getAmount());
        receipt.setAmountInWords(dto.getAmountInWords());
        receipt.setDescription(dto.getDescription());
        receipt.setNotes(dto.getNotes());
        receipt.setUpdatedBy(dto.getUpdatedBy() != null ? dto.getUpdatedBy() : 1);

        return mapToDto(receiptRepository.save(receipt));
    }

    @Transactional
    public void deleteReceipt(Integer id) {
        PaymentReceipt receipt = receiptRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment Receipt not found"));
        
        if (!"Draft".equals(receipt.getStatus())) {
            throw new RuntimeException("Cannot delete receipt that is not in Draft status");
        }
        
        receiptRepository.delete(receipt);
    }

    private String generateVoucherNumber() {
        return "RCP-" + System.currentTimeMillis();
    }

    private PaymentReceiptDto mapToDto(PaymentReceipt receipt) {
        PaymentReceiptDto dto = PaymentReceiptDto.builder()
                .id(receipt.getId())
                .voucherNumber(receipt.getVoucherNumber())
                .voucherDate(receipt.getVoucherDate())
                .payerName(receipt.getPayerName())
                .paymentMethod(receipt.getPaymentMethod())
                .cashRegisterId(receipt.getCashRegisterId())
                .bankAccountId(receipt.getBankAccountId())
                .chequeId(receipt.getChequeId())
                .currency(receipt.getCurrency())
                .exchangeRate(receipt.getExchangeRate())
                .amount(receipt.getAmount())
                .amountInWords(receipt.getAmountInWords())
                .referenceType(receipt.getReferenceType())
                .referenceId(receipt.getReferenceId())
                .description(receipt.getDescription())
                .status(receipt.getStatus())
                .journalEntryId(receipt.getJournalEntryId())
                .receivedByUserId(receipt.getReceivedByUserId())
                .postedByUserId(receipt.getPostedByUserId())
                .postedDate(receipt.getPostedDate())
                .notes(receipt.getNotes())
                .createdAt(receipt.getCreatedAt())
                .createdBy(receipt.getCreatedBy())
                .updatedAt(receipt.getUpdatedAt())
                .updatedBy(receipt.getUpdatedBy())
                .build();

        if (receipt.getCustomer() != null) {
            dto.setCustomerId(receipt.getCustomer().getId());
            dto.setCustomerNameAr(receipt.getCustomer().getCustomerNameAr());
            dto.setCustomerCode(receipt.getCustomer().getCustomerCode());
        }

        if (receipt.getAllocations() != null) {
            dto.setAllocations(receipt.getAllocations().stream()
                    .map(this::mapAllocationToDto)
                    .collect(Collectors.toList()));
        } else {
            dto.setAllocations(new ArrayList<>());
        }

        return dto;
    }

    private PaymentReceiptAllocationDto mapAllocationToDto(PaymentReceiptAllocation allocation) {
        PaymentReceiptAllocationDto dto = PaymentReceiptAllocationDto.builder()
                .id(allocation.getId())
                .receiptVoucherId(allocation.getReceiptVoucher().getId())
                .salesInvoiceId(allocation.getSalesInvoiceId())
                .allocatedAmount(allocation.getAllocatedAmount())
                .allocationDate(allocation.getAllocationDate())
                .notes(allocation.getNotes())
                .build();

        // Try to get invoice number
        SalesInvoice invoice = invoiceRepository.findById(allocation.getSalesInvoiceId())
                .orElse(null);
        if (invoice != null) {
            dto.setInvoiceNumber(invoice.getInvoiceNumber());
        }

        return dto;
    }

    private PaymentReceiptAllocation mapAllocationToEntity(PaymentReceiptAllocationDto dto, PaymentReceipt receipt) {
        return PaymentReceiptAllocation.builder()
                .receiptVoucher(receipt)
                .salesInvoiceId(dto.getSalesInvoiceId())
                .allocatedAmount(dto.getAllocatedAmount())
                .allocationDate(dto.getAllocationDate() != null ? dto.getAllocationDate() : LocalDateTime.now())
                .notes(dto.getNotes())
                .build();
    }
}
