package com.rasras.erp.inventory;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "qualityinspectionresults")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QualityInspectionResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "InspectionResultID")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "InspectionID", nullable = false)
    private QualityInspection inspection;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ParameterID", nullable = false)
    private QualityParameter parameter;

    @Column(name = "ActualValue", length = 100)
    private String actualValue;

    @Column(name = "InspectionResult", length = 20)
    private String result; // Passed, Failed

    @Column(name = "Comments", length = 500)
    private String comments;
}
