import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, AlertCircle, ChevronRight, Download, Search, Package } from 'lucide-react';
import { itemService } from '../../../services/itemService';
import warehouseService, { type WarehouseDto } from '../../../services/warehouseService';
import { stockMovementService, type StockMovementItemDto } from '../../../services/stockMovementService';

// تحويل نوع الحركة (type) إلى تسمية عربية واضحة
const getMovementTypeLabel = (type: string | undefined): string => {
    if (!type) return '-';
    const typeMap: Record<string, string> = {
        'GRN': 'دخول مخزن',
        'RETURN': 'مرتجع شراء',
        'ADJUSTMENT': 'تعديل جرد',
        'TRANSFER_IN': 'نقل (دخول)',
        'TRANSFER_OUT': 'نقل (خروج)',
        'ISSUE': 'صرف',
    };
    return typeMap[type] || type;
};

const ItemMovementReportPage: React.FC = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState<{ id?: number; itemCode: string; itemNameAr: string }[]>([]);
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMovements, setLoadingMovements] = useState(false);
    const [movements, setMovements] = useState<StockMovementItemDto[]>([]);
    const [movementsError, setMovementsError] = useState<string | null>(null);

    const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
    const [warehouseId, setWarehouseId] = useState<number | null>(null);
    const [fromDate, setFromDate] = useState<string>('');
    const [toDate, setToDate] = useState<string>('');

    const [page, setPage] = useState(0);
    const [pageSize] = useState(50);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        fetchItemsAndWarehouses();
    }, []);

    useEffect(() => {
        if (selectedItemId != null) {
            fetchMovements();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedItemId, page, warehouseId, fromDate, toDate]);

    const fetchItemsAndWarehouses = async () => {
        try {
            setLoading(true);
            const [itemsRes, whRes] = await Promise.all([
                itemService.getAllItems(),
                warehouseService.getAll().catch(() => ({ data: [] })),
            ]);
            setItems((itemsRes.data || []).map(i => ({ id: i.id, itemCode: i.itemCode ?? '', itemNameAr: i.itemNameAr })));
            setWarehouses((whRes as any)?.data ?? []);
        } catch {
            setItems([]);
            setWarehouses([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchMovements = async () => {
        if (!selectedItemId) return;
        setMovementsError(null);
        setLoadingMovements(true);
        try {
            const pageResult = await stockMovementService.getPaged({
                itemId: selectedItemId,
                warehouseId: warehouseId ?? undefined,
                fromDate: fromDate || undefined,
                toDate: toDate || undefined,
                page,
                size: pageSize,
            });
            setMovements(pageResult.content ?? []);
            setTotalPages(pageResult.totalPages ?? 0);
            setTotalElements(pageResult.totalElements ?? 0);
        } catch {
            setMovements([]);
            setTotalPages(0);
            setTotalElements(0);
            setMovementsError('فشل تحميل حركات الصنف. يرجى المحاولة لاحقاً.');
        } finally {
            setLoadingMovements(false);
        }
    };

    const handleSelectItem = (id: number) => {
        setSelectedItemId(id);
        setPage(0);
    };

    const formatDate = (d: string) => {
        if (!d) return '-';
        try {
            const dt = new Date(d);
            return Number.isNaN(dt.getTime()) ? d : dt.toLocaleDateString('ar-SA', { dateStyle: 'short' });
        } catch {
            return d;
        }
    };

    const handleDownloadExcel = async () => {
        if (!selectedItemId) return;
        try {
            const blob = await stockMovementService.downloadExcel({
                itemId: selectedItemId,
                warehouseId: warehouseId ?? undefined,
                fromDate: fromDate || undefined,
                toDate: toDate || undefined,
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `حركة-صنف-${selectedItemId}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            setMovementsError('فشل تصدير ملف Excel. يرجى المحاولة لاحقاً.');
        }
    };

    const selectedItem = items.find(i => i.id === selectedItemId);

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 rounded-3xl p-8 text-white">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <button onClick={() => navigate('/dashboard/inventory/sections')} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                            <ChevronRight className="w-6 h-6" />
                        </button>
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                            <Activity className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold mb-1">تقرير حركة الصنف التفصيلية</h1>
                            <p className="text-white/80">دخول، خروج، ورصيد صنف معين (يتطلب تفعيل سجل الحركات في النظام)</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleDownloadExcel}
                        disabled={!selectedItemId || totalElements === 0}
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        title="تصدير إلى Excel"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100">
                        <h2 className="font-bold text-slate-900">اختر صنفاً</h2>
                    </div>
                    <div className="p-4 max-h-[400px] overflow-y-auto">
                        {loading ? (
                            <div className="space-y-2">
                                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />)}
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {items.map((i) => (
                                    <button
                                        key={i.id}
                                        onClick={() => i.id && handleSelectItem(i.id)}
                                        className={`w-full text-right p-3 rounded-xl flex items-center gap-3 transition-colors
                                            ${selectedItemId === i.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50 border border-transparent'}`}
                                    >
                                        <Package className="w-4 h-4 text-slate-400" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-mono text-sm text-brand-primary truncate">{i.itemCode}</p>
                                            <p className="text-xs text-slate-500 truncate">{i.itemNameAr}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="font-bold text-slate-900">سجل الحركة</h2>
                            {selectedItem && (
                                <span className="text-sm text-slate-500">
                                    {selectedItem.itemCode} - {selectedItem.itemNameAr}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <select
                                value={warehouseId ?? ''}
                                onChange={(e) => {
                                    const val = e.target.value ? Number(e.target.value) : null;
                                    setWarehouseId(val);
                                    setPage(0);
                                }}
                                className="px-2 py-1 border border-slate-200 rounded-lg text-xs text-slate-700"
                            >
                                <option value="">كل المستودعات</option>
                                {warehouses.map((w) => (
                                    <option key={w.id} value={w.id}>{w.warehouseNameAr}</option>
                                ))}
                            </select>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => {
                                    setFromDate(e.target.value);
                                    setPage(0);
                                }}
                                className="px-2 py-1 border border-slate-200 rounded-lg text-xs text-slate-700"
                            />
                            <span className="text-xs text-slate-500">إلى</span>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => {
                                    setToDate(e.target.value);
                                    setPage(0);
                                }}
                                className="px-2 py-1 border border-slate-200 rounded-lg text-xs text-slate-700"
                            />
                        </div>
                    </div>
                    <div className="p-6">
                        {!selectedItemId ? (
                            <div className="text-center py-16 text-slate-500">
                                <Search className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                <p>اختر صنفاً لعرض حركته</p>
                            </div>
                        ) : loadingMovements ? (
                            <div className="space-y-3">
                                {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />)}
                            </div>
                        ) : movementsError ? (
                            <div className="text-center py-16 text-red-600">
                                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
                                <p>{movementsError}</p>
                            </div>
                        ) : movements.length === 0 ? (
                            <div className="text-center py-16 text-slate-500">
                                <Activity className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                <p>لا توجد حركات مسجلة لهذا الصنف</p>
                                <p className="text-sm mt-2">سجّل العمليات (إدخال، إخراج، تحويل) لظهور الحركات هنا</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="py-2 text-right text-xs text-slate-500">التاريخ</th>
                                        <th className="py-2 text-right text-xs text-slate-500">النوع</th>
                                        <th className="py-2 text-right text-xs text-slate-500">الكمية</th>
                                        <th className="py-2 text-right text-xs text-slate-500">الرصيد</th>
                                        <th className="py-2 text-right text-xs text-slate-500">المرجع</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {movements.map((m, i) => (
                                        <tr key={i} className="border-b border-slate-100">
                                            <td className="py-3 text-sm">{formatDate(m.date)}</td>
                                            <td className="py-3 text-sm font-medium text-slate-700">{getMovementTypeLabel(m.type)}</td>
                                            <td className="py-3 text-sm font-medium">{m.qty ?? '-'}</td>
                                            <td className="py-3 text-sm">{m.balance ?? '-'}</td>
                                            <td className="py-3 text-sm text-slate-400">{m.ref || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    {selectedItemId && !loadingMovements && !movementsError && totalPages > 0 && (
                        <div className="px-6 pb-4 flex items-center justify-between text-xs text-slate-500">
                            <span>
                                عرض {movements.length} من {totalElements} حركة
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPage((p) => Math.max(p - 1, 0))}
                                    disabled={page === 0}
                                    className="px-2 py-1 border border-slate-200 rounded disabled:opacity-40"
                                >
                                    السابق
                                </button>
                                <span>
                                    صفحة {page + 1} من {totalPages}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))}
                                    disabled={page + 1 >= totalPages}
                                    className="px-2 py-1 border border-slate-200 rounded disabled:opacity-40"
                                >
                                    التالي
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ItemMovementReportPage;
