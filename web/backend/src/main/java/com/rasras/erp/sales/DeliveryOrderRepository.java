package com.rasras.erp.sales;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryOrderRepository extends JpaRepository<DeliveryOrder, Integer> {
    Optional<DeliveryOrder> findByDeliveryOrderNumber(String deliveryOrderNumber);
    List<DeliveryOrder> findByStockIssueNote_IdOrderByOrderDateDesc(Integer issueNoteId);
}
