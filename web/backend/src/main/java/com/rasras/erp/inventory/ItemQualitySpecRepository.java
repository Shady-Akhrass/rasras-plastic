package com.rasras.erp.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ItemQualitySpecRepository extends JpaRepository<ItemQualitySpec, Integer> {
    List<ItemQualitySpec> findByItemId(Integer itemId);
}
