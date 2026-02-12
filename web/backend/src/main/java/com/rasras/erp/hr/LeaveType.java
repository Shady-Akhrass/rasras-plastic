package com.rasras.erp.hr;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "leavetypes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveType {

    @Id
    @Column(name = "LeaveTypeCode", length = 20, nullable = false)
    private String leaveTypeCode;

    @Column(name = "LeaveTypeNameAr", length = 100, nullable = false)
    private String leaveTypeNameAr;

    @Column(name = "LeaveTypeNameEn", length = 100)
    private String leaveTypeNameEn;

    @Column(name = "IsPaid", nullable = false)
    @Builder.Default
    private Boolean isPaid = true;

    @Column(name = "MaxDaysPerYear")
    private Integer maxDaysPerYear;

    @Column(name = "IsActive", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "CreatedAt")
    private LocalDateTime createdAt;
}

