package com.rasras.erp.finance;

import com.rasras.erp.approval.ApprovalService;
import com.rasras.erp.supplier.SupplierInvoice;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class FinanceApprovalService {

    private final ApprovalService approvalService;
    private final PaymentVoucherService paymentVoucherService;

    @Transactional
    public void initiatePaymentApproval(Integer invoiceId, Integer requestedByUserId, BigDecimal amount) {
        // Initiate approval workflow for payment
        approvalService.initiateApproval(
            "PAYMENT_APPROVAL",
            "PaymentVoucher",
            invoiceId,
            "PV-" + invoiceId,
            requestedByUserId,
            amount
        );
    }

    @Transactional
    public void processFinanceManagerApproval(Integer requestId, Integer actionByUserId, String action, String comments) {
        approvalService.processAction(requestId, actionByUserId, action, comments, null);
    }

    @Transactional
    public void processGeneralManagerApproval(Integer requestId, Integer actionByUserId, String action, String comments) {
        approvalService.processAction(requestId, actionByUserId, action, comments, null);
    }
}
