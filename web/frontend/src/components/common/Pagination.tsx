import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export interface PaginationProps {
    currentPage: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    pageSizeOptions?: number[];
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalItems,
    pageSize,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 15, 25, 50]
}) => {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    const getPageNumbers = () => {
        const pages: (number | 'ellipsis')[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('ellipsis');
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i);
            }
            if (currentPage < totalPages - 2) pages.push('ellipsis');
            if (totalPages > 1) pages.push(totalPages);
        }
        return pages;
    };

    if (totalPages <= 1 && !onPageSizeChange) return null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-3 text-sm text-slate-600">
                <span>
                    عرض <span className="font-medium text-slate-800">{startItem}</span> -{' '}
                    <span className="font-medium text-slate-800">{endItem}</span> من{' '}
                    <span className="font-medium text-slate-800">{totalItems}</span>
                </span>
                {onPageSizeChange && (
                    <select
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="pr-2 pl-8 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                    >
                        {pageSizeOptions.map((size) => (
                            <option key={size} value={size}>
                                {size} لكل صفحة
                            </option>
                        ))}
                    </select>
                )}
            </div>
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="الصفحة السابقة"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
                {getPageNumbers().map((page, i) =>
                    page === 'ellipsis' ? (
                        <span key={`e-${i}`} className="px-2 text-slate-400">
                            ...
                        </span>
                    ) : (
                        <button
                            key={page}
                            type="button"
                            onClick={() => onPageChange(page)}
                            className={`min-w-[2.25rem] py-2 px-2 rounded-lg border text-sm font-medium transition-colors ${
                                currentPage === page
                                    ? 'bg-brand-primary text-white border-brand-primary'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            {page}
                        </button>
                    )
                )}
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="الصفحة التالية"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
