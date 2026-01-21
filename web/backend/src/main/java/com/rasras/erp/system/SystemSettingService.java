package com.rasras.erp.system;

import com.rasras.erp.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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

    @Transactional
    public void initDefaultSettings() {
        if (systemSettingRepository.count() == 0) {
            createSettingIfNotExists("DEFAULT_CURRENCY", "EGP", "Default Currency", "Financial", "String");
            createSettingIfNotExists("TAX_RATE", "14", "VAT Rate %", "Financial", "Number");
            createSettingIfNotExists("ALLOW_NEGATIVE_STOCK", "false", "Allow negative stock", "Inventory", "Boolean");
            createSettingIfNotExists("COMPANY_EMAIL_NOTIFICATIONS", "true", "Enable email notifications", "General",
                    "Boolean");
        }
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
