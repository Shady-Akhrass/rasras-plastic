package com.rasras.erp.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemExchangeRateHistoryRepository extends JpaRepository<ItemExchangeRateHistory, Integer> {

    List<ItemExchangeRateHistory> findByItemIdOrderByRecordedAtDesc(Integer itemId);

    List<ItemExchangeRateHistory> findTop10ByItemIdOrderByRecordedAtDesc(Integer itemId);
}
