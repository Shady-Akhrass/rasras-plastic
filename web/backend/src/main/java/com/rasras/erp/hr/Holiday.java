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

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "holidays")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Holiday {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "HolidayID")
    private Integer holidayId;

    @Column(name = "HolidayDate", nullable = false)
    private LocalDate holidayDate;

    @Column(name = "HolidayNameAr", length = 200, nullable = false)
    private String holidayNameAr;

    @Column(name = "HolidayNameEn", length = 200)
    private String holidayNameEn;

    @Column(name = "IsActive", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "CreatedAt")
    private LocalDateTime createdAt;
}

