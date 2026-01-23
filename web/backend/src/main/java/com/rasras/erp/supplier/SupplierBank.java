package com.rasras.erp.supplier;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "supplier_banks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierBank {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SupplierID", nullable = false)
    private Supplier supplier;

    @Column(name = "BankName", nullable = false, length = 100)
    private String bankName;

    @Column(name = "BankAccountNo", nullable = false, length = 100)
    private String bankAccountNo;

    @Column(name = "IBAN", length = 50)
    private String iban;

    @Column(name = "SWIFT", length = 20)
    private String swift;

    @Column(name = "Currency", length = 10)
    @Builder.Default
    private String currency = "EGP";

    @Column(name = "IsDefault")
    @Builder.Default
    private Boolean isDefault = false;
}
