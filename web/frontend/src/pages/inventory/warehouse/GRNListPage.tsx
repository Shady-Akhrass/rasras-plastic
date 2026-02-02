import { Navigate } from 'react-router-dom';

/**
 * تم دمج هذه الصفحة مع صفحة GRN الموحدة في قسم المشتريات
 * يتم إعادة التوجيه تلقائياً إلى /dashboard/procurement/grn
 */
const GRNListPage: React.FC = () => {
    return <Navigate to="/dashboard/procurement/grn" replace />;
};

export default GRNListPage;
