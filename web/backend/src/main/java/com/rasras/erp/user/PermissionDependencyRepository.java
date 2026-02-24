package com.rasras.erp.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PermissionDependencyRepository extends JpaRepository<PermissionDependency, Integer> {

    List<PermissionDependency> findByPermissionPermissionId(Integer permissionId);

    /** Load all dependencies to compute transitive closure in memory. */
    List<PermissionDependency> findAll();
}
