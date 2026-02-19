package com.rasras.erp.system;

import com.rasras.erp.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SystemSettingService {

    private final SystemSettingRepository systemSettingRepository;

    public List<SystemSettingDto> getAllSettings() {
        return systemSettingRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<SystemSettingDto> getSettingsByCategory(String category) {
        return systemSettingRepository.findByCategory(category).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public SystemSettingDto getSettingByKey(String key) {
        return systemSettingRepository.findBySettingKey(key)
                .map(this::mapToDto)
                .orElseThrow(() -> new ResourceNotFoundException("Setting", "key", key));
    }

    @Transactional
    public SystemSettingDto updateSetting(String key, String value) {
        SystemSetting setting = systemSettingRepository.findBySettingKey(key)
                .orElseThrow(() -> new ResourceNotFoundException("Setting", "key", key));
        setting.setSettingValue(value);
        return mapToDto(systemSettingRepository.save(setting));
    }

    /** Keys that any authenticated user can read (e.g. for comparison page, currency display). DB uses DEFAULT_CURRENCY. */
    private static final Set<String> PUBLIC_SETTING_KEYS = Set.of("RequireThreeQuotations", "DefaultCurrency", "DEFAULT_CURRENCY");

    /**
     * Returns only settings that are safe to expose to any authenticated user (e.g. buyers for comparison page).
     */
    public List<SystemSettingDto> getPublicSettings() {
        ensureRequireThreeQuotationsExists();
        return systemSettingRepository.findAll().stream()
                .filter(s -> PUBLIC_SETTING_KEYS.contains(s.getSettingKey()))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void ensureRequireThreeQuotationsExists() {
        if (systemSettingRepository.findBySettingKey("RequireThreeQuotations").isEmpty()) {
            systemSettingRepository.save(SystemSetting.builder()
                    .settingKey("RequireThreeQuotations")
                    .settingValue("true")
                    .description("Require at least 3 supplier quotations for comparison")
                    .category("Procurement")
                    .dataType("Boolean")
                    .build());
        }
    }

    @Transactional
    public void initDefaultSettings() {
        if (systemSettingRepository.count() == 0) {
            createSettingIfNotExists("DEFAULT_CURRENCY", "EGP", "Default Currency", "Financial", "String");
            createSettingIfNotExists("TAX_RATE", "14", "VAT Rate %", "Financial", "Number");
            createSettingIfNotExists("ALLOW_NEGATIVE_STOCK", "false", "Allow negative stock", "Inventory", "Boolean");
            createSettingIfNotExists("COMPANY_EMAIL_NOTIFICATIONS", "true", "Enable email notifications", "General",
                    "Boolean");
            createSettingIfNotExists("RequireThreeQuotations", "true", "Require at least 3 supplier quotations for comparison", "Procurement", "Boolean");
        }
        ensureRequireThreeQuotationsExists();
    }

    private void createSettingIfNotExists(String key, String value, String desc, String category, String type) {
        if (systemSettingRepository.findBySettingKey(key).isEmpty()) {
            systemSettingRepository.save(SystemSetting.builder()
                    .settingKey(key)
                    .settingValue(value)
                    .description(desc)
                    .category(category)
                    .dataType(type)
                    .build());
        }
    }

    private SystemSettingDto mapToDto(SystemSetting entity) {
        return SystemSettingDto.builder()
                .id(entity.getId())
                .settingKey(entity.getSettingKey())
                .settingValue(entity.getSettingValue())
                .description(entity.getDescription())
                .category(entity.getCategory())
                .dataType(entity.getDataType())
                .build();
    }
}
