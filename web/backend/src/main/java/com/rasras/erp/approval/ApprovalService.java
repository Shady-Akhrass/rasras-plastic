package com.rasras.erp.approval;

import com.rasras.erp.user.User;
import com.rasras.erp.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApprovalService {

    private final ApprovalWorkflowRepository workflowRepo;
    private final ApprovalWorkflowStepRepository stepRepo;
    private final ApprovalRequestRepository requestRepo;
    private final ApprovalActionRepository actionRepo;
    private final ApprovalLimitRepository limitRepo;
    private final UserRepository userRepo;

    @Transactional
    public ApprovalRequest initiateApproval(String workflowCode, String docType, Integer docId,
            String docNumber, Integer requestedByUserId, BigDecimal amount) {

        ApprovalWorkflow workflow = workflowRepo.findByWorkflowCode(workflowCode)
                .orElseThrow(() -> new RuntimeException("Workflow not found: " + workflowCode));

        User requester = userRepo.findById(requestedByUserId)
                .orElseThrow(() -> new RuntimeException("User not found: " + requestedByUserId));

        List<ApprovalWorkflowStep> steps = stepRepo
                .findByWorkflowWorkflowIdOrderByStepNumberAsc(workflow.getWorkflowId());
        if (steps.isEmpty()) {
            throw new RuntimeException("No steps defined for workflow: " + workflowCode);
        }

        ApprovalRequest request = ApprovalRequest.builder()
                .workflow(workflow)
                .documentType(docType)
                .documentId(docId)
                .documentNumber(docNumber)
                .requestedByUser(requester)
                .totalAmount(amount)
                .status("Pending")
                .currentStep(steps.get(0)) // Start at first step
                .build();

        return requestRepo.save(request);
    }

    @Transactional(readOnly = true)
    public List<ApprovalRequest> getPendingRequestsForUser(Integer userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return requestRepo.findByStatus("Pending").stream()
                .filter(req -> {
                    ApprovalWorkflowStep step = req.getCurrentStep();
                    if (step == null)
                        return false;
                    if ("ROLE".equals(step.getApproverType())) {
                        return user.getRole().getRoleId().equals(step.getApproverRole().getRoleId());
                    } else {
                        return user.getUserId().equals(step.getApproverUser().getUserId());
                    }
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void processAction(Integer requestId, Integer actionByUserId, String actionType, String comments) {
        ApprovalRequest request = requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        User actor = userRepo.findById(actionByUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 1. Log the action
        ApprovalAction action = ApprovalAction.builder()
                .request(request)
                .step(request.getCurrentStep())
                .actionByUser(actor)
                .actionType(actionType)
                .comments(comments)
                .build();
        actionRepo.save(action);

        // 2. Update request state
        if ("Approved".equalsIgnoreCase(actionType)) {
            moveToNextStep(request);
        } else if ("Rejected".equalsIgnoreCase(actionType)) {
            request.setStatus("Rejected");
            request.setCompletedDate(LocalDateTime.now());
        }

        requestRepo.save(request);
    }

    private void moveToNextStep(ApprovalRequest request) {
        List<ApprovalWorkflowStep> steps = stepRepo
                .findByWorkflowWorkflowIdOrderByStepNumberAsc(request.getWorkflow().getWorkflowId());

        int currentIdx = -1;
        for (int i = 0; i < steps.size(); i++) {
            if (steps.get(i).getStepId().equals(request.getCurrentStep().getStepId())) {
                currentIdx = i;
                break;
            }
        }

        if (currentIdx != -1 && currentIdx < steps.size() - 1) {
            // Move to next step
            request.setCurrentStep(steps.get(currentIdx + 1));
            request.setStatus("InProgress");
        } else {
            // No more steps, fully approved
            request.setStatus("Approved");
            request.setCompletedDate(LocalDateTime.now());
        }
    }
}
