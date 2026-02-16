package com.rasras.erp.approval;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApprovalActionRepository extends JpaRepository<ApprovalAction, Integer> {
    List<ApprovalAction> findByRequestIdOrderByActionDateDesc(Integer requestId);

    /** آخر الإجراءات للتقارير والتدقيق (سجل الاعتمادات) */
    List<ApprovalAction> findAllByOrderByActionDateDesc(Pageable pageable);
}
