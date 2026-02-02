package com.rasras.erp.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Integer> {
    List<Item> findByIsActiveTrue();

    List<Item> findByCategoryId(Integer categoryId);

    boolean existsByCategoryId(Integer categoryId);
}
