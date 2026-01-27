package com.rasras.erp.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemRepository extends JpaRepository<Item, Integer> {
    List<Item> findByIsActiveTrue();

    List<Item> findByCategoryId(Integer categoryId);

    Optional<Item> findByItemCode(String itemCode);

    boolean existsByItemCode(String itemCode);

    boolean existsByItemCodeAndIdNot(String itemCode, Integer id);
}
