package com.rasras.erp.sales;

import com.rasras.erp.crm.Customer;
import com.rasras.erp.shared.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "receiptvouchers")
@Data
@EqualsAndHashCode(callSuper = false)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentReceipt extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ReceiptVoucherID")
    private Integer id;

    @Column(name = "VoucherNumber", nullable = false, length = 20, unique = true)
    private String voucherNumber;

    @Column(name = "VoucherDate", nullable = false)
    @Builder.Default
    private LocalDateTime voucherDate = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CustomerID")
    private Customer customer;

    @Column(name = "PayerName", length = 200)
    private String payerName;

    @Column(name = "PaymentMethod", nullable = false, length = 20)
    private String paymentMethod; // Cash, Cheque, BankTransfer, etc.

    @Column(name = "CashRegisterID")
    private Integer cashRegisterId;

    @Column(name = "BankAccountID")
    private Integer bankAccountId;

    @Column(name = "ChequeID")
    private Integer chequeId;

    @Column(name = "Currency", length = 3)
    @Builder.Default
    private String currency = "EGP";

    @Column(name = "ExchangeRate", precision = 18, scale = 6)
    @Builder.Default
    private BigDecimal exchangeRate = BigDecimal.ONE;

    @Column(name = "Amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Column(name = "AmountInWords", length = 500)
    private String amountInWords;

    @Column(name = "ReferenceType", length = 30)
    private String referenceType; // SalesInvoice, etc.

    @Column(name = "ReferenceID")
    private Integer referenceId;

    @Column(name = "Description", length = 500)
    private String description;

    @Column(name = "Status", length = 20)
    @Builder.Default
    private String status = "Draft";

    @Column(name = "JournalEntryID")
    private Integer journalEntryId;

    @Column(name = "ReceivedByUserID", nullable = false)
    private Integer receivedByUserId;

    @Column(name = "PostedByUserID")
    private Integer postedByUserId;

    @Column(name = "PostedDate")
    private LocalDateTime postedDate;

    @Column(name = "Notes", length = 1000)
    private String notes;

    @OneToMany(mappedBy = "receiptVoucher", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PaymentReceiptAllocation> allocations;
}
