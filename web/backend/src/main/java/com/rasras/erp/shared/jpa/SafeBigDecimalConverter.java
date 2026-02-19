package com.rasras.erp.shared.jpa;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * A converter that safely handles non-numeric strings in the database
 * when mapping to a BigDecimal field in the entity.
 */
@Converter
public class SafeBigDecimalConverter implements AttributeConverter<BigDecimal, String> {

    @Override
    public String convertToDatabaseColumn(BigDecimal attribute) {
        return attribute == null ? null : attribute.toPlainString();
    }

    @Override
    public BigDecimal convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return null;
        }

        try {
            // Remove any characters that are not digits, dots, or minus signs
            String cleaned = dbData.replaceAll("[^0-9.\\-]", "");

            if (cleaned.isEmpty() || cleaned.equals(".") || cleaned.equals("-")) {
                return null;
            }

            // Handle multiple dots if any (take only the first one)
            int firstDot = cleaned.indexOf('.');
            if (firstDot != -1) {
                String beforeDot = cleaned.substring(0, firstDot + 1);
                String afterDot = cleaned.substring(firstDot + 1).replace(".", "");
                cleaned = beforeDot + afterDot;
            }

            return new BigDecimal(cleaned).setScale(4, RoundingMode.HALF_UP);
        } catch (NumberFormatException e) {
            // Log warning or just return null to avoid crashing the application
            return null;
        }
    }
}
