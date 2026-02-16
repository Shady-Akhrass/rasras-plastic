package com.rasras.erp.finance;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.rasras.erp.shared.audit.AuditableEntity;
import com.rasras.erp.supplier.Supplier;
import com.rasras.erp.supplier.SupplierInvoice;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "paymentvouchers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentVoucher extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PaymentVoucherID")
    private Integer id;

    @Column(name = "VoucherNumber", nullable = false, length = 30)
    private String voucherNumber;

    @Column(name = "VoucherDate", nullable = false)
    private LocalDate voucherDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SupplierInvoiceID", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "supplier", "items" })
    private SupplierInvoice supplierInvoice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SupplierID", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "supplierItems" })
    private Supplier supplier;

    @Column(name = "PaymentMethod", length = 50)
    private String paymentMethod; // Cash, Bank Transfer, Check

    @Column(name = "BankName", length = 100)
    private String bankName;

    @Column(name = "AccountNumber", length = 50)
    private String accountNumber;

    @Column(name = "CheckNumber", length = 50)
    private String checkNumber;

    @Column(name = "Amount", precision = 18, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "PaymentAmount", precision = 18, scale = 2, nullable = false)
    private BigDecimal paymentAmount;

    @Column(name = "CashAmount", precision = 18, scale = 2)
    private BigDecimal cashAmount;

    @Column(name = "BankAmount", precision = 18, scale = 2)
    private BigDecimal bankAmount;

    @Column(name = "ChequeAmount", precision = 18, scale = 2)
    private BigDecimal chequeAmount;

    @Column(name = "BankTransferAmount", precision = 18, scale = 2)
    private BigDecimal bankTransferAmount;

    @Column(name = "IsSplitPayment")
    private Boolean isSplitPayment;

    @Column(name = "Currency", length = 3)
    @Builder.Default
    private String currency = "EGP";

    @Column(name = "ExchangeRate", precision = 18, scale = 6)
    @Builder.Default
    private BigDecimal exchangeRate = BigDecimal.ONE;

    @Column(name = "PaymentReference", length = 100)
    private String paymentReference;

    @Column(name = "Status", length = 20)
    @Builder.Default
    private String status = "Pending"; // Pending, Approved, Paid, Cancelled

    @Column(name = "ApprovalStatus", length = 20)
    @Builder.Default
    private String approvalStatus = "Pending"; // Pending, Approved, Rejected

    @Column(name = "Notes", length = 1000)
    private String notes;

    @Column(name = "ApprovedByFinanceManager", length = 100)
    private String approvedByFinanceManager;

    @Column(name = "FinanceManagerApprovalDate")
    private LocalDate financeManagerApprovalDate;

    @Column(name = "ApprovedByGeneralManager", length = 100)
    private String approvedByGeneralManager;

    @Column(name = "GeneralManagerApprovalDate")
    private LocalDate generalManagerApprovalDate;

    @Column(name = "PaidBy", length = 100)
    private String paidBy;

    @Column(name = "PaidDate")
    private LocalDate paidDate;

    @Column(name = "PreparedByUserID")
    private Integer preparedByUserId;
}
