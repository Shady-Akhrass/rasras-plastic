package com.rasras.erp.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GoodsReceiptNoteRepository extends JpaRepository<GoodsReceiptNote, Integer> {
    Optional<GoodsReceiptNote> findByGrnNumber(String grnNumber);

    List<GoodsReceiptNote> findByPurchaseOrder_Id(Integer poId);
}
