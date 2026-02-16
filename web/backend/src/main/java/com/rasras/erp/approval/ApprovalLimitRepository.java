package com.rasras.erp.approval;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ApprovalLimitRepository extends JpaRepository<ApprovalLimit, Integer> {
    List<ApprovalLimit> findByActivityType(String activityType);
    List<ApprovalLimit> findByActivityTypeAndIsActiveTrue(String activityType);
    List<ApprovalLimit> findByRole_RoleId(Integer roleId);
    boolean existsByRole_RoleId(Integer roleId);
    boolean existsByRequiresReviewBy_RoleId(Integer roleId);
}
