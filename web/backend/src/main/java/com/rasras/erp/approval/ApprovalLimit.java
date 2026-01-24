package com.rasras.erp.approval;

import com.rasras.erp.user.Role;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "approvallimits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalLimit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ApprovalLimitID")
    private Integer id;

    @Column(name = "ActivityType", nullable = false, length = 50)
    private String activityType; // PO, Payment, etc.

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "RoleID", nullable = false)
    private Role role;

    @Column(name = "MinAmount", precision = 18, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal minAmount = BigDecimal.ZERO;

    @Column(name = "MaxAmount", precision = 18, scale = 2)
    private BigDecimal maxAmount;

    @Column(name = "MinPercentage", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal minPercentage = BigDecimal.ZERO;

    @Column(name = "MaxPercentage", precision = 5, scale = 2)
    private BigDecimal maxPercentage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "RequiresReviewBy")
    private Role requiresReviewBy;

    @Column(name = "IsActive")
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "CreatedAt", updatable = false)
    private LocalDateTime createdAt;
}
