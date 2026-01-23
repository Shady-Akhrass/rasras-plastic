package com.rasras.erp.procurement;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RFQRepository extends JpaRepository<RequestForQuotation, Integer> {
    List<RequestForQuotation> findByPurchaseRequisitionId(Integer prId);
}
