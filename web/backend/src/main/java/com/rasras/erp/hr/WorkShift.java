package com.rasras.erp.hr;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "workshifts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkShift {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ShiftID")
    private Integer shiftId;

    @Column(name = "ShiftCode", length = 20, nullable = false)
    private String shiftCode;

    @Column(name = "ShiftNameAr", length = 100, nullable = false)
    private String shiftNameAr;

    @Column(name = "ShiftNameEn", length = 100)
    private String shiftNameEn;

    @Column(name = "StartTime", nullable = false)
    private LocalTime startTime;

    @Column(name = "EndTime", nullable = false)
    private LocalTime endTime;

    @Column(name = "GraceMinutes", nullable = false)
    @Builder.Default
    private Integer graceMinutes = 0;

    @Column(name = "IsNightShift", nullable = false)
    @Builder.Default
    private Boolean isNightShift = false;

    @Column(name = "IsActive", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "CreatedAt")
    private LocalDateTime createdAt;
}

