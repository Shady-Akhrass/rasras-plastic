package com.rasras.erp.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Integer> {
    List<Item> findByIsActiveTrue();

    List<Item> findByCategoryId(Integer categoryId);

    boolean existsByCategoryId(Integer categoryId);

    /** للحصول على أعلى رقم تسلسلي من أكواد ITEM-XXXXX */
    @org.springframework.data.jpa.repository.Query(value = "SELECT COALESCE(MAX(CAST(SUBSTRING(ItemCode, 6) AS UNSIGNED)), 0) FROM items WHERE ItemCode LIKE 'ITEM-%'", nativeQuery = true)
    Integer findMaxItemCodeSequence();
}
