package com.rasras.erp.shared.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Slf4j
public class GlobalRequestLoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        log.info("Request: {} {}, Auth Header Present: {}, Remote IP: {}",
                request.getMethod(),
                request.getRequestURI(),
                authHeader != null && !authHeader.isEmpty(),
                request.getRemoteAddr());

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            log.debug("Auth Header: Bearer {}...", authHeader.substring(7, Math.min(authHeader.length(), 15)));
        }

        filterChain.doFilter(request, response);
    }
}
