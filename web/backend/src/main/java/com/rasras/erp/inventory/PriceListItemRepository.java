package com.rasras.erp.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PriceListItemRepository extends JpaRepository<PriceListItem, Integer> {
    List<PriceListItem> findByPriceListId(Integer priceListId);

    void deleteByPriceListId(Integer priceListId);

    @org.springframework.data.jpa.repository.Query("SELECT MAX(p.id) FROM PriceListItem p")
    Integer findMaxId();
}
