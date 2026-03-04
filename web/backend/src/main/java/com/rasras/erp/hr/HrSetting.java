package com.rasras.erp.hr;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "hr_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HrSetting {

    @Id
    @Column(name = "setting_key", nullable = false, length = 100)
    private String settingKey;

    @Column(name = "setting_value", length = 500)
    private String settingValue;

    @Column(name = "description", length = 255)
    private String description;
}
