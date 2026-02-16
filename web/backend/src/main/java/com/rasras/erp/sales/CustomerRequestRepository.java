package com.rasras.erp.sales;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRequestRepository extends JpaRepository<CustomerRequest, Integer> {
    boolean existsByRequestNumber(String requestNumber);
}
