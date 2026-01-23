package com.rasras.erp.procurement;

import com.rasras.erp.supplier.Supplier;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "requestforquotations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestForQuotation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "RFQID")
    private Integer id;

    @Column(name = "RFQNumber", nullable = false, length = 20)
    private String rfqNumber;

    @Column(name = "RFQDate", nullable = false)
    @Builder.Default
    private LocalDate rfqDate = LocalDate.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PRID")
    private PurchaseRequisition purchaseRequisition;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SupplierID", nullable = false)
    private Supplier supplier;

    @Column(name = "ResponseDueDate")
    private LocalDate responseDueDate;

    @Column(name = "Status", length = 20)
    @Builder.Default
    private String status = "Sent";

    @Column(name = "SentByUserID")
    private Integer sentByUserId;

    @Column(name = "SentDate")
    private LocalDateTime sentDate;

    @Column(name = "Notes", length = 1000)
    private String notes;

    @CreationTimestamp
    @Column(name = "CreatedAt", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "CreatedBy", nullable = false)
    private Integer createdBy;

    @OneToMany(mappedBy = "rfq", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RFQItem> items;
}
