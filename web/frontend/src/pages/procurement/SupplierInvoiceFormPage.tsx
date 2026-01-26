import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    Save,
    ArrowRight,
    Truck,
    Package,
    Calendar,
    DollarSign,
    Plus,
    Trash2,
    FileText,
    Hash,
    Info,
    AlertCircle
} from 'lucide-react';
import { supplierInvoiceService, type SupplierInvoiceDto, type SupplierInvoiceItemDto } from '../../services/supplierInvoiceService';
import { supplierService, type SupplierDto } from '../../services/supplierService';
import { grnService } from '../../services/grnService';
import { itemService, type ItemDto } from '../../services/itemService';
import { unitService, type UnitDto } from '../../services/unitService';
import purchaseService from '../../services/purchaseService';
import toast from 'react-hot-toast';

const SupplierInvoiceFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const isEdit = !!id;
    const queryParams = new URLSearchParams(location.search);
    const quotationId = queryParams.get('quotationId');
    const grnId = queryParams.get('grnId');

    // Data State
    const [suppliers, setSuppliers] = useState<SupplierDto[]>([]);
    const [items, setItems] = useState<ItemDto[]>([]);
    const [units, setUnits] = useState<UnitDto[]>([]);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState<SupplierInvoiceDto>({
        invoiceNumber: '',
        supplierInvoiceNo: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        supplierId: 0,
        currency: 'EGP',
        exchangeRate: 1,
        subTotal: 0,
        discountAmount: 0,
        taxAmount: 0,
        totalAmount: 0,
        status: 'Unpaid',
        items: []
    });

    useEffect(() => {
        loadSuppliers();
        loadItems();
        loadUnits();
        if (isEdit) {
            loadInvoice();
        } else if (grnId) {
            loadGRNData(parseInt(grnId));
        } else if (quotationId) {
            loadQuotationData(parseInt(quotationId));
        }
    }, [id, quotationId, grnId]);

    const loadGRNData = async (gId: number) => {
        try {
            const grn = await grnService.getGRNById(gId);
            if (grn) {
                setFormData(prev => ({
                    ...prev,
                    grnId: gId,
                    supplierId: grn.supplierId,
                    notes: `تم الإنشاء من إذن استلام بضائع رقم: ${grn.grnNumber}`,
                    items: grn.items.map(gItem => {
                        const price = gItem.unitCost || 0;
                        const qty = gItem.acceptedQty || gItem.receivedQty;
                        return {
                            itemId: gItem.itemId,
                            unitId: gItem.unitId,
                            quantity: qty,
                            unitPrice: price,
                            discountPercentage: 0,
                            discountAmount: 0,
                            taxPercentage: 14, // Default VAT
                            taxAmount: (qty * price) * 0.14,
                            totalPrice: (qty * price) * 1.14,
                            grnItemId: gItem.id
                        };
                    })
                }));
                toast.success('تم تحميل بيانات الاستلام بنجاح');
            }
        } catch (error) {
            console.error('Failed to load GRN data:', error);
            toast.error('فشل تحميل بيانات الاستلام');
        }
    };

    const loadQuotationData = async (qId: number) => {
        try {
            const quotation = await purchaseService.getQuotationById(qId);
            if (quotation) {
                setFormData(prev => ({
                    ...prev,
                    supplierId: quotation.supplierId,
                    currency: quotation.currency || 'EGP',
                    exchangeRate: quotation.exchangeRate || 1,
                    subTotal: quotation.totalAmount,
                    totalAmount: quotation.totalAmount,
                    notes: `تم الإنشاء من عرض سعر رقم: ${quotation.quotationNumber}. ${quotation.notes || ''}`,
                    items: quotation.items.map(qItem => ({
                        itemId: qItem.itemId,
                        unitId: qItem.unitId,
                        quantity: qItem.offeredQty,
                        unitPrice: qItem.unitPrice,
                        discountPercentage: qItem.discountPercentage || 0,
                        discountAmount: qItem.discountAmount || 0,
                        taxPercentage: qItem.taxPercentage || 0,
                        taxAmount: qItem.taxAmount || 0,
                        totalPrice: qItem.totalPrice
                    }))
                }));
                toast.success('تم تحميل بيانات عرض السعر بنجاح');
            }
        } catch (error) {
            console.error('Failed to load quotation data:', error);
            toast.error('فشل تحميل بيانات عرض السعر');
        }
    };

    const loadSuppliers = async () => {
        try {
            const data = await supplierService.getAllSuppliers();
            setSuppliers(data.data || []);
        } catch (error) { console.error(error); }
    };

    const loadItems = async () => {
        try {
            const data = await itemService.getActiveItems();
            setItems(data.data || []);
        } catch (error) { console.error(error); }
    };

    const loadUnits = async () => {
        try {
            const data = await unitService.getAllUnits();
            setUnits(data.data || []);
        } catch (error) { console.error(error); }
    };

    const loadInvoice = async () => {
        // Mocked or from API if implemented
    };

    useEffect(() => {
        calculateTotals();
    }, [formData.items, formData.discountAmount, formData.taxAmount]);

    const calculateTotals = () => {
        const subTotal = formData.items?.reduce((acc, item) => acc + (item.totalPrice || 0), 0) || 0;
        const totalAmount = subTotal - (formData.discountAmount || 0) + (formData.taxAmount || 0);
        setFormData(prev => ({ ...prev, subTotal, totalAmount }));
    };

    const addItem = () => {
        const newItem: SupplierInvoiceItemDto = {
            itemId: 0,
            unitId: 0,
            quantity: 1,
            unitPrice: 0,
            discountPercentage: 0,
            discountAmount: 0,
            taxPercentage: 0,
            taxAmount: 0,
            totalPrice: 0
        };
        setFormData(prev => ({ ...prev, items: [...(prev.items || []), newItem] }));
    };

    const removeItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items?.filter((_, i) => i !== index)
        }));
    };

    const updateItem = (index: number, updates: Partial<SupplierInvoiceItemDto>) => {
        setFormData(prev => {
            const newItems = [...(prev.items || [])];
            const item = { ...newItems[index], ...updates };

            // Recalculate item total
            const base = item.quantity * item.unitPrice;
            item.discountAmount = base * ((item.discountPercentage || 0) / 100);
            item.taxAmount = (base - item.discountAmount) * ((item.taxPercentage || 0) / 100);
            item.totalPrice = base - item.discountAmount + item.taxAmount;

            newItems[index] = item;
            return { ...prev, items: newItems };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.supplierId || formData.items?.length === 0) {
            toast.error('يرجى اختيار المورد وإضافة صنف واحد على الأقل');
            return;
        }
        if (!formData.supplierInvoiceNo) {
            toast.error('يرجى إدخال رقم فاتورة المورد (الورقي)');
            return;
        }

        try {
            setSaving(true);
            await supplierInvoiceService.createInvoice(formData);
            toast.success('تم حفظ الفاتورة بنجاح');
            navigate('/dashboard/procurement/invoices');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'فشل حفظ الفاتورة');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-3 bg-white text-slate-400 rounded-2xl border border-slate-100 shadow-sm hover:text-brand-primary">
                        <ArrowRight className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{isEdit ? 'تعديل فاتورة' : 'تسجيل فاتورة مورد'}</h1>
                        <p className="text-slate-500 text-sm">تسجيل المطالبة المالية بناءً على المستندات الورقية من المورد</p>
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 bg-brand-primary text-white rounded-2xl font-bold shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                    {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                    <span>حفظ واعتماد</span>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 font-bold text-slate-800 border-b border-slate-50 pb-4">
                            <Info className="w-5 h-5 text-brand-primary" />
                            <span>بيانات الفاتورة الأساسية</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500">رقم الفاتورة (النظام)</label>
                                <input
                                    type="text"
                                    value={formData.invoiceNumber}
                                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-100 border-2 border-transparent rounded-xl focus:border-brand-primary outline-none transition-all text-slate-500"
                                    placeholder="سيتم إنشاؤه تلقائياً"
                                    disabled
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500">رقم فاتورة المورد (الورقية)</label>
                                <input
                                    type="text"
                                    value={formData.supplierInvoiceNo}
                                    onChange={(e) => setFormData({ ...formData, supplierInvoiceNo: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl focus:border-brand-primary outline-none transition-all font-mono"
                                    placeholder="Supplier Inv #"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 flex items-center gap-2"><Truck className="w-3 h-3" /> المورد</label>
                                <select
                                    value={formData.supplierId}
                                    onChange={(e) => setFormData({ ...formData, supplierId: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl focus:border-brand-primary outline-none transition-all"
                                    required
                                >
                                    <option value="0">اختر المورد...</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.supplierNameAr}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                            <div className="flex items-center gap-2 font-bold text-slate-800">
                                <Package className="w-5 h-5 text-amber-500" />
                                <span>الأصناف والأسعار</span>
                            </div>
                            <button
                                type="button"
                                onClick={addItem}
                                className="flex items-center gap-2 text-xs font-bold text-brand-primary hover:bg-brand-primary/5 px-3 py-1.5 rounded-lg transition-all"
                            >
                                <Plus className="w-4 h-4" /> إضافة صنف
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead>
                                    <tr className="text-slate-400 text-xs font-bold">
                                        <th className="pb-4 pr-2">الصنف</th>
                                        <th className="pb-4 text-center">الكمية</th>
                                        <th className="pb-4 text-center">الوحدة</th>
                                        <th className="pb-4 text-center">سعر الوحدة</th>
                                        <th className="pb-4 text-center">الإجمالي</th>
                                        <th className="pb-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {(formData.items || []).map((item, idx) => (
                                        <tr key={idx} className="group">
                                            <td className="py-4 pr-2 min-w-[200px]">
                                                <select
                                                    value={item.itemId}
                                                    onChange={(e) => updateItem(idx, { itemId: parseInt(e.target.value) })}
                                                    className="w-full bg-slate-50 border-none rounded-lg text-sm p-2 outline-none font-bold"
                                                >
                                                    <option value="0">اختر صنف...</option>
                                                    {items.map(i => <option key={i.id} value={i.id}>{i.itemNameAr}</option>)}
                                                </select>
                                            </td>
                                            <td className="py-4 px-2">
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(idx, { quantity: parseFloat(e.target.value) })}
                                                    className="w-20 bg-slate-50 border-none rounded-lg text-sm p-2 text-center font-bold"
                                                />
                                            </td>
                                            <td className="py-4 px-2">
                                                <select
                                                    value={item.unitId}
                                                    onChange={(e) => updateItem(idx, { unitId: parseInt(e.target.value) })}
                                                    className="w-24 bg-slate-50 border-none rounded-lg text-sm p-2 outline-none"
                                                >
                                                    <option value="0">الوحدة...</option>
                                                    {units.map(u => <option key={u.id} value={u.id}>{u.unitNameAr}</option>)}
                                                </select>
                                            </td>
                                            <td className="py-4 px-2">
                                                <input
                                                    type="number"
                                                    value={item.unitPrice}
                                                    onChange={(e) => updateItem(idx, { unitPrice: parseFloat(e.target.value) })}
                                                    className="w-24 bg-slate-50 border-none rounded-lg text-sm p-2 text-center font-bold text-emerald-600"
                                                />
                                            </td>
                                            <td className="py-4 px-2 text-center font-black text-slate-700">
                                                {(item.totalPrice || 0).toLocaleString()}
                                            </td>
                                            <td className="py-4 text-left">
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(idx)}
                                                    className="p-2 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {(!formData.items || formData.items.length === 0) && (
                                <div className="py-12 text-center text-slate-400 italic text-sm">
                                    لم يتم إضافة أي أصناف بعد
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Financial Summary */}
                    <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl space-y-6">
                        <div className="flex items-center gap-2 font-bold text-lg border-b border-white/10 pb-4 text-brand-secondary">
                            <DollarSign className="w-5 h-5" />
                            الملخص المالي
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="opacity-60 text-slate-400">الإجمالي الفرعي</span>
                                <span className="font-bold">{formData.subTotal.toLocaleString()} {formData.currency}</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold text-rose-300">
                                    <span>الخصم الإجمالي</span>
                                    <input
                                        type="number"
                                        value={formData.discountAmount}
                                        onChange={(e) => setFormData({ ...formData, discountAmount: parseFloat(e.target.value) || 0 })}
                                        className="w-20 bg-white/10 border-none rounded-md px-1 text-left text-white outline-none"
                                    />
                                </div>
                                <div className="flex justify-between text-xs font-bold text-emerald-300">
                                    <span>الضريبة (Value Added)</span>
                                    <input
                                        type="number"
                                        value={formData.taxAmount}
                                        onChange={(e) => setFormData({ ...formData, taxAmount: parseFloat(e.target.value) || 0 })}
                                        className="w-20 bg-white/10 border-none rounded-md px-1 text-left text-white outline-none"
                                    />
                                </div>
                            </div>
                            <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                                <div className="text-xs opacity-50">إجمالي الفاتورة</div>
                                <div className="text-3xl font-black text-brand-secondary">
                                    {formData.totalAmount.toLocaleString()}
                                    <span className="text-xs font-bold mr-1">{formData.currency}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Logistics */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 font-bold text-slate-800 border-b border-slate-50 pb-4 text-sm">
                            <Calendar className="w-4 h-4 text-brand-primary" />
                            التواريخ والمواعيد
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">تاريخ الفاتورة</label>
                                <input
                                    type="date"
                                    value={formData.invoiceDate}
                                    onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 rounded-xl border-none font-bold text-slate-700 outline-none focus:ring-2 ring-brand-primary/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">تاريخ الاستحقاق</label>
                                <input
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 rounded-xl border-none font-bold text-rose-600 outline-none focus:ring-2 ring-rose-500/20"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default SupplierInvoiceFormPage;
