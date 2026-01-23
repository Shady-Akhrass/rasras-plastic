import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Package,
    Truck,
    Link2Off,
    ExternalLink,
    RefreshCw,
    Plus,
    AlertCircle,
    ArrowLeft
} from 'lucide-react';
import { supplierService, type SupplierItemDto } from '../../services/supplierService';
import toast from 'react-hot-toast';

const SupplierItemsPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<SupplierItemDto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await supplierService.getAllSupplierItems();
            setItems(response.data || []);
        } catch (error) {
            console.error('Failed to fetch supplier items:', error);
            toast.error('فشل تحميل بيانات الأصناف');
        } finally {
            setLoading(false);
        }
    };

    const handleUnlink = async (id: number) => {
        if (!window.confirm('هل أنت متأكد من فك ارتباط هذا المورد بهذا الصنف؟')) return;

        try {
            await supplierService.unlinkItem(id);
            toast.success('تم فك الارتباط بنجاح');
            fetchData();
        } catch (error) {
            console.error('Failed to unlink item:', error);
            toast.error('فشل فك الارتباط');
        }
    };

    const filteredItems = useMemo(() => {
        return items.filter(item =>
            item.itemNameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.itemCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.supplierItemCode?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [items, searchTerm]);

    return (
        <div className="space-y-6">
            <style>{`
                @keyframes slideIn {
                    from { transform: translateY(10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-in {
                    animation: slideIn 0.4s ease-out forwards;
                }
            `}</style>

            {/* Header */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-brand-primary/10 hover:text-brand-primary transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">سجل أصناف الموردين</h1>
                        <p className="text-slate-500 text-sm">إدارة وربط الأصناف بالموردين المعتمدين</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/dashboard/procurement/suppliers/items/new')}
                        className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        <span>ربط صنف جديد</span>
                    </button>
                    <button onClick={fetchData} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-brand-primary/10 hover:text-brand-primary transition-all border border-slate-200">
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Search & Stats */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors 
                        ${isSearchFocused ? 'text-brand-primary' : 'text-slate-400'}`} />
                    <input
                        type="text"
                        placeholder="بحث باسم الصنف، الكود، أو كود المورد الصنف..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        className={`w-full pr-12 pl-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none bg-white shadow-sm
                            ${isSearchFocused ? 'border-brand-primary shadow-lg ring-4 ring-brand-primary/5' : 'border-slate-50'}`}
                    />
                </div>
                <div className="flex items-center gap-4 px-6 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-400">إجمالي الارتباطات</span>
                        <span className="text-lg font-bold text-slate-800">{items.length}</span>
                    </div>
                    <div className="w-px h-8 bg-slate-100 mx-2" />
                    <Package className="w-6 h-6 text-brand-primary" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-500 font-bold border-b border-slate-100">
                                <th className="px-6 py-5 text-sm">الصنف</th>
                                <th className="px-6 py-5 text-sm">المورد</th>
                                <th className="px-6 py-5 text-sm text-center">كود الصنف عند المورد</th>
                                <th className="px-6 py-5 text-sm text-center">آخر سعر توريد</th>
                                <th className="px-6 py-5 text-sm text-center">تاريخ السعر</th>
                                <th className="px-6 py-5 text-sm text-center">أقل كمية طلب</th>
                                <th className="px-6 py-5 text-sm text-center">مدة التوريد (يوم)</th>
                                <th className="px-6 py-5 text-sm text-center">أفضلية</th>
                                <th className="px-6 py-5 text-sm text-center">الحالة</th>
                                <th className="px-6 py-5 text-sm">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50/50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={7} className="px-6 py-8"><div className="h-6 bg-slate-50 rounded-lg w-full"></div></td>
                                    </tr>
                                ))
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                                <AlertCircle className="w-10 h-10" />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-lg font-bold text-slate-800">لم يتم العثور على نتائج</h3>
                                                <p className="text-slate-500 text-sm">جرب كلمات بحث أخرى أو ابدأ بربط صنف جديد بالموردين</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item, idx) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors animate-slide-in" style={{ animationDelay: `${idx * 40}ms` }}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary">
                                                    <Package className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800">{item.itemNameAr}</div>
                                                    <div className="text-xs text-slate-400 font-mono italic">#{item.itemCode}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-medium whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Truck className="w-4 h-4 text-slate-300" />
                                                <span>{item.supplierId} - (مورد)</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-mono text-slate-600">
                                                {item.supplierItemCode || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-brand-primary">
                                            {item.lastPrice ? `${item.lastPrice.toLocaleString()} EGP` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center text-slate-500 text-xs">
                                            {item.lastPriceDate || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center text-slate-600">
                                            {item.minOrderQty?.toLocaleString() || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center gap-1 text-slate-500 font-medium">
                                                {item.leadTimeDays || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {item.isPreferred ? (
                                                <span className="inline-flex px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-bold">
                                                    مفضل
                                                </span>
                                            ) : (
                                                <span className="text-slate-300 text-[10px]">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${item.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                {item.isActive ? 'نشط' : 'معطل'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => navigate(`/dashboard/procurement/suppliers/${item.supplierId}`)}
                                                    className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/5 rounded-xl transition-all"
                                                    title="عرض المورد"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleUnlink(item.id!)}
                                                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                    title="فك الارتباط"
                                                >
                                                    <Link2Off className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SupplierItemsPage;
