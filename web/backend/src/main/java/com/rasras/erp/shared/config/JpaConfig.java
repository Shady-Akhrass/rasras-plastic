package com.rasras.erp.shared.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.util.Optional;

@Configuration
public class JpaConfig {

    @Bean
    public AuditorAware<Integer> auditorProvider() {
        // For now, return a default system user ID (1)
        // In a real app, this would get the ID from SecurityContextHolder
        return () -> Optional.of(1);
    }
}
