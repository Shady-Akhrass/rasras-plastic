package com.rasras.erp.sales;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "customerrequestdeliveryschedules")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerRequestDeliverySchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer scheduleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "RequestID", nullable = false)
    @JsonBackReference
    private CustomerRequest customerRequest;

    @Column(nullable = false)
    private LocalDate deliveryDate;

    private Integer productId;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal quantity;

    @Column(length = 500)
    private String notes;
}
