package com.rasras.erp.sales;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "customerrequestitems")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerRequestItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer itemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "RequestID", nullable = false)
    @JsonBackReference
    private CustomerRequest customerRequest;

    private Integer productId;

    @Column(nullable = false, length = 200)
    private String productName;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal quantity;

    @Column(length = 500)
    private String notes;
}
