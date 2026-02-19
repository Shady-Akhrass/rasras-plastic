package com.rasras.erp.finance;

import com.rasras.erp.finance.dto.PaymentVoucherDto;
import com.rasras.erp.finance.dto.PaymentVoucherAllocationDto;
import com.rasras.erp.finance.dto.InvoiceComparisonData;
import com.rasras.erp.finance.dto.InvoiceItemComparison;
import com.rasras.erp.finance.dto.SupplierWithInvoices;
import com.rasras.erp.inventory.GoodsReceiptNote;
import com.rasras.erp.inventory.GoodsReceiptNoteRepository;
import com.rasras.erp.procurement.PurchaseReturn;
import com.rasras.erp.procurement.PurchaseReturnItem;
import com.rasras.erp.procurement.PurchaseReturnRepository;
import com.rasras.erp.procurement.PurchaseOrder;
import com.rasras.erp.procurement.PurchaseOrderRepository;
import com.rasras.erp.supplier.Supplier;
import com.rasras.erp.supplier.SupplierInvoice;
import com.rasras.erp.supplier.SupplierInvoiceRepository;
import com.rasras.erp.supplier.SupplierRepository;
import com.rasras.erp.supplier.SupplierInvoiceService;
import com.rasras.erp.approval.ApprovalService;
import com.rasras.erp.user.UserRepository;
import com.rasras.erp.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
// Fixed findByStatusIn compilation error
public class PaymentVoucherService {

    // Payment Voucher Business Logic Service
    private final PaymentVoucherRepository voucherRepo;

    private final SupplierInvoiceRepository invoiceRepo;
    private final SupplierRepository supplierRepo;
    private final PurchaseOrderRepository poRepo;
    private final GoodsReceiptNoteRepository grnRepo;
    private final PurchaseReturnRepository purchaseReturnRepo;
    private final ApprovalService approvalService;
    private final UserRepository userRepo;
    private final SupplierInvoiceService supplierInvoiceService;

    @Transactional(readOnly = true)
    public List<PaymentVoucherDto> getAllVouchers() {
        return voucherRepo.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PaymentVoucherDto getVoucherById(Integer id) {
        PaymentVoucher voucher = voucherRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment Voucher not found"));
        return mapToDto(voucher);
    }

    @Transactional
    public PaymentVoucherDto createVoucher(PaymentVoucherDto dto) {
        if (dto.getAllocations() == null || dto.getAllocations().isEmpty()) {
            throw new RuntimeException("At least one invoice allocation is required");
        }

        // Get the first allocation since the current schema supports one invoice per
        // voucher
        PaymentVoucherAllocationDto firstAllocation = dto.getAllocations().get(0);

        SupplierInvoice invoice = invoiceRepo.findById(firstAllocation.getSupplierInvoiceId())
                .orElseThrow(() -> new RuntimeException("Supplier Invoice not found"));

        Supplier supplier = supplierRepo.findById(dto.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        PaymentVoucher voucher = PaymentVoucher.builder()
                .voucherNumber(dto.getVoucherNumber())
                .voucherDate(dto.getVoucherDate() != null ? dto.getVoucherDate() : LocalDate.now())
                .supplierInvoice(invoice)
                .supplier(supplier)
                .paymentMethod(dto.getPaymentMethod())
                .amount(dto.getAmount())
                .paymentAmount(dto.getAmount())
                .cashAmount(dto.getCashAmount())
                .bankAmount(dto.getBankAmount())
                .chequeAmount(dto.getChequeAmount())
                .bankTransferAmount(dto.getBankTransferAmount())
                .isSplitPayment(dto.getIsSplitPayment())
                .currency(dto.getCurrency() != null ? dto.getCurrency() : "EGP")

                .exchangeRate(dto.getExchangeRate() != null ? dto.getExchangeRate() : BigDecimal.ONE)
                .notes(dto.getNotes())
                .preparedByUserId(dto.getPreparedByUserId())
                .status("Pending")
                .approvalStatus("Pending")
                .build();

        // Generate voucher number if not provided
        if (voucher.getVoucherNumber() == null || voucher.getVoucherNumber().isEmpty()) {
            voucher.setVoucherNumber(generateVoucherNumber());
        }

        PaymentVoucher savedVoucher = voucherRepo.save(voucher);

        // Initiate Global Approval Workflow
        try {
            approvalService.initiateApproval(
                    "PV_APPROVAL",
                    "PaymentVoucher",
                    savedVoucher.getId(),
                    savedVoucher.getVoucherNumber(),
                    savedVoucher.getPreparedByUserId(),
                    savedVoucher.getAmount());
        } catch (Exception e) {
            // Log and potentially handle if workflow initialization fails
            System.err.println("Failed to initiate global approval for voucher: " + savedVoucher.getVoucherNumber());
            e.printStackTrace();
        }

        return mapToDto(savedVoucher);
    }

    @Transactional
    public PaymentVoucherDto approveFinanceManager(Integer voucherId, String approvedBy) {
        PaymentVoucher voucher = voucherRepo.findById(voucherId)
                .orElseThrow(() -> new RuntimeException("Payment Voucher not found"));

        if (!"Pending".equals(voucher.getApprovalStatus())) {
            throw new RuntimeException("Voucher is not in pending status");
        }

        voucher.setApprovalStatus("FinanceApproved");
        voucher.setApprovedByFinanceManager(approvedBy);
        voucher.setFinanceManagerApprovalDate(LocalDate.now());

        // Sync with Global Approval System
        Integer userId = userRepo.findByUsername(approvedBy).map(User::getUserId).orElse(1);
        approvalService.syncAction("PaymentVoucher", voucherId, "Approved", userId);

        return mapToDto(voucherRepo.save(voucher));
    }

    @Transactional
    public PaymentVoucherDto approveGeneralManager(Integer voucherId, String approvedBy) {
        PaymentVoucher voucher = voucherRepo.findById(voucherId)
                .orElseThrow(() -> new RuntimeException("Payment Voucher not found"));

        if (!"FinanceApproved".equals(voucher.getApprovalStatus())) {
            throw new RuntimeException("Voucher must be approved by Finance Manager first");
        }

        voucher.setApprovalStatus("GMApproved");
        voucher.setApprovedByGeneralManager(approvedBy);
        voucher.setGeneralManagerApprovalDate(LocalDate.now());

        // Sync with Global Approval System
        Integer userId = userRepo.findByUsername(approvedBy).map(User::getUserId).orElse(1);
        approvalService.syncAction("PaymentVoucher", voucherId, "Approved", userId);

        return mapToDto(voucherRepo.save(voucher));
    }

    @Transactional
    public PaymentVoucherDto rejectVoucher(Integer voucherId, String rejectedBy, String reason) {
        PaymentVoucher voucher = voucherRepo.findById(voucherId)
                .orElseThrow(() -> new RuntimeException("Payment Voucher not found"));

        voucher.setApprovalStatus("Rejected");
        voucher.setNotes(reason);

        // Sync with Global Approval System
        Integer userId = userRepo.findByUsername(rejectedBy).map(User::getUserId).orElse(1);
        approvalService.syncAction("PaymentVoucher", voucherId, "Rejected", userId);

        return mapToDto(voucherRepo.save(voucher));
    }

    @Transactional
    public PaymentVoucherDto processPayment(Integer voucherId, String paidBy) {
        PaymentVoucher voucher = voucherRepo.findById(voucherId)
                .orElseThrow(() -> new RuntimeException("Payment Voucher not found"));

        if (!"GMApproved".equals(voucher.getApprovalStatus()) && !"Approved".equals(voucher.getApprovalStatus())) {
            throw new RuntimeException("Voucher must be fully approved by GM before payment");
        }

        // Use centralized payment recording
        supplierInvoiceService.recordPayment(
                voucher.getSupplierInvoice().getId(),
                voucher.getPaymentAmount(),
                paidBy);

        // Update voucher status
        voucher.setStatus("Paid");
        voucher.setPaidBy(paidBy);
        voucher.setPaidDate(LocalDate.now());

        return mapToDto(voucherRepo.save(voucher));
    }

    @Transactional
    public PaymentVoucherDto cancelVoucher(Integer voucherId, String cancelledBy, String reason) {
        PaymentVoucher voucher = voucherRepo.findById(voucherId)
                .orElseThrow(() -> new RuntimeException("Payment Voucher not found"));

        if ("Paid".equals(voucher.getStatus())) {
            throw new RuntimeException("Cannot cancel a paid voucher");
        }

        voucher.setStatus("Cancelled");
        voucher.setNotes(reason);

        return mapToDto(voucherRepo.save(voucher));
    }

    private String generateVoucherNumber() {
        long count = voucherRepo.count() + 1;
        return "PV-" + count;
    }

    @Transactional(readOnly = true)
    public List<SupplierWithInvoices> getSuppliersWithPendingInvoices() {
        List<SupplierInvoice> pendingInvoices = invoiceRepo.findByStatusIn(List.of("Unpaid", "Partial"));

        // Filter for approved ones
        List<SupplierInvoice> approvedPending = pendingInvoices.stream()
                .filter(inv -> "Approved".equals(inv.getApprovalStatus()))
                .collect(Collectors.toList());

        Map<Supplier, List<SupplierInvoice>> groupedBySupplier = approvedPending.stream()
                .collect(Collectors.groupingBy(SupplierInvoice::getSupplier));

        List<SupplierWithInvoices> result = new ArrayList<>();
        for (Map.Entry<Supplier, List<SupplierInvoice>> entry : groupedBySupplier.entrySet()) {
            Supplier supplier = entry.getKey();
            List<SupplierInvoice> invoices = entry.getValue();

            List<InvoiceComparisonData> comparisonDataList = invoices.stream()
                    .map(this::convertToComparisonData)
                    .collect(Collectors.toList());

            BigDecimal totalOutstanding = comparisonDataList.stream()
                    .map(InvoiceComparisonData::getRemainingAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            result.add(SupplierWithInvoices.builder()
                    .supplierId(supplier.getId())
                    .nameAr(supplier.getSupplierNameAr())
                    .nameEn(supplier.getSupplierNameEn())
                    .code(supplier.getSupplierCode())
                    .pendingInvoices(comparisonDataList)
                    .totalOutstanding(totalOutstanding)
                    .build());
        }

        return result;
    }

    @Transactional(readOnly = true)
    public List<InvoiceComparisonData> getInvoiceComparison(Integer supplierId) {
        List<SupplierInvoice> invoices = invoiceRepo.findBySupplierId(supplierId);

        return invoices.stream()
                .filter(inv -> List.of("Unpaid", "Partial").contains(inv.getStatus())
                        && "Approved".equals(inv.getApprovalStatus()))
                .map(this::convertToComparisonData)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InvoiceComparisonData> getUnpaidInvoices() {
        List<SupplierInvoice> invoices = invoiceRepo.findByStatusIn(List.of("Unpaid", "Partial"));

        return invoices.stream()
                .filter(inv -> "Approved".equals(inv.getApprovalStatus()))
                .map(this::convertToComparisonData)
                .collect(Collectors.toList());
    }

    private InvoiceComparisonData convertToComparisonData(SupplierInvoice inv) {
        PurchaseOrder po = null;
        if (inv.getPoId() != null) {
            po = poRepo.findById(inv.getPoId()).orElse(null);
        }

        GoodsReceiptNote grn = null;
        if (inv.getGrnId() != null) {
            grn = grnRepo.findById(inv.getGrnId()).orElse(null);
        }

        BigDecimal poTotal = po != null ? po.getTotalAmount() : BigDecimal.ZERO;
        BigDecimal grnTotal = grn != null ? calculateGrnTotal(grn) : BigDecimal.ZERO;
        BigDecimal invoiceTotal = inv.getTotalAmount();

        BigDecimal variance = BigDecimal.ZERO;
        if (poTotal.compareTo(BigDecimal.ZERO) > 0) {
            variance = invoiceTotal.subtract(poTotal).divide(poTotal, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal(100));
        }

        // Populating Item Comparison
        List<InvoiceItemComparison> itemComparisons = new ArrayList<>();
        if (inv.getItems() != null) {
            for (var invItem : inv.getItems()) {
                InvoiceItemComparison itemComp = InvoiceItemComparison.builder()
                        .itemName(invItem.getItem().getItemNameAr())
                        .invoiceQuantity(invItem.getQuantity())
                        .invoiceUnitPrice(invItem.getUnitPrice())
                        .invoiceLineTotal(invItem.getTotalPrice())
                        .build();

                // Find matching PO item
                if (po != null && po.getItems() != null) {
                    po.getItems().stream()
                            .filter(pi -> pi.getItem().getId().equals(invItem.getItem().getId()))
                            .findFirst()
                            .ifPresent(pi -> {
                                itemComp.setPoQuantity(pi.getOrderedQty());
                                itemComp.setPoUnitPrice(pi.getUnitPrice());
                                itemComp.setPoDiscountPercentage(pi.getDiscountPercentage());
                                itemComp.setPoTaxPercentage(pi.getTaxPercentage());
                                itemComp.setPoLineTotal(pi.getTotalPrice());
                            });
                }

                // Find matching GRN item
                if (grn != null && grn.getItems() != null) {
                    grn.getItems().stream()
                            .filter(gi -> gi.getItem().getId().equals(invItem.getItem().getId()))
                            .findFirst()
                            .ifPresent(gi -> {
                                itemComp.setGrnQuantity(
                                        gi.getAcceptedQty() != null ? gi.getAcceptedQty() : gi.getReceivedQty());
                                itemComp.setGrnUnitPrice(gi.getUnitCost() != null ? gi.getUnitCost()
                                        : (itemComp.getPoUnitPrice() != null ? itemComp.getPoUnitPrice()
                                                : BigDecimal.ZERO));
                                itemComp.setGrnLineTotal(gi.getTotalCost() != null ? gi.getTotalCost()
                                        : itemComp.getGrnQuantity().multiply(itemComp.getGrnUnitPrice()));
                            });
                }

                itemComparisons.add(itemComp);
            }
        }

        // Look up purchase returns linked to the GRN and populate return data per item
        BigDecimal returnSubTotal = BigDecimal.ZERO;
        BigDecimal returnTotal = BigDecimal.ZERO;

        if (grn != null && grn.getId() != null) {
            List<PurchaseReturn> returns = purchaseReturnRepo.findByGrnId(grn.getId());
            for (PurchaseReturn ret : returns) {
                returnSubTotal = returnSubTotal.add(ret.getSubTotal() != null ? ret.getSubTotal() : BigDecimal.ZERO);
                returnTotal = returnTotal.add(ret.getTotalAmount() != null ? ret.getTotalAmount() : BigDecimal.ZERO);

                if (ret.getItems() != null) {
                    for (PurchaseReturnItem retItem : ret.getItems()) {
                        // Find matching item comparison by itemId
                        itemComparisons.stream()
                                .filter(ic -> ic.getItemName() != null
                                        && retItem.getItem() != null
                                        && ic.getItemName().equals(retItem.getItem().getItemNameAr()))
                                .findFirst()
                                .ifPresent(ic -> {
                                    BigDecimal existingRetQty = ic.getReturnedQuantity() != null
                                            ? ic.getReturnedQuantity()
                                            : BigDecimal.ZERO;
                                    ic.setReturnedQuantity(existingRetQty.add(retItem.getReturnedQty()));
                                    ic.setReturnUnitPrice(retItem.getUnitPrice());
                                    BigDecimal existingRetTotal = ic.getReturnLineTotal() != null
                                            ? ic.getReturnLineTotal()
                                            : BigDecimal.ZERO;
                                    ic.setReturnLineTotal(existingRetTotal.add(retItem.getTotalPrice()));
                                });
                    }
                }
            }
        }

        // Set match status after return data is populated
        for (InvoiceItemComparison ic : itemComparisons) {
            BigDecimal retQty = ic.getReturnedQuantity() != null ? ic.getReturnedQuantity() : BigDecimal.ZERO;
            BigDecimal netGrnQty = (ic.getGrnQuantity() != null ? ic.getGrnQuantity() : BigDecimal.ZERO)
                    .subtract(retQty);
            boolean qtyMatch = ic.getInvoiceQuantity() != null && ic.getInvoiceQuantity().compareTo(netGrnQty) == 0;
            boolean priceMatch = ic.getInvoiceUnitPrice() != null && ic.getPoUnitPrice() != null
                    && ic.getInvoiceUnitPrice().compareTo(ic.getPoUnitPrice()) == 0;
            ic.setIsMatch(qtyMatch && priceMatch);
        }

        BigDecimal poSubTotal = po != null ? po.getSubTotal() : BigDecimal.ZERO;
        BigDecimal poTaxAmount = po != null ? po.getTaxAmount() : BigDecimal.ZERO;
        BigDecimal poDiscountAmount = po != null ? po.getDiscountAmount() : BigDecimal.ZERO;

        BigDecimal grnSubTotal = grn != null
                ? grnTotal.subtract(grn.getShippingCost() != null ? grn.getShippingCost() : BigDecimal.ZERO)
                        .subtract(grn.getOtherCosts() != null ? grn.getOtherCosts() : BigDecimal.ZERO)
                : BigDecimal.ZERO;
        BigDecimal grnTaxAmount = BigDecimal.ZERO;
        BigDecimal grnDiscountAmount = BigDecimal.ZERO;

        // If totals match perfectly, align breakdown to suppress confusing variances
        // This handles cases where PO was recorded with "inclusive" prices
        if (poTotal.compareTo(invoiceTotal) == 0) {
            poSubTotal = inv.getSubTotal();
            poTaxAmount = inv.getTaxAmount();
            poDiscountAmount = inv.getDiscountAmount();
        }

        if (grnTotal.compareTo(invoiceTotal) == 0) {
            grnSubTotal = inv.getSubTotal();
            grnTaxAmount = inv.getTaxAmount();
            grnDiscountAmount = inv.getDiscountAmount();
        }

        // Calculate percentages for PO and Invoice
        BigDecimal poDiscountPercentage = po != null && po.getSubTotal() != null
                && po.getSubTotal().compareTo(BigDecimal.ZERO) > 0
                        ? po.getDiscountAmount().multiply(new BigDecimal(100)).divide(po.getSubTotal(), 2,
                                RoundingMode.HALF_UP)
                        : BigDecimal.ZERO;

        BigDecimal poAfterDiscount = poSubTotal.subtract(poDiscountAmount);
        BigDecimal poTaxPercentage = poAfterDiscount.compareTo(BigDecimal.ZERO) > 0
                ? poTaxAmount.multiply(new BigDecimal(100)).divide(poAfterDiscount, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal invDiscountPercentage = inv.getSubTotal() != null && inv.getSubTotal().compareTo(BigDecimal.ZERO) > 0
                ? inv.getDiscountAmount().multiply(new BigDecimal(100)).divide(inv.getSubTotal(), 2,
                        RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal invAfterDiscount = inv.getSubTotal().subtract(inv.getDiscountAmount());
        BigDecimal invTaxPercentage = invAfterDiscount.compareTo(BigDecimal.ZERO) > 0
                ? inv.getTaxAmount().multiply(new BigDecimal(100)).divide(invAfterDiscount, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return InvoiceComparisonData.builder()
                .supplierInvoiceId(inv.getId())
                .invoiceNumber(inv.getInvoiceNumber())
                .invoiceDate(inv.getInvoiceDate())
                .currency(inv.getCurrency() != null ? inv.getCurrency() : "EGP")
                .invoiceTotal(invoiceTotal)
                .invoiceSubTotal(inv.getSubTotal())
                .invoiceTaxAmount(inv.getTaxAmount())
                .invoiceDiscountAmount(inv.getDiscountAmount())
                .invoiceDiscountPercentage(invDiscountPercentage)
                .invoiceTaxPercentage(invTaxPercentage)
                .invoiceDeliveryCost(inv.getDeliveryCost())
                .invoiceOtherCosts(inv.getOtherCosts())

                .poNumber(po != null ? po.getPoNumber() : null)
                .poTotal(poTotal)
                .poSubTotal(poSubTotal)
                .poTaxAmount(poTaxAmount)
                .poDiscountAmount(poDiscountAmount)
                .poDiscountPercentage(poDiscountPercentage)
                .poTaxPercentage(poTaxPercentage)
                .poShippingCost(po != null ? po.getShippingCost() : BigDecimal.ZERO)
                .poOtherCosts(po != null ? po.getOtherCosts() : BigDecimal.ZERO)

                .grnNumber(grn != null ? grn.getGrnNumber() : null)
                .grnTotal(grnTotal)
                .grnSubTotal(grnSubTotal)
                .grnTaxAmount(grnTaxAmount)
                .grnDiscountAmount(grnDiscountAmount)
                .grnTaxPercentage(grnSubTotal.compareTo(BigDecimal.ZERO) > 0
                        ? grnTaxAmount.multiply(new BigDecimal(100)).divide(grnSubTotal, 2, RoundingMode.HALF_UP)
                        : BigDecimal.ZERO)
                .grnDiscountPercentage(grnSubTotal.compareTo(BigDecimal.ZERO) > 0
                        ? grnDiscountAmount.multiply(new BigDecimal(100)).divide(grnSubTotal, 2, RoundingMode.HALF_UP)
                        : BigDecimal.ZERO)
                .grnShippingCost(grn != null ? grn.getShippingCost() : BigDecimal.ZERO)
                .grnOtherCosts(grn != null ? grn.getOtherCosts() : BigDecimal.ZERO)
                .returnSubTotal(returnSubTotal)
                .returnTotal(returnTotal)

                .variancePercentage(variance)
                .isValid(variance.abs().compareTo(new BigDecimal(10)) <= 0)
                .paidAmount(inv.getPaidAmount() != null ? inv.getPaidAmount() : BigDecimal.ZERO)
                .remainingAmount(inv.getTotalAmount()
                        .subtract(inv.getPaidAmount() != null ? inv.getPaidAmount() : BigDecimal.ZERO))
                .items(itemComparisons)
                .build();

    }

    private BigDecimal calculateGrnTotal(GoodsReceiptNote grn) {
        if (grn.getTotalAmount() != null) {
            return grn.getTotalAmount();
        }

        // Proper calculation if totalAmount is missing (for legacy records)
        BigDecimal subTotal = BigDecimal.ZERO;
        if (grn.getItems() != null) {
            subTotal = grn.getItems().stream()
                    .map(item -> item.getTotalCost() != null ? item.getTotalCost() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        return subTotal.add(grn.getShippingCost() != null ? grn.getShippingCost() : BigDecimal.ZERO)
                .add(grn.getOtherCosts() != null ? grn.getOtherCosts() : BigDecimal.ZERO);
    }

    private PaymentVoucherDto mapToDto(PaymentVoucher voucher) {
        if (voucher == null)
            return null;

        PaymentVoucherDto dto = PaymentVoucherDto.builder()
                .paymentVoucherId(voucher.getId())
                .voucherNumber(voucher.getVoucherNumber())
                .voucherDate(voucher.getVoucherDate())
                .supplierId(voucher.getSupplier() != null ? voucher.getSupplier().getId() : null)
                .supplierNameAr(voucher.getSupplier() != null ? voucher.getSupplier().getSupplierNameAr() : null)
                .supplierNameEn(voucher.getSupplier() != null ? voucher.getSupplier().getSupplierNameEn() : null)
                .paymentMethod(voucher.getPaymentMethod())
                .bankName(voucher.getBankName())
                .accountNumber(voucher.getAccountNumber())
                .checkNumber(voucher.getCheckNumber())
                .amount(voucher.getAmount())
                .cashAmount(voucher.getCashAmount())
                .bankAmount(voucher.getBankAmount())
                .chequeAmount(voucher.getChequeAmount())
                .bankTransferAmount(voucher.getBankTransferAmount())
                .isSplitPayment(voucher.getIsSplitPayment())
                .currency(voucher.getCurrency())
                .exchangeRate(voucher.getExchangeRate())
                .status(voucher.getStatus())
                .approvalStatus(voucher.getApprovalStatus())
                .notes(voucher.getNotes())
                .preparedByUserId(voucher.getPreparedByUserId())
                .build();

        if (voucher.getSupplierInvoice() != null) {
            InvoiceComparisonData comparison = convertToComparisonData(voucher.getSupplierInvoice());

            // Calculate previously paid amount
            // If the voucher is already PAID/APPROVED, the invoice.paidAmount includes this
            // voucher's amount
            // So we subtract it to show what was paid BEFORE this voucher
            BigDecimal currentPaid = voucher.getSupplierInvoice().getPaidAmount() != null
                    ? voucher.getSupplierInvoice().getPaidAmount()
                    : BigDecimal.ZERO;

            BigDecimal previouslyPaid = currentPaid;
            String status = voucher.getStatus() != null ? voucher.getStatus().toLowerCase() : "";
            if (status.contains("paid") || status.contains("approved")) {
                previouslyPaid = currentPaid.subtract(voucher.getAmount());
            }
            if (previouslyPaid.compareTo(BigDecimal.ZERO) < 0) {
                previouslyPaid = BigDecimal.ZERO;
            }

            PaymentVoucherAllocationDto allocation = PaymentVoucherAllocationDto.builder()
                    .supplierInvoiceId(comparison.getSupplierInvoiceId())
                    .allocatedAmount(voucher.getAmount())
                    .invoiceNumber(comparison.getInvoiceNumber())
                    .invoiceDate(comparison.getInvoiceDate())
                    .invoicePreviouslyPaid(previouslyPaid)
                    .invoiceTotal(comparison.getInvoiceTotal())
                    .invoiceSubTotal(comparison.getInvoiceSubTotal())
                    .invoiceTaxAmount(comparison.getInvoiceTaxAmount())
                    .invoiceDiscountAmount(comparison.getInvoiceDiscountAmount())
                    .invoiceTaxPercentage(comparison.getInvoiceTaxPercentage())
                    .invoiceDiscountPercentage(comparison.getInvoiceDiscountPercentage())
                    .invoiceDeliveryCost(comparison.getInvoiceDeliveryCost())
                    .invoiceOtherCosts(comparison.getInvoiceOtherCosts())
                    .poNumber(comparison.getPoNumber())
                    .poTotal(comparison.getPoTotal())
                    .poSubTotal(comparison.getPoSubTotal())
                    .poTaxAmount(comparison.getPoTaxAmount())
                    .poDiscountAmount(comparison.getPoDiscountAmount())
                    .poTaxPercentage(comparison.getPoTaxPercentage())
                    .poDiscountPercentage(comparison.getPoDiscountPercentage())
                    .poShippingCost(comparison.getPoShippingCost())
                    .poOtherCosts(comparison.getPoOtherCosts())
                    .grnNumber(comparison.getGrnNumber())
                    .grnTotal(comparison.getGrnTotal())
                    .grnSubTotal(comparison.getGrnSubTotal())
                    .grnTaxAmount(comparison.getGrnTaxAmount())
                    .grnDiscountAmount(comparison.getGrnDiscountAmount())
                    .grnTaxPercentage(comparison.getGrnTaxPercentage())
                    .grnDiscountPercentage(comparison.getGrnDiscountPercentage())
                    .grnShippingCost(comparison.getGrnShippingCost())
                    .grnOtherCosts(comparison.getGrnOtherCosts())
                    .variancePercentage(comparison.getVariancePercentage())
                    .isValid(comparison.getIsValid())
                    .build();

            dto.setAllocations(List.of(allocation));
        }

        return dto;
    }
}
