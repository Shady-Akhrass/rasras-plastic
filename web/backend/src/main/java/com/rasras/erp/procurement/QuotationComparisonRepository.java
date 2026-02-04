package com.rasras.erp.procurement;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuotationComparisonRepository extends JpaRepository<QuotationComparison, Integer> {
    Optional<QuotationComparison> findByPurchaseRequisitionIdAndItemId(Integer prId, Integer itemId);

    List<QuotationComparison> findByPurchaseRequisitionId(Integer prId);
}
