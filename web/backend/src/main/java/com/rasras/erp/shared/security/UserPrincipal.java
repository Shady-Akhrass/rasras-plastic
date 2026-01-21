package com.rasras.erp.shared.security;

import com.rasras.erp.user.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@AllArgsConstructor
public class UserPrincipal implements UserDetails {

    private Integer id;
    private String username;
    private String password;
    private Integer employeeId;
    private boolean enabled;
    private boolean locked;
    private Collection<? extends GrantedAuthority> authorities;

    public static UserPrincipal create(User user) {
        List<GrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + user.getRole().getRoleCode()));

        // Add permissions as authorities
        if (user.getRole().getRolePermissions() != null) {
            List<GrantedAuthority> permissionAuthorities = user.getRole().getRolePermissions().stream()
                    .filter(rp -> rp.getIsAllowed())
                    .map(rp -> new SimpleGrantedAuthority(rp.getPermission().getPermissionCode()))
                    .collect(Collectors.toList());
            authorities = new java.util.ArrayList<>(authorities);
            authorities.addAll(permissionAuthorities);
        }

        return new UserPrincipal(
                user.getUserId(),
                user.getUsername(),
                user.getPasswordHash(),
                user.getEmployeeId(),
                user.getIsActive(),
                user.getIsLocked(),
                authorities);
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !locked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
