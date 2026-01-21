package com.rasras.erp.inventory;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "itemcategories")
public class ItemCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CategoryID")
    private Integer id;

    @Column(name = "CategoryCode", nullable = false, unique = true)
    private String categoryCode;

    @Column(name = "CategoryNameAr", nullable = false)
    private String categoryNameAr;

    @Column(name = "CategoryNameEn")
    private String categoryNameEn;

    @Column(name = "ParentCategoryID")
    private Integer parentCategoryId;

    @Column(name = "Description")
    private String description;

    @Column(name = "IsActive")
    private Boolean isActive;

    @Column(name = "CreatedAt", updatable = false)
    private LocalDateTime createdAt;
}
