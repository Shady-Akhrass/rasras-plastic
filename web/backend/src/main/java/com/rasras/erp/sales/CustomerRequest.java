package com.rasras.erp.sales;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import com.rasras.erp.sales.CustomerRequestItem;

@Entity
@Table(name = "customerrequests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer requestId;

    @Column(nullable = false, unique = true, length = 20)
    private String requestNumber;

    @Column(nullable = false)
    @Builder.Default
    private LocalDate requestDate = LocalDate.now();

    @Column(nullable = false)
    private Integer customerId;

    private Integer priceListId;

    @Column(length = 20)
    @Builder.Default
    private String status = "Pending";

    @Column(length = 1000)
    private String notes;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private Integer createdBy;

    private Integer approvedBy;
    private LocalDateTime approvedAt;

    @Column(length = 500)
    private String rejectionReason;

    @OneToMany(mappedBy = "customerRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CustomerRequestItem> items;
}
