import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * يمرّر الصفحة لأعلى عند كل تغيير في المسار (pathname).
 * يُستخدم لضمان أن المستخدم يرى أول الصفحة عند الانتقال من السايد بار أو أي رابط.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
