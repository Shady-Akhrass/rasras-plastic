package com.rasras.erp.procurement;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseRequisitionRepository extends JpaRepository<PurchaseRequisition, Integer> {
    Optional<PurchaseRequisition> findByPrNumber(String prNumber);

    /** PRs created by the given user (for Sales: "الطلبات التي أنشأها فقط"). */
    List<PurchaseRequisition> findByCreatedBy(Integer createdBy);
}
