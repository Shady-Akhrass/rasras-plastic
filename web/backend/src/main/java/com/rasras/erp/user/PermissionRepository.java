package com.rasras.erp.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Integer> {

    List<Permission> findByModuleName(String moduleName);

    List<Permission> findByIsActiveTrue();

    Optional<Permission> findByPermissionCode(String permissionCode);

    /** للبحث عن صلاحيات عناصر القائمة (MENU_MAIN_*, MENU_PROCUREMENT_*, ...) */
    List<Permission> findByPermissionCodeStartingWith(String prefix);
}
