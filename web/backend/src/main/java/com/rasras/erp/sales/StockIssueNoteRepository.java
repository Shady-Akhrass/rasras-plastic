package com.rasras.erp.sales;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockIssueNoteRepository extends JpaRepository<StockIssueNote, Integer> {
    Optional<StockIssueNote> findByIssueNoteNumber(String issueNoteNumber);
    List<StockIssueNote> findBySalesOrder_IdOrderByIssueDateDesc(Integer salesOrderId);
}
