package com.rasras.erp.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StockTransferRepository extends JpaRepository<StockTransfer, Integer> {

    Optional<StockTransfer> findByTransferNumber(String transferNumber);
}
