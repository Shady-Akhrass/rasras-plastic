package com.rasras.erp.bootstrap;

import com.rasras.erp.approval.ApprovalWorkflow;
import com.rasras.erp.approval.ApprovalWorkflowRepository;
import com.rasras.erp.approval.ApprovalWorkflowStep;
import com.rasras.erp.approval.ApprovalWorkflowStepRepository;
import com.rasras.erp.user.Role;
import com.rasras.erp.user.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

// ⚠️ DISABLED: This seeder was creating incorrect "Management Approval" step
// PO_APPROVAL workflow is now properly configured in DataSeeder.java
// @Component
@RequiredArgsConstructor
public class WorkflowDataSeeder implements CommandLineRunner {

    private final ApprovalWorkflowRepository workflowRepo;
    private final ApprovalWorkflowStepRepository stepRepo;
    private final RoleRepository roleRepo;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // DISABLED - seedPOApprovalWorkflow();
        System.out.println("WorkflowDataSeeder is disabled. PO_APPROVAL workflow configured in DataSeeder.java");
    }

    private void seedPOApprovalWorkflow() {
        ApprovalWorkflow workflow = workflowRepo.findByWorkflowCode("PO_APPROVAL")
                .orElseGet(() -> {
                    System.out.println("Seeding PO_APPROVAL workflow...");
                    ApprovalWorkflow newWorkflow = ApprovalWorkflow.builder()
                            .workflowCode("PO_APPROVAL")
                            .workflowName("Purchase Order Approval")
                            .documentType("PurchaseOrder")
                            .isActive(true)
                            .build();
                    return workflowRepo.save(newWorkflow);
                });

        if (stepRepo.findByWorkflowWorkflowIdOrderByStepNumberAsc(workflow.getWorkflowId()).isEmpty()) {
            System.out.println("Seeding PO_APPROVAL steps...");

            // Try ID 1 (Admin) or fallback to ID 2 (Manager) or just first available role
            Role approverRole = roleRepo.findById(1)
                    .orElse(roleRepo.findById(2)
                            .orElse(roleRepo.findAll().stream().findFirst().orElse(null)));

            if (approverRole != null) {
                ApprovalWorkflowStep step = ApprovalWorkflowStep.builder()
                        .workflow(workflow)
                        .stepNumber(1)
                        .stepName("Management Approval")
                        .approverType("ROLE")
                        .approverRole(approverRole)
                        .isRequired(true)
                        .canSkip(false)
                        .isActive(true)
                        .build();
                stepRepo.save(step);
                System.out.println("Seeded PO_APPROVAL step 1.");
            } else {
                System.err.println("Could not seed PO_APPROVAL step: No suitable Role found (ID 1 or 2).");
            }
        }
    }
}
