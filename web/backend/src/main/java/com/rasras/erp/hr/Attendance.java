package com.rasras.erp.hr;

import com.rasras.erp.employee.Employee;
import com.rasras.erp.shared.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "attendance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attendance extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "AttendanceID")
    private Integer attendanceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "EmployeeID", nullable = false)
    private Employee employee;

    @Column(name = "AttendanceDate", nullable = false)
    private LocalDate attendanceDate;

    @Column(name = "CheckInTime")
    private LocalTime checkInTime;

    @Column(name = "CheckOutTime")
    private LocalTime checkOutTime;

    @Column(name = "Status", length = 20)
    private String status; // PRESENT, ABSENT, LEAVE

    @Column(name = "LeaveType", length = 20)
    private String leaveType;

    @Column(name = "OvertimeHours", precision = 5, scale = 2)
    private BigDecimal overtimeHours;

    @Column(name = "Notes", length = 500)
    private String notes;
}

