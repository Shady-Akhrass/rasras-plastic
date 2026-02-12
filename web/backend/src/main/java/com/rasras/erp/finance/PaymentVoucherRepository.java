package com.rasras.erp.finance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentVoucherRepository extends JpaRepository<PaymentVoucher, Integer> {
    Optional<PaymentVoucher> findByVoucherNumber(String voucherNumber);
    List<PaymentVoucher> findBySupplierInvoiceId(Integer supplierInvoiceId);
    List<PaymentVoucher> findByStatus(String status);
    List<PaymentVoucher> findByApprovalStatus(String approvalStatus);
}
