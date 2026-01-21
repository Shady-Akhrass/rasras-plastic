import { useEffect } from 'react';

const usePageTitle = (title: string) => {
    useEffect(() => {
        const prevTitle = document.title;
        document.title = `${title} | رصرص للبلاستيك`;

        return () => {
            document.title = prevTitle;
        };
    }, [title]);
};

export default usePageTitle;
