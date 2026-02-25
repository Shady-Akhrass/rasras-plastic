package com.rasras.erp.sales;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerRequestDeliveryScheduleRepository
        extends JpaRepository<CustomerRequestDeliverySchedule, Integer> {
    List<CustomerRequestDeliverySchedule> findByDeliveryOrderId(Integer deliveryOrderId);

    List<CustomerRequestDeliverySchedule> findByCustomerRequest_RequestId(Integer requestId);
}
