package com.rasras.erp.procurement;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseRequisitionRepository extends JpaRepository<PurchaseRequisition, Integer> {
    Optional<PurchaseRequisition> findByPrNumber(String prNumber);

    /** PRs created by the given user (for Sales: "الطلبات التي أنشأها فقط"). */
    List<PurchaseRequisition> findByCreatedBy(Integer createdBy);

    /** Count of approved PRs that have no RFQ yet (for RFQ page alert). */
    @Query("SELECT COUNT(pr) FROM PurchaseRequisition pr WHERE pr.status = 'Approved' AND NOT EXISTS (SELECT 1 FROM RequestForQuotation rfq WHERE rfq.purchaseRequisition = pr)")
    long countApprovedWithNoRfq();
}
