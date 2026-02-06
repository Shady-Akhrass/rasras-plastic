package com.rasras.erp.user;

import com.rasras.erp.employee.EmployeeRepository;
import com.rasras.erp.shared.exception.BadRequestException;
import com.rasras.erp.shared.exception.ResourceNotFoundException;
import com.rasras.erp.user.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Page<UserDto> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return toDto(user);
    }

    @Transactional
    public UserDto createUser(CreateUserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already exists: " + request.getUsername());
        }

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", request.getRoleId()));

        User user = User.builder()
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .employeeId(request.getEmployeeId())
                .role(role)
                .isActive(true)
                .isLocked(false)
                .failedLoginAttempts(0)
                .build();

        user = userRepository.save(user);
        return toDto(user);
    }

    @Transactional
    public UserDto updateUser(Integer id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        if (request.getRoleId() != null) {
            Role role = roleRepository.findById(request.getRoleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Role", "id", request.getRoleId()));
            user.setRole(role);
        }

        if (request.getIsActive() != null) {
            user.setIsActive(request.getIsActive());
        }

        if (request.getIsLocked() != null) {
            user.setIsLocked(request.getIsLocked());
        }

        user = userRepository.save(user);
        return toDto(user);
    }

    @Transactional
    public void deleteUser(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        userRepository.delete(user);
    }

    @Transactional
    public void resetPassword(Integer id, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    // Roles
    @Transactional(readOnly = true)
    public List<RoleDto> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(this::toRoleDto)
                .collect(Collectors.toList());
    }

    private UserDto toDto(User user) {
        String displayNameAr = user.getEmployeeId() != null
                ? employeeRepository.findById(user.getEmployeeId())
                        .map(e -> (e.getFirstNameAr() != null ? e.getFirstNameAr() : "") + " " + (e.getLastNameAr() != null ? e.getLastNameAr() : "")).map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .orElse(user.getUsername())
                : user.getUsername();
        return UserDto.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .employeeId(user.getEmployeeId())
                .roleId(user.getRole().getRoleId())
                .roleName(user.getRole().getRoleNameEn())
                .roleNameAr(user.getRole().getRoleNameAr())
                .displayNameAr(displayNameAr)
                .isActive(user.getIsActive())
                .isLocked(user.getIsLocked())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }

    private RoleDto toRoleDto(Role role) {
        return RoleDto.builder()
                .roleId(role.getRoleId())
                .roleCode(role.getRoleCode())
                .roleNameAr(role.getRoleNameAr())
                .roleNameEn(role.getRoleNameEn())
                .description(role.getDescription())
                .isActive(role.getIsActive())
                .build();
    }
}
