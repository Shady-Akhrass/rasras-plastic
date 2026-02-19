package com.rasras.erp.approval;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ApprovalRequestRepository extends JpaRepository<ApprovalRequest, Integer> {
    List<ApprovalRequest> findByDocumentTypeAndDocumentId(String documentType, Integer documentId);

    Optional<ApprovalRequest> findByDocumentTypeAndDocumentIdAndStatus(String documentType, Integer documentId,
            String status);

    List<ApprovalRequest> findByStatus(String status);

    List<ApprovalRequest> findByStatusIn(List<String> statuses);

    /** جلب الطلبات المعلقة مع الخطوة الحالية ودور المعتمد لضمان الفلترة حسب الدور دون Lazy load */
    @Query("SELECT DISTINCT r FROM ApprovalRequest r LEFT JOIN FETCH r.currentStep s LEFT JOIN FETCH s.approverRole WHERE r.status IN :statuses")
    List<ApprovalRequest> findByStatusInWithCurrentStepAndApproverRole(@Param("statuses") List<String> statuses);
}
