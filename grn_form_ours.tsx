import { Navigate, useParams, useLocation } from 'react-router-dom';

/**
 * تم دمج هذه الصفحة مع صفحة GRN الموحدة في قسم المشتريات
 * يتم إعادة التوجيه تلقائياً إلى /dashboard/procurement/grn
 */
const GRNFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    
    // Preserve query params (like ?poId=123)
    const queryString = location.search;
    
    if (id && id !== 'new') {
        return <Navigate to={`/dashboard/procurement/grn/${id}${queryString}`} replace />;
    }
    
    return <Navigate to={`/dashboard/procurement/grn/new${queryString}`} replace />;
};

export default GRNFormPage;
