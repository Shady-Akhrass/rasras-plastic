package com.rasras.erp.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PathPermissionRepository extends JpaRepository<PathPermission, Integer> {

    List<PathPermission> findAllByOrderByPriorityDesc();

    List<PathPermission> findByPathTypeOrderByPriorityDesc(PathType pathType);
}
