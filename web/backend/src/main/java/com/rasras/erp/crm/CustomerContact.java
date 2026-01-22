package com.rasras.erp.crm;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "customercontacts")
public class CustomerContact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ContactID")
    private Integer id;

    @Column(name = "CustomerID", nullable = false)
    private Integer customerId;

    @Column(name = "ContactName", nullable = false)
    private String contactName;

    @Column(name = "JobTitle")
    private String jobTitle;

    @Column(name = "Phone")
    private String phone;

    @Column(name = "Mobile")
    private String mobile;

    @Column(name = "Email")
    private String email;

    @Column(name = "IsPrimary")
    private Boolean isPrimary;

    @Column(name = "IsActive")
    private Boolean isActive;
}
