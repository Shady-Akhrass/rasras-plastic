package com.rasras.erp.approval;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ApprovalWorkflowStepRepository extends JpaRepository<ApprovalWorkflowStep, Integer> {
    List<ApprovalWorkflowStep> findByWorkflowWorkflowIdOrderByStepNumberAsc(Integer workflowId);
    boolean existsByApproverRole_RoleId(Integer roleId);
}
