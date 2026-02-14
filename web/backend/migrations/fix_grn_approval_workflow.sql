
START TRANSACTION;

 SET @grn_workflow_id = (SELECT WorkflowID FROM approvalworkflows WHERE WorkflowCode = 'GRN_APPROVAL' LIMIT 1);

SELECT @grn_workflow_id AS 'GRN Workflow ID';

 UPDATE approvalrequests ar
INNER JOIN approvalworkflows aw ON ar.WorkflowID = aw.WorkflowID
SET ar.CurrentStepID = NULL
WHERE aw.WorkflowCode = 'GRN_APPROVAL';

SELECT '✅ تم تصفير CurrentStepID في approvalrequests' AS 'Status';

 DELETE aa
FROM approvalactions aa
INNER JOIN approvalworkflowsteps aws ON aa.StepID = aws.StepID
WHERE aws.WorkflowID = @grn_workflow_id;

SELECT '✅ تم حذف approvalactions القديمة' AS 'Status';

 DELETE FROM approvalworkflowsteps
WHERE WorkflowID = @grn_workflow_id;

SELECT '✅ تم حذف الخطوات القديمة' AS 'Status';

 INSERT INTO approvalworkflowsteps (WorkflowID, StepNumber, StepName, ApproverRoleID, IsActive)
SELECT 
    @grn_workflow_id,
    1,
    'Quality Controller Approval',
    (SELECT RoleID FROM roles WHERE RoleCode = 'QC' LIMIT 1),
    1;

SELECT '✅ تم إنشاء خطوة Quality Controller فقط' AS 'Status';

 UPDATE approvalrequests ar
INNER JOIN approvalworkflows aw ON ar.WorkflowID = aw.WorkflowID
SET ar.CurrentStepID = (
    SELECT StepID 
    FROM approvalworkflowsteps 
    WHERE WorkflowID = @grn_workflow_id 
      AND StepNumber = 1 
    LIMIT 1
),
ar.Status = 'Pending'
WHERE aw.WorkflowCode = 'GRN_APPROVAL'
  AND ar.Status IN ('Pending', 'InProgress');

SELECT '✅ تم إعادة ضبط الطلبات الحالية' AS 'Status';
 
UPDATE approvalrequests ar
INNER JOIN approvalworkflows aw ON ar.WorkflowID = aw.WorkflowID
SET ar.Status = 'Cancelled',
    ar.CompletedDate = NOW()
WHERE aw.WorkflowCode = 'GRN_APPROVAL'
  AND ar.Status = 'InProgress'
  AND ar.CurrentStepID IS NULL;

SELECT '✅ تم إغلاق الطلبات العالقة (إن وجدت)' AS 'Status';

 SELECT 
    aw.WorkflowCode,
    aw.WorkflowName,
    aws.StepNumber,
    aws.StepName,
    r.RoleCode,
    r.RoleNameAr
FROM approvalworkflows aw
LEFT JOIN approvalworkflowsteps aws ON aw.WorkflowID = aws.WorkflowID
LEFT JOIN roles r ON aws.ApproverRoleID = r.RoleID
WHERE aw.WorkflowCode = 'GRN_APPROVAL'
ORDER BY aws.StepNumber;

COMMIT;

 