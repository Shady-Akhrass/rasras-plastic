package com.rasras.erp.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GRNItemRepository extends JpaRepository<GRNItem, Integer> {

    @Query("SELECT g FROM GRNItem g WHERE g.item.id = :itemId")
    List<GRNItem> findByItemId(@Param("itemId") Integer itemId);
}
