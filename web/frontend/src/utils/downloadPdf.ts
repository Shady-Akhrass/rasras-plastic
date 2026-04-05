import toast from 'react-hot-toast';

type DownloadPdfOptions = {
    fileName: string;
    loadingMessage?: string;
    successMessage?: string;
    errorMessage?: string;
};

export async function downloadPdfFile(
    fetchBlob: () => Promise<Blob>,
    options: DownloadPdfOptions
): Promise<void> {
    const {
        fileName,
        loadingMessage = 'جاري تجهيز ملف PDF...',
        successMessage = 'تم تحميل التقرير بنجاح',
        errorMessage = 'فشل تحميل ملف PDF'
    } = options;

    const toastId = toast.loading(loadingMessage);

    try {
        const blob = await fetchBlob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success(successMessage, { id: toastId });
    } catch (error) {
        console.error('Failed to download PDF:', error);
        toast.error(errorMessage, { id: toastId });
        throw error;
    }
}

type OpenPdfOptions = {
    endpoint: string;
    loadingMessage?: string;
    successMessage?: string;
};

/**
 * Open PDF in a new tab/window to avoid IDM/XHR interception issues.
 * Uses token query param (backend already supports this for PDF endpoints).
 */
export function openPdfDownload(options: OpenPdfOptions): void {
    const {
        endpoint,
        loadingMessage = 'جاري تجهيز ملف PDF...',
        successMessage = 'تم فتح ملف PDF'
    } = options;

    const toastId = toast.loading(loadingMessage);
    const token = localStorage.getItem('accessToken');
    const baseUrl = `${import.meta.env.VITE_API_URL}/api`;
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${baseUrl}${endpoint}${separator}token=${encodeURIComponent(token || '')}`;

    window.open(url, '_blank');
    toast.success(successMessage, { id: toastId });
}
