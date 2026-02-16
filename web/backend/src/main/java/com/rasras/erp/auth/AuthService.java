package com.rasras.erp.auth;

import com.rasras.erp.auth.dto.ChangePasswordRequest;
import com.rasras.erp.auth.dto.CurrentUserDto;
import com.rasras.erp.auth.dto.LoginRequest;
import com.rasras.erp.auth.dto.LoginResponse;
import com.rasras.erp.auth.dto.RefreshTokenRequest;
import com.rasras.erp.shared.exception.BadRequestException;
import com.rasras.erp.shared.exception.ResourceNotFoundException;
import com.rasras.erp.shared.security.JwtTokenProvider;
import com.rasras.erp.shared.security.UserPrincipal;
import com.rasras.erp.user.User;
import com.rasras.erp.user.UserRepository;
import com.rasras.erp.employee.EmployeeRepository;
import com.rasras.erp.employee.Employee;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.core.GrantedAuthority;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        } catch (BadCredentialsException e) {
            // Check if user exists and increment failed attempts
            userRepository.findByUsername(request.getUsername()).ifPresent(user -> {
                user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
                // Lock account if failed attempts > 5 (simple logic for now)
                if (user.getFailedLoginAttempts() >= 5) {
                    user.setIsLocked(true);
                }
                userRepository.save(user);
            });
            throw new BadCredentialsException("Invalid username or password");
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        // Reset failed attempts and update last login
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userPrincipal.getId()));

        user.setFailedLoginAttempts(0);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        String accessToken = jwtTokenProvider.generateToken(authentication);
        String refreshToken = jwtTokenProvider.generateRefreshToken(userPrincipal);

        String fullNameAr = employeeRepository.findById(user.getEmployeeId())
                .map(e -> e.getFirstNameAr() + " " + e.getLastNameAr())
                .orElse("مستخدم");

        List<String> permissions = userPrincipal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> !a.startsWith("ROLE_"))
                .collect(Collectors.toList());

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(86400000L) // 24 hours
                .userId(userPrincipal.getId())
                .employeeId(user.getEmployeeId())
                .username(userPrincipal.getUsername())
                .roleName(user.getRole().getRoleNameEn())
                .roleCode(user.getRole().getRoleCode())
                .fullNameAr(fullNameAr)
                .permissions(permissions)
                .build();
    }

    public LoginResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        String username = jwtTokenProvider.extractUsername(refreshToken);

        User user = userRepository.findByUsernameWithPermissions(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        UserPrincipal userPrincipal = UserPrincipal.create(user);

        if (!jwtTokenProvider.isTokenValid(refreshToken, userPrincipal)) {
            throw new BadRequestException("Invalid refresh token");
        }

        String newAccessToken = jwtTokenProvider.generateToken(new UsernamePasswordAuthenticationToken(
                userPrincipal, null, userPrincipal.getAuthorities()));

        String fullNameAr = employeeRepository.findById(user.getEmployeeId())
                .map(e -> e.getFirstNameAr() + " " + e.getLastNameAr())
                .orElse("مستخدم");

        List<String> permissions = userPrincipal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> !a.startsWith("ROLE_"))
                .collect(Collectors.toList());

        return LoginResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken) // Return same refresh token or rotate it (policy dependent)
                .tokenType("Bearer")
                .userId(userPrincipal.getId())
                .employeeId(user.getEmployeeId())
                .username(userPrincipal.getUsername())
                .roleName(user.getRole().getRoleNameEn())
                .roleCode(user.getRole().getRoleCode())
                .fullNameAr(fullNameAr)
                .permissions(permissions)
                .build();
    }

    @Transactional(readOnly = true)
    public CurrentUserDto getCurrentUser(String username) {
        User user = userRepository.findByUsernameWithPermissions(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        UserPrincipal userPrincipal = UserPrincipal.create(user);
        String fullNameAr = (user.getEmployeeId() != null)
                ? employeeRepository.findById(user.getEmployeeId())
                        .map(e -> e.getFirstNameAr() + " " + e.getLastNameAr())
                        .orElse("مستخدم")
                : "مستخدم";

        List<String> permissions = userPrincipal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> !a.startsWith("ROLE_"))
                .collect(Collectors.toList());

        var role = user.getRole();
        return CurrentUserDto.builder()
                .userId(user.getUserId())
                .employeeId(user.getEmployeeId())
                .username(user.getUsername())
                .roleCode(role != null ? role.getRoleCode() : null)
                .roleName(role != null ? role.getRoleNameEn() : null)
                .fullNameAr(fullNameAr)
                .permissions(permissions)
                .build();
    }

    @Transactional
    public void changePassword(Integer userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
