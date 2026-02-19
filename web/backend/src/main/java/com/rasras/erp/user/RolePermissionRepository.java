package com.rasras.erp.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, Integer> {
    List<RolePermission> findByRoleRoleId(Integer roleId);

    /** حذف جميع صلاحيات الدور دفعة واحدة في DB لتجنب خرق UNIQUE (RoleID, PermissionID) عند إعادة التعيين */
    @Modifying
    @Query("DELETE FROM RolePermission rp WHERE rp.role.roleId = :roleId")
    int deleteByRoleRoleId(@Param("roleId") Integer roleId);
}
