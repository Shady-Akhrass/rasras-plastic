package com.rasras.erp.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GoodsReceiptNoteRepository extends JpaRepository<GoodsReceiptNote, Integer> {
    Optional<GoodsReceiptNote> findByGrnNumber(String grnNumber);

    List<GoodsReceiptNote> findByPurchaseOrder_Id(Integer poId);

    @Query("SELECT DISTINCT g FROM GoodsReceiptNote g LEFT JOIN FETCH g.items i LEFT JOIN FETCH i.item WHERE g.id = :id")
    Optional<GoodsReceiptNote> findByIdWithItems(@Param("id") Integer id);
}
