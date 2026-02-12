import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Plus, FileText, Truck, Calendar, ArrowLeft, RefreshCw,
    Eye, CheckCircle2, Clock, DollarSign, XCircle,
    Receipt, Package, Hash, Layers,
    ExternalLink, Ban, Wallet, Trash2
} from 'lucide-react';
import { supplierInvoiceService, type SupplierInvoiceDto } from '../../services/supplierInvoiceService';
import { grnService } from '../../services/grnService';
import Pagination from '../../components/common/Pagination';
import ConfirmModal from '../../components/common/ConfirmModal';
import { formatNumber, formatDate } from '../../utils/format';
import toast from 'react-hot-toast';

// --- Calculation Helpers ---

// Calculates the full invoice breakdown
// Matching PurchaseOrderFormPage and SupplierOutstandingPage logic
const calculateInvoiceGrandTotal = (invoice: SupplierInvoiceDto): SupplierInvoiceDto => {
    if (!invoice.items || invoice.items.length === 0) {
        const deliveryCost = invoice.deliveryCost || 0;
        const totalAmount = invoice.totalAmount || deliveryCost;
        return { ...invoice, deliveryCost, totalAmount };
    }

    let subTotal = 0;
    let totalDiscountAmount = 0;
    let totalTaxAmount = 0;

    const updatedItems = invoice.items.map(item => {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.unitPrice) || 0;
        const discountRate = (Number(item.discountPercentage) || 0) / 100;
        const taxRate = (Number(item.taxPercentage) || 0) / 100;

        const grossAmount = qty * price;
        const discountAmount = grossAmount * discountRate;
        const taxableAmount = grossAmount - discountAmount;
        const taxAmount = taxableAmount * taxRate;
        const totalPrice = taxableAmount + taxAmount;

        subTotal += grossAmount;
        totalDiscountAmount += discountAmount;
        totalTaxAmount += taxAmount;

        return {
            ...item,
            discountAmount,
            taxAmount,
            totalPrice
        };
    });

    const otherCosts = Number(invoice.otherCosts) || 0;
    const currentTotal = Number(invoice.totalAmount) || 0;
    const netItems = (subTotal - totalDiscountAmount) + totalTaxAmount;
    const derivedDelivery = Math.max(0, currentTotal - netItems - otherCosts);

    return {
        ...invoice,
        items: updatedItems,
        subTotal,
        discountAmount: totalDiscountAmount,
        taxAmount: totalTaxAmount,
        deliveryCost: derivedDelivery,
        otherCosts,
        totalAmount: currentTotal
    };
};

// --- Reusable Components ---

const StatCard: React.FC<{
    icon: React.ElementType;
    value: number | string;
    label: string;
    color: 'primary' | 'success' | 'warning' | 'purple' | 'blue' | 'rose';
    suffix?: string;
    onClick?: () => void;
    active?: boolean;
}> = ({ icon: Icon, value, label, color, suffix, onClick, active }) => {
    const colorClasses = {
        primary: 'bg-brand-primary/10 text-brand-primary',
        success: 'bg-emerald-100 text-emerald-600',
        warning: 'bg-amber-100 text-amber-600',
        purple: 'bg-purple-100 text-purple-600',
        blue: 'bg-blue-100 text-blue-600',
        rose: 'bg-rose-100 text-rose-600'
    };

    return (
        <button
            onClick={onClick}
            disabled={!onClick}
            className={`w-full p-5 rounded-2xl border transition-all duration-300 group text-right
                ${active
                    ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/30'
                    : 'bg-white border-slate-100 hover:shadow-lg hover:border-brand-primary/20'
                }
                ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
        >
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl transition-all duration-300
                    ${active ? 'bg-white/20' : `${colorClasses[color]} group-hover:scale-110`}`}>
                    <Icon className={`w-5 h-5 ${active ? 'text-white' : ''}`} />
                </div>
                <div className="flex-1">
                    <div className={`text-2xl font-bold ${active ? 'text-white' : 'text-slate-800'}`}>
                        {typeof value === 'number' ? formatNumber(value) : value}
                        {suffix && (
                            <span className="text-sm font-medium mr-1 opacity-70">
                                {suffix}
                            </span>
                        )}
                    </div>
                    <div className={`text-sm ${active ? 'text-white/80' : 'text-slate-500'}`}>
                        {label}
                    </div>
                </div>
            </div>
        </button>
    );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const config: Record<string, {
        label: string;
        bg: string;
        text: string;
        border: string;
        icon: React.ElementType;
    }> = {
        'Pending': {
            label: 'قيد المراجعة',
            bg: 'bg-amber-50',
            text: 'text-amber-700',
            border: 'border-amber-200',
            icon: Clock
        },
        'Approved': {
            label: 'معتمدة',
            bg: 'bg-emerald-50',
            text: 'text-emerald-700',
            border: 'border-emerald-200',
            icon: CheckCircle2
        },
        'Rejected': {
            label: 'مرفوضة',
            bg: 'bg-rose-50',
            text: 'text-rose-700',
            border: 'border-rose-200',
            icon: Ban
        },
        'Paid': {
            label: 'مدفوعة',
            bg: 'bg-blue-50',
            text: 'text-blue-700',
            border: 'border-blue-200',
            icon: DollarSign
        },
        'Unpaid': {
            label: 'غير مدفوعة',
            bg: 'bg-slate-50',
            text: 'text-slate-600',
            border: 'border-slate-200',
            icon: DollarSign
        },
    };

    const c = config[status] || {
        label: status,
        bg: 'bg-slate-50',
        text: 'text-slate-600',
        border: 'border-slate-200',
        icon: FileText
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${c.bg} ${c.text} ${c.border}`}
        >
            <c.icon className="w-3.5 h-3.5" />
            {c.label}
        </span>
    );
};

const ApprovalBadge: React.FC<{ status: string }> = ({ status }) => {
    if (!status) return null;

    const config: Record<string, { label: string; className: string }> = {
        'Approved': {
            label: 'معتمد للصرف',
            className: 'bg-emerald-50 text-emerald-600 border-emerald-100'
        },
        'Rejected': {
            label: 'مرفوض الصرف',
            className: 'bg-rose-50 text-rose-600 border-rose-100'
        },
        'Pending': {
            label: 'بانتظار اعتماد الصرف',
            className: 'bg-amber-50 text-amber-600 border-amber-100'
        },
    };

    const c = config[status] || config['Pending'];

    return (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${c.className}`}>
            {c.label}
        </span>
    );
};

const TabButton: React.FC<{
    active: boolean;
    onClick: () => void;
    icon: React.ElementType;
    label: string;
    badge?: number;
}> = ({ active, onClick, icon: Icon, label, badge }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
            active
                ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-primary/30 hover:bg-brand-primary/5'
        }`}
    >
        <Icon className="w-5 h-5" />
        <span>{label}</span>
        {badge !== undefined && badge > 0 && (
            <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    active ? 'bg-white/20 text-white' : 'bg-rose-500 text-white'
                }`}
            >
                {badge}
            </span>
        )}
    </button>
);

// --- Invoice Row Component ---

const InvoiceRow: React.FC<{
    invoice: SupplierInvoiceDto;
    index: number;
    isExpanded: boolean;
    onToggle: () => void;
    onView: () => void;
    onApprove: () => void;
    onDelete: (invoice: SupplierInvoiceDto) => void;
    isSelected: boolean;
    onToggleSelect: (id: number) => void;
}> = ({ invoice, index, isExpanded, onToggle, onView, onApprove, onDelete, isSelected, onToggleSelect }) => {
    const handleDownloadPdf = async (invoice: SupplierInvoiceDto) => {
        try {
            const toastId = toast.loading('جاري تحميل الفاتورة...');
            const blob = await supplierInvoiceService.downloadPdf(invoice.id!);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute(
                'download',
                `invoice-${invoice.supplierInvoiceNo || invoice.id}.pdf`
            );
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('تم تحميل الفاتورة بنجاح', { id: toastId });
        } catch (error) {
            console.error('Failed to download PDF:', error);
            toast.error('فشل تحميل الفاتورة');
        }
    };

    return (
        <>
            <tr
                className={`group hover:bg-brand-primary/5 transition-colors duration-200 border-b border-slate-100 last:border-0 cursor-pointer ${
                    isExpanded ? 'bg-brand-primary/5' : ''
                }`}
                onClick={onToggle}
                style={{
                    animationDelay: `${index * 30}ms`,
                    animation: 'fadeInUp 0.3s ease-out forwards'
                }}
            >
                <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                        checked={isSelected}
                        onChange={() => invoice.id != null && onToggleSelect(invoice.id)}
                    />
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Receipt className="w-5 h-5 text-brand-primary" />
                        </div>
                        <div>
                            <div className="font-bold text-slate-800 group-hover:text-brand-primary transition-colors">
                                {invoice.invoiceNumber}
                            </div>
                            <div className="text-xs text-slate-400 font-mono">
                                سند: {invoice.supplierInvoiceNo}
                            </div>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-100 rounded-lg">
                            <Truck className="w-4 h-4 text-slate-500" />
                        </div>
                        <span className="font-medium text-slate-700">
                            {invoice.supplierNameAr}
                        </span>
                    </div>
                </td>
                <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {invoice.invoiceDate}
                    </span>
                </td>
                <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold border border-rose-100">
                        <Clock className="w-3.5 h-3.5" />
                        {invoice.dueDate}
                    </span>
                </td>
                <td className="px-6 py-4 text-center">
                    <div className="font-bold text-slate-700">
                        {formatNumber(invoice.deliveryCost || 0)}
                        <span className="text-[10px] font-medium text-slate-400 mr-1">
                            {invoice.currency}
                        </span>
                    </div>
                </td>
                <td className="px-6 py-4 text-center font-bold">
                    <div className="text-lg text-brand-primary">
                        {formatNumber(invoice.totalAmount)}
                        <span className="text-xs font-medium text-slate-400 mr-1">
                            {invoice.currency}
                        </span>
                    </div>
                    {invoice.paidAmount! > 0 && (
                        <div className="text-xs text-emerald-600 font-bold mt-0.5">
                            مسدد: {formatNumber(invoice.paidAmount)}
                        </div>
                    )}
                </td>
                <td className="px-6 py-4">
                    <div className="flex flex-col items-center gap-1.5">
                        <StatusBadge status={invoice.status} />
                        <ApprovalBadge status={invoice.approvalStatus || ''} />
                    </div>
                </td>
                <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); onView(); }} className="p-2.5 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-all duration-200 group/btn" title="عرض"><Eye className="w-4 h-4" /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDownloadPdf(invoice); }} className="p-2.5 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-all duration-200" title="طباعة / تحميل PDF"><FileText className="w-4 h-4" /></button>
                        {invoice.status === 'Unpaid' && invoice.approvalStatus === 'Pending' && (
                            <button onClick={(e) => { e.stopPropagation(); onApprove(); }} className="p-2.5 text-emerald-500 hover:text-white hover:bg-emerald-500 rounded-xl transition-all duration-200" title="اعتماد الصرف"><CheckCircle2 className="w-4 h-4" /></button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); onDelete(invoice); }} className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-200" title="حذف"><Trash2 className="w-4 h-4" /></button>
                        <button className={`p-2.5 rounded-xl transition-all duration-200 ${isExpanded ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-300'}`}><Plus className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-45' : ''}`} /></button>
                    </div>
                </td>
            </tr>

            {isExpanded && invoice.items && invoice.items.length > 0 && (
                <tr>
                    <td colSpan={9} className="px-6 py-4 bg-slate-50/50">
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-fadeInUp">
                            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Package className="w-4 h-4 text-brand-primary" />
                                    <span className="font-bold text-slate-700">
                                        تفاصيل الأصناف ({invoice.items.length})
                                    </span>
                                </div>
                                <div className="flex gap-4 text-xs font-bold">
                                    <div className="flex gap-1 text-slate-500">
                                        <span>الخصم:</span>
                                        <span className="text-rose-600">
                                            {formatNumber(invoice.discountAmount || 0)}
                                        </span>
                                    </div>
                                    <div className="flex gap-1 text-slate-500">
                                        <span>الضريبة:</span>
                                        <span className="text-amber-600">
                                            {formatNumber(invoice.taxAmount || 0)}
                                        </span>
                                    </div>
                                    {(invoice.deliveryCost! > 0 ||
                                        (invoice.otherCosts || 0) > 0) && (
                                        <div className="flex gap-4">
                                            {invoice.deliveryCost! > 0 && (
                                                <div className="flex gap-1 text-slate-500">
                                                    <span>مصاريف الشحن:</span>
                                                    <span className="text-blue-600">
                                                        {formatNumber(invoice.deliveryCost || 0)}
                                                    </span>
                                                </div>
                                            )}
                                            {(invoice.otherCosts || 0) > 0 && (
                                                <div className="flex gap-1 text-slate-500">
                                                    <span>مصاريف أخرى:</span>
                                                    <span className="text-purple-600">
                                                        {formatNumber(invoice.otherCosts || 0)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                                            <th className="px-6 py-3 text-right font-semibold">
                                                الصنف
                                            </th>
                                            <th className="px-6 py-3 text-center font-semibold">
                                                الكمية
                                            </th>
                                            <th className="px-6 py-3 text-center font-semibold">
                                                الوحدة
                                            </th>
                                            <th className="px-6 py-3 text-center font-semibold">
                                                السعر
                                            </th>
                                            <th className="px-6 py-3 text-center font-semibold">
                                                خصم %
                                            </th>
                                            <th className="px-6 py-3 text-center font-semibold">
                                                الضريبة %
                                            </th>
                                            <th className="px-6 py-3 text-left font-semibold">
                                                الإجمالي
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {invoice.items.map((item, idx) => (
                                            <tr
                                                key={idx}
                                                className="hover:bg-slate-50/50 transition-colors"
                                            >
                                                <td className="px-6 py-4 font-medium text-slate-700">
                                                    {item.itemNameAr}
                                                </td>
                                                <td className="px-6 py-4 text-center font-bold text-brand-primary">
                                                    {item.quantity}
                                                </td>
                                                <td className="px-6 py-4 text-center text-slate-500">
                                                    {item.unitNameAr}
                                                </td>
                                                <td className="px-6 py-4 text-center font-bold text-emerald-600">
                                                    {formatNumber(item.unitPrice)}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded text-[10px] font-bold border border-rose-100">
                                                        {item.discountPercentage || 0}%
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[10px] font-bold border border-amber-100">
                                                        {item.taxPercentage || 0}%
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-left font-bold text-slate-900">
                                                    {formatNumber(item.totalPrice)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

// --- GRN Row Component ---

const GRNRow: React.FC<{
    grn: any;
    index: number;
    onCreateInvoice: () => void;
    onViewPO: () => void;
}> = ({ grn, index, onCreateInvoice, onViewPO }) => (
    <tr
        className="group hover:bg-brand-primary/5 transition-colors duration-200 border-b border-slate-100 last:border-0"
        style={{
            animationDelay: `${index * 30}ms`,
            animation: 'fadeInUp 0.3s ease-out forwards'
        }}
    >
        <td className="px-6 py-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Package className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                    <div className="font-bold text-slate-800 group-hover:text-brand-primary transition-colors">
                        #{grn.grnNumber}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                        {grn.deliveryNoteNo || '---'}
                    </div>
                </div>
            </div>
        </td>
        <td className="px-6 py-4">
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-100 rounded-lg">
                    <Truck className="w-4 h-4 text-slate-500" />
                </div>
                <span className="font-medium text-slate-700">
                    {grn.supplierNameAr}
                </span>
            </div>
        </td>
        <td className="px-6 py-4 text-center">
            <button
                onClick={onViewPO}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary/10 text-brand-primary rounded-lg text-sm font-bold hover:bg-brand-primary hover:text-white transition-all group/po"
            >
                <Hash className="w-3.5 h-3.5" />
                {grn.poNumber}
                <ExternalLink className="w-3 h-3 opacity-0 group-hover/po:opacity-100 transition-opacity" />
            </button>
        </td>
        <td className="px-6 py-4 text-center">
            <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400" />
                {formatDate(grn.grnDate!)}
            </span>
        </td>
        <td className="px-6 py-4 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold border border-emerald-200">
                <Package className="w-4 h-4" />
                {grn.totalAcceptedQty || grn.totalReceivedQty}
            </span>
        </td>
        <td className="px-6 py-4">
            <button
                onClick={onCreateInvoice}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
            >
                <DollarSign className="w-4 h-4" />
                <span>إنشاء فاتورة</span>
            </button>
        </td>
    </tr>
);

// Skeleton
const TableSkeleton: React.FC<{ columns: number; withCheckbox?: boolean }> = ({ columns, withCheckbox }) => (
    <>
        {[1, 2, 3, 4, 5].map(i => (
            <tr key={i} className="animate-pulse border-b border-slate-100">
                {withCheckbox && (
                    <td className="px-4 py-4 text-center">
                        <div className="w-4 h-4 bg-slate-100 rounded mx-auto" />
                    </td>
                )}
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                        <div className="space-y-2">
                            <div className="h-4 w-28 bg-slate-200 rounded" />
                            <div className="h-3 w-20 bg-slate-100 rounded" />
                        </div>
                    </div>
                </td>
                {Array.from({ length: columns - 2 }).map((_, j) => (
                    <td key={j} className="px-6 py-4">
                        <div className="h-6 bg-slate-100 rounded-lg" />
                    </td>
                ))}
                <td className="px-6 py-4">
                    <div className="flex gap-2 justify-center">
                        <div className="h-9 w-9 bg-slate-100 rounded-xl" />
                        <div className="h-9 w-9 bg-slate-100 rounded-xl" />
                    </div>
                </td>
                {Array.from({ length: columns - (withCheckbox ? 3 : 2) }).map((_, j) => (<td key={j} className="px-6 py-4"><div className="h-6 bg-slate-100 rounded-lg" /></td>))}
                <td className="px-6 py-4"><div className="flex gap-2 justify-center"><div className="h-9 w-9 bg-slate-100 rounded-xl" /><div className="h-9 w-9 bg-slate-100 rounded-xl" /></div></td>
            </tr>
        ))}
    </>
);

// --- Empty State ---

const EmptyState: React.FC<{
    icon: React.ElementType;
    title: string;
    description: string;
    colSpan?: number;
    action?: React.ReactNode;
}> = ({ icon: Icon, title, description, colSpan = 7, action }) => (
    <tr>
        <td colSpan={colSpan} className="px-6 py-20">
            <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-2xl flex items-center justify-center">
                    <Icon className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-6">{description}</p>
                {action}
            </div>
        </td>
    </tr>
);

// --- Main Page Component ---

const SupplierInvoicesPage: React.FC = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState<SupplierInvoiceDto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [activeTab, setActiveTab] = useState<'invoices' | 'pending'>('invoices');
    const [pendingGRNs, setPendingGRNs] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const [expandedInvoiceId, setExpandedInvoiceId] = useState<number | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [invoiceToDelete, setInvoiceToDelete] = useState<SupplierInvoiceDto | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (activeTab === 'invoices') {
            fetchInvoices();
        } else {
            fetchPendingGRNs();
        }
    }, [activeTab]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchTerm, statusFilter]);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const data = await supplierInvoiceService.getAllInvoices();
            setInvoices(data.data || []);
        } catch (error) {
            console.error('Failed to fetch invoices:', error);
            toast.error('فشل تحميل الفواتير');
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingGRNs = async () => {
        try {
            setLoading(true);
            const data = await grnService.getAllGRNs();
            setPendingGRNs(data.filter((g: any) => g.status === 'Completed'));
        } catch (error) {
            console.error('Failed to fetch pending GRNs:', error);
            toast.error('فشل تحميل التوريدات المعلقة');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveInvoice = async (invoice: SupplierInvoiceDto) => {
        if (window.confirm('هل توافق على اعتماد صرف هذه الفاتورة؟')) {
            try {
                await supplierInvoiceService.approvePayment(invoice.id!, 1, true);
                fetchInvoices();
                toast.success('تم اعتماد الصرف بنجاح', { icon: '✅' });
            } catch {
                toast.error('فشل الاعتماد');
            }
        }
    };

    const handleDeleteClick = (invoice: SupplierInvoiceDto) => {
        setInvoiceToDelete(invoice);
        setIsDeleteModalOpen(true);
    };

    const handleToggleSelect = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleToggleSelectAllPage = () => {
        const pageIds = paginatedInvoices.map(inv => inv.id!).filter(Boolean);
        const allSelected = pageIds.every(id => selectedIds.includes(id));
        if (allSelected) {
            setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
        }
    };

    const handleBulkDeleteClick = () => {
        if (selectedIds.length === 0) {
            toast.error('يرجى اختيار فواتير أولاً');
            return;
        }
        setInvoiceToDelete(null);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        const idsToDelete = invoiceToDelete?.id != null ? [invoiceToDelete.id] : selectedIds;
        if (!idsToDelete.length) return;
        setIsDeleting(true);
        try {
            for (const id of idsToDelete) {
                await supplierInvoiceService.deleteInvoice(id);
            }
            toast.success(idsToDelete.length === 1 ? 'تم حذف الفاتورة بنجاح' : 'تم حذف الفواتير بنجاح');
            fetchInvoices();
            setIsDeleteModalOpen(false);
            setInvoiceToDelete(null);
            setSelectedIds([]);
        } catch (error: any) {
            const apiMessage = error?.response?.data?.message as string | undefined;
            toast.error(apiMessage || 'فشل حذف الفاتورة');
        } finally {
            setIsDeleting(false);
        }
    };

    // Calculate processed invoices with correct breakdown
    const processedInvoices = useMemo(() => invoices.map(inv => calculateInvoiceGrandTotal(inv)), [invoices]);

    const filteredInvoices = useMemo(() => {
        const filtered = processedInvoices.filter(inv => {
            const matchesSearch =
                inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inv.supplierInvoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inv.supplierNameAr?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus =
                statusFilter === 'All' || inv.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

        return [...filtered].sort((a, b) => {
            const dateA = a.invoiceDate ? new Date(a.invoiceDate).getTime() : 0;
            const dateB = b.invoiceDate ? new Date(b.invoiceDate).getTime() : 0;
            if (dateB !== dateA) return dateB - dateA;
            return (b.id ?? 0) - (a.id ?? 0);
        });
    }, [processedInvoices, searchTerm, statusFilter]);

    const filteredPending = useMemo(() => {
        const filtered = pendingGRNs.filter(
            g =>
                g.grnNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                g.supplierNameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                g.poNumber?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return [...filtered].sort((a, b) => {
            const dateA = a.grnDate ? new Date(a.grnDate).getTime() : 0;
            const dateB = b.grnDate ? new Date(b.grnDate).getTime() : 0;
            if (dateB !== dateA) return dateB - dateA;
            return (b.id ?? 0) - (a.id ?? 0);
        });
    }, [pendingGRNs, searchTerm]);

    const paginatedInvoices = filteredInvoices.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );
    const paginatedPending = filteredPending.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const stats = useMemo(
        () => ({
            total: processedInvoices.length,
            pending: processedInvoices.filter(i => i.status === 'Pending').length,
            approved: processedInvoices.filter(i => i.status === 'Approved').length,
            paid: processedInvoices.filter(i => i.status === 'Paid').length,
            subTotal: processedInvoices.reduce(
                (sum, i) => sum + (i.subTotal || 0),
                0
            ),
            taxAmount: processedInvoices.reduce(
                (sum, i) => sum + (i.taxAmount || 0),
                0
            ),
            discountAmount: processedInvoices.reduce(
                (sum, i) => sum + (i.discountAmount || 0),
                0
            ),
            deliveryCost: processedInvoices.reduce(
                (sum, i) => sum + (i.deliveryCost || 0),
                0
            ),
            otherCosts: processedInvoices.reduce(
                (sum, i) => sum + (i.otherCosts || 0),
                0
            ),
            totalAmount: processedInvoices.reduce(
                (sum, i) => sum + (i.totalAmount || 0),
                0
            ),
            pendingGRNs: pendingGRNs.length,
        }),
        [processedInvoices, pendingGRNs]
    );

    const statusOptions = [
        { value: 'All', label: 'جميع الحالات' },
        { value: 'Pending', label: 'قيد المراجعة' },
        { value: 'Approved', label: 'معتمدة' },
        { value: 'Paid', label: 'مدفوعة' },
        { value: 'Rejected', label: 'مرفوضة' },
    ];

    return (
        <div className="space-y-6">
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 rounded-3xl p-8 text-white">
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
                <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-white/20 rounded-full animate-pulse" />
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                            <Receipt className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">فواتير الموردين</h1>
                            <p className="text-white/70 text-lg">
                                إدارة وتسجيل المطالبات المالية للموردين
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() =>
                                navigate('/dashboard/procurement/invoices/new')
                            }
                            className="flex items-center gap-2 px-6 py-3.5 bg-white text-brand-primary rounded-xl font-bold hover:bg-white/90 transition-all shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5"
                        >
                            <Plus className="w-5 h-5" />
                            <span>تسجيل فاتورة</span>
                        </button>
                        <button
                            onClick={
                                activeTab === 'invoices'
                                    ? fetchInvoices
                                    : fetchPendingGRNs
                            }
                            disabled={loading}
                            className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-200 disabled:opacity-50"
                        >
                            <RefreshCw
                                className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard
                    icon={Receipt}
                    value={stats.subTotal}
                    label="الإجمالي (قبل الخصم والضريبة)"
                    color="primary"
                    suffix="ج.م"
                />
                <StatCard
                    icon={Ban}
                    value={stats.discountAmount}
                    label="إجمالي الخصومات"
                    color="rose"
                    suffix="ج.م"
                />
                <StatCard
                    icon={Clock}
                    value={stats.taxAmount}
                    label="إجمالي الضريبة"
                    color="warning"
                    suffix="ج.م"
                />
                <StatCard
                    icon={Truck}
                    value={stats.deliveryCost}
                    label="إجمالي مصاريف الشحن"
                    color="blue"
                    suffix="ج.م"
                />
                <StatCard
                    icon={DollarSign}
                    value={stats.totalAmount}
                    label="الإجمالي النهائي"
                    color="success"
                    suffix="ج.م"
                />
                <StatCard
                    icon={Package}
                    value={stats.pendingGRNs}
                    label="بانتظار الفوترة"
                    color="purple"
                    onClick={() => setActiveTab('pending')}
                    active={activeTab === 'pending'}
                />
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-3">
                <TabButton
                    active={activeTab === 'invoices'}
                    onClick={() => setActiveTab('invoices')}
                    icon={FileText}
                    label="الفواتير المسجلة"
                />
                <TabButton
                    active={activeTab === 'pending'}
                    onClick={() => setActiveTab('pending')}
                    icon={Truck}
                    label="توريدات بانتظار الفوترة"
                    badge={pendingGRNs.length}
                />
            </div>

            {/* Search & Filter */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search
                            className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                                isSearchFocused
                                    ? 'text-brand-primary'
                                    : 'text-slate-400'
                            }`}
                        />
                        <input
                            type="text"
                            placeholder={
                                activeTab === 'invoices'
                                    ? 'بحث برقم الفاتورة أو اسم المورد...'
                                    : 'بحث برقم الاستلام أو المورد...'
                            }
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            className={`w-full pr-12 pl-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none bg-slate-50 ${
                                isSearchFocused
                                    ? 'border-brand-primary bg-white shadow-lg shadow-brand-primary/10'
                                    : 'border-transparent hover:border-slate-200'
                            }`}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <XCircle className="w-4 h-4 text-slate-400" />
                            </button>
                        )}
                    </div>
                    {activeTab === 'invoices' && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border-2 border-transparent hover:border-slate-200 transition-all">
                            <Layers className="w-5 h-5 text-slate-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-transparent outline-none text-slate-700 font-medium cursor-pointer"
                            >
                                {statusOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Count */}
            {!loading && (
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-brand-primary rounded-full" />
                    <span className="text-slate-600">
                        عرض{' '}
                        <span className="font-bold text-slate-800">
                            {activeTab === 'invoices'
                                ? filteredInvoices.length
                                : filteredPending.length}
                        </span>{' '}
                        {activeTab === 'invoices' ? 'فاتورة' : 'توريد'}
                    </span>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                {activeTab === 'invoices' ? (
                                    <>
                                        <th className="px-4 py-4 text-center text-sm font-semibold text-slate-700">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                                                checked={paginatedInvoices.length > 0 && paginatedInvoices.every(inv => inv.id != null && selectedIds.includes(inv.id))}
                                                onChange={handleToggleSelectAllPage}
                                            />
                                        </th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">رقم الفاتورة</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">المورد</th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">التاريخ</th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">تاريخ الاستحقاق</th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">مصاريف الشحن</th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">الإجمالي النهائي</th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">الحالة</th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">الإجراءات</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                                            رقم الاستلام
                                        </th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                                            المورد
                                        </th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                                            أمر الشراء
                                        </th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                                            تاريخ الاستلام
                                        </th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                                            الكمية
                                        </th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                                            الإجراءات
                                        </th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <TableSkeleton columns={activeTab === 'invoices' ? 9 : 6} withCheckbox={activeTab === 'invoices'} />
                            ) : activeTab === 'invoices' ? (
                                filteredInvoices.length === 0 ? (
                                    <EmptyState colSpan={9} icon={Receipt} title="لا توجد فواتير" description="ابدأ بتسجيل أول فاتورة توريد بالنظام" action={<button onClick={() => navigate('/dashboard/procurement/invoices/new')} className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/30"><Plus className="w-5 h-5" />تسجيل فاتورة جديدة</button>} />
                                ) : (
                                    paginatedInvoices.map((inv, index) => (
                                        <InvoiceRow
                                            key={inv.id}
                                            invoice={inv}
                                            index={index}
                                            isExpanded={expandedInvoiceId === inv.id}
                                            onToggle={() => setExpandedInvoiceId(expandedInvoiceId === inv.id ? null : (inv.id ?? null))}
                                            onView={() => navigate(`/dashboard/procurement/invoices/${inv.id}`)}
                                            onApprove={() => handleApproveInvoice(inv)}
                                            onDelete={handleDeleteClick}
                                            isSelected={inv.id != null && selectedIds.includes(inv.id)}
                                            onToggleSelect={handleToggleSelect}
                                        />
                                    ))
                                )
                            ) : filteredPending.length === 0 ? (
                                <EmptyState
                                    colSpan={6}
                                    icon={Truck}
                                    title="لا توجد توريدات بانتظار الفوترة"
                                    description="سيتم ظهور التوريدات التي تم فحصها وإضافتها للمخزن هنا"
                                />
                            ) : (
                                paginatedPending.map((grn, index) => (
                                    <GRNRow
                                        key={grn.id}
                                        grn={grn}
                                        index={index}
                                        onCreateInvoice={() =>
                                            navigate(
                                                `/dashboard/procurement/invoices/new?grnId=${grn.id}`
                                            )
                                        }
                                        onViewPO={() =>
                                            navigate(
                                                `/dashboard/procurement/po/${grn.poId}`
                                            )
                                        }
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && (activeTab === 'invoices' ? filteredInvoices.length : filteredPending.length) > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                        {activeTab === 'invoices' ? (
                            <>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleBulkDeleteClick}
                                        disabled={selectedIds.length === 0 || isDeleting}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        حذف المحدد ({selectedIds.length})
                                    </button>
                                </div>
                                <Pagination currentPage={currentPage} totalItems={filteredInvoices.length} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }} />
                            </>
                        ) : (
                            <>
                                <div />
                                <Pagination currentPage={currentPage} totalItems={filteredPending.length} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }} />
                            </>
                        )}
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="حذف فاتورة مورد"
                message={
                    invoiceToDelete
                        ? `هل أنت متأكد من حذف الفاتورة ${invoiceToDelete.invoiceNumber}؟ قد لا يمكن الحذف إذا كانت مرتبطة بسندات صرف أو مدفوعات.`
                        : `هل أنت متأكد من حذف عدد ${selectedIds.length} من الفواتير؟`
                }
                confirmText="حذف"
                cancelText="إلغاء"
                onConfirm={handleDeleteConfirm}
                onCancel={() => { setIsDeleteModalOpen(false); setInvoiceToDelete(null); }}
                isLoading={isDeleting}
                variant="danger"
            />
        </div>
    );
};

export default SupplierInvoicesPage;