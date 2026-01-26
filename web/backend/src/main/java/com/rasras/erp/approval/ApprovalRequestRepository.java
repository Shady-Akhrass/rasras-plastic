package com.rasras.erp.approval;

import org.springframework.data.jpa.repository.JpaRepository;
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
}
