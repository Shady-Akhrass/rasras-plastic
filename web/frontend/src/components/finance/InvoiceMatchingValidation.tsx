import React from 'react';
import { CheckCircle2, XCircle, FileText, Package, ShoppingCart, ArrowLeftRight, Receipt, Truck, AlertTriangle, TrendingDown } from 'lucide-react';
import { formatNumber } from '../../utils/format';

interface InvoiceMatchingProps {
    poNumber?: string;
    grnNumber?: string;
    invoiceNumber?: string;
    poTotal?: number;
    poSubTotal?: number;
    poTaxAmount?: number;
    poDiscountAmount?: number;
    poShippingCost?: number;
    poOtherCosts?: number;
    grnTotal?: number;
    grnSubTotal?: number;
    grnTaxAmount?: number;
    grnDiscountAmount?: number;
    grnTaxPercentage?: number;
    grnDiscountPercentage?: number;
    grnShippingCost?: number;
    grnOtherCosts?: number;
    invoiceTotal?: number;
    invoiceSubTotal?: number;
    invoiceTaxAmount?: number;
    invoiceDiscountAmount?: number;
    invoiceTaxPercentage?: number;
    invoiceDiscountPercentage?: number;
    invoiceDeliveryCost?: number;
    invoiceOtherCosts?: number;
    returnSubTotal?: number;
    isValid?: boolean;
    message?: string;
    items?: Array<{
        itemName: string;
        poQuantity?: number;
        grnQuantity?: number;
        returnedQuantity?: number;
        invoiceQuantity?: number;
        poUnitPrice?: number;
        poDiscountPercentage?: number;
        poTaxPercentage?: number;
        grnUnitPrice?: number;
        returnUnitPrice?: number;
        invoiceUnitPrice?: number;
        poLineTotal?: number;
        grnLineTotal?: number;
        returnLineTotal?: number;
        invoiceLineTotal?: number;
    }>;
}

const InvoiceMatchingValidation: React.FC<InvoiceMatchingProps> = ({
    poNumber,
    grnNumber,
    invoiceNumber,
    poTotal = 0,
    poSubTotal = 0,
    poTaxAmount = 0,
    poDiscountAmount = 0,
    poShippingCost = 0,
    poOtherCosts = 0,
    grnTotal = 0,
    grnSubTotal = 0,
    grnTaxAmount = 0,
    grnDiscountAmount = 0,
    grnShippingCost = 0,
    grnOtherCosts = 0,
    invoiceTotal = 0,
    invoiceSubTotal = 0,
    invoiceTaxAmount = 0,
    invoiceDiscountAmount = 0,
    invoiceDeliveryCost = 0,
    invoiceOtherCosts = 0,
    returnSubTotal = 0,
    isValid = false,
    message,
    items = []
}) => {
    const reconciliationItems = items.map(item => {
        const poQty = item.poQuantity || 0;
        const retQty = item.returnedQuantity || 0;
        const unitPrice = item.poUnitPrice || 0;
        const discountPct = item.poDiscountPercentage || 0;
        const taxPct = item.poTaxPercentage || 0;

        const netQty = poQty - retQty;
        const grossAmount = netQty * unitPrice;
        const discountAmount = grossAmount * (discountPct / 100);
        const afterDiscount = grossAmount - discountAmount;
        const taxAmount = afterDiscount * (taxPct / 100);
        const lineTotal = afterDiscount + taxAmount;

        return { itemName: item.itemName, poQty, retQty, netQty, unitPrice, discountAmount, taxAmount, lineTotal };
    });

    const reconciliationSubTotal = reconciliationItems.reduce((sum, i) => sum + (i.netQty * i.unitPrice), 0);
    const reconciliationDiscountAmount = reconciliationItems.reduce((sum, i) => sum + i.discountAmount, 0);
    const reconciliationTaxAmount = reconciliationItems.reduce((sum, i) => sum + i.taxAmount, 0);
    const netDueAfterReconciliation = reconciliationSubTotal - reconciliationDiscountAmount + reconciliationTaxAmount;

    const hasReturns = returnSubTotal > 0;
    const displayPoDiscount = hasReturns ? reconciliationDiscountAmount : poDiscountAmount;
    const displayPoTax = hasReturns ? reconciliationTaxAmount : poTaxAmount;
    const displayPoTotal = hasReturns
        ? (netDueAfterReconciliation + (poShippingCost || 0) + (poOtherCosts || 0))
        : (poTotal || 0);

    const effectiveIsValid = isValid || Math.abs(displayPoTotal - invoiceTotal) < 0.01;

    const targetTotal = (grnTotal > 0 ? grnTotal : displayPoTotal);
    const variance = targetTotal > 0 ? Math.abs((invoiceTotal - targetTotal) / targetTotal * 100) : 0;
    const isHighVariance = variance > 10;

    const matchedItems = items.filter(item => {
        const netGrnQty = (item.grnQuantity || 0) - (item.returnedQuantity || 0);
        return (item.invoiceQuantity || 0) === netGrnQty && (item.invoiceUnitPrice || 0) === (item.poUnitPrice || 0);
    }).length;
    const matchPercentage = items.length > 0 ? Math.round((matchedItems / items.length) * 100) : 0;

    return (
        <div className="space-y-5" dir="rtl">
            {/* ── Validation Status Banner ── */}
            <div
                className={`relative overflow-hidden rounded-2xl border ${effectiveIsValid
                        ? 'border-emerald-200 bg-gradient-to-l from-emerald-50 via-white to-emerald-50/60'
                        : 'border-rose-200 bg-gradient-to-l from-rose-50 via-white to-rose-50/60'
                    }`}
            >
                {/* decorative accent bar */}
                <div className={`absolute top-0 right-0 bottom-0 w-1.5 ${effectiveIsValid ? 'bg-emerald-500' : 'bg-rose-500'}`} />

                <div className="flex items-center gap-4 px-7 py-5">
                    <div className={`flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl shadow-sm ${effectiveIsValid ? 'bg-emerald-100 ring-4 ring-emerald-50' : 'bg-rose-100 ring-4 ring-rose-50'
                        }`}>
                        {effectiveIsValid
                            ? <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                            : <XCircle className="w-7 h-7 text-rose-600" />}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4 className={`text-lg font-extrabold ${effectiveIsValid ? 'text-emerald-800' : 'text-rose-800'}`}>
                            {effectiveIsValid ? 'المطابقة صحيحة ✓' : 'المطابقة غير صحيحة ✗'}
                        </h4>
                        <p className={`mt-0.5 text-sm leading-relaxed ${effectiveIsValid ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {message || (effectiveIsValid
                                ? (hasReturns
                                    ? 'تمت مطابقة الفاتورة بنجاح بعد التسوية (خصم المرتجعات وإعادة احتساب الضريبة والخصم)'
                                    : 'تمت مطابقة الفاتورة بنجاح مع أمر الشراء وإذن الاستلام')
                                : 'يوجد خطأ في مطابقة الفاتورة مع المستندات المرجعية والمرتجعات')}
                        </p>
                    </div>

                    {/* quick stats pill */}
                    {items.length > 0 && (
                        <div className={`flex-shrink-0 hidden sm:flex flex-col items-center justify-center px-5 py-2.5 rounded-xl ${effectiveIsValid ? 'bg-emerald-100/80' : 'bg-rose-100/80'
                            }`}>
                            <span className={`text-2xl font-black ${effectiveIsValid ? 'text-emerald-700' : 'text-rose-700'}`}>
                                {matchPercentage}%
                            </span>
                            <span className={`text-[10px] font-semibold ${effectiveIsValid ? 'text-emerald-500' : 'text-rose-500'}`}>
                                نسبة التطابق
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Document Reference Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                    { label: 'أمر الشراء', number: poNumber, total: displayPoTotal, icon: ShoppingCart, color: 'blue' },
                    { label: 'إذن الاستلام', number: grnNumber, total: grnTotal > 0 ? grnTotal : displayPoTotal, icon: Truck, color: 'amber' },
                    { label: 'الفاتورة', number: invoiceNumber, total: invoiceTotal, icon: Receipt, color: 'violet' },
                ].map((doc) => (
                    <div
                        key={doc.label}
                        className={`relative overflow-hidden rounded-xl border bg-white px-5 py-4 transition hover:shadow-md
                            ${doc.color === 'blue' ? 'border-blue-100 hover:border-blue-200' : ''}
                            ${doc.color === 'amber' ? 'border-amber-100 hover:border-amber-200' : ''}
                            ${doc.color === 'violet' ? 'border-violet-100 hover:border-violet-200' : ''}
                        `}
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 -translate-y-8 translate-x-8 rounded-full opacity-[0.07]
                            ${doc.color === 'blue' ? 'bg-blue-500' : ''}
                            ${doc.color === 'amber' ? 'bg-amber-500' : ''}
                            ${doc.color === 'violet' ? 'bg-violet-500' : ''}
                        `} />

                        <div className="flex items-center gap-3 mb-3">
                            <div className={`flex items-center justify-center w-9 h-9 rounded-lg
                                ${doc.color === 'blue' ? 'bg-blue-50 text-blue-600' : ''}
                                ${doc.color === 'amber' ? 'bg-amber-50 text-amber-600' : ''}
                                ${doc.color === 'violet' ? 'bg-violet-50 text-violet-600' : ''}
                            `}>
                                <doc.icon className="w-[18px] h-[18px]" />
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold text-slate-400 leading-none">{doc.label}</p>
                                <p className="text-sm font-bold text-slate-700 mt-0.5">{doc.number || '—'}</p>
                            </div>
                        </div>

                        <p className={`text-xl font-black tracking-tight
                            ${doc.color === 'blue' ? 'text-blue-700' : ''}
                            ${doc.color === 'amber' ? 'text-amber-700' : ''}
                            ${doc.color === 'violet' ? 'text-violet-700' : ''}
                        `}>
                            {formatNumber(doc.total || 0)}
                        </p>
                    </div>
                ))}
            </div>

            {/* ── Variance Warning ── */}
            {isHighVariance && (
                <div className="flex items-start gap-3 rounded-xl border-2 border-amber-200 bg-gradient-to-l from-amber-50 to-orange-50/40 p-4">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-amber-100">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-amber-800">تفاوت كبير في المبالغ — {variance.toFixed(1)}%</p>
                        <p className="text-xs text-amber-600 mt-0.5">يوجد تفاوت كبير بين صافي المستحق (بعد خصم المرتجعات) والفاتورة. يُرجى المراجعة.</p>
                    </div>
                </div>
            )}

            {/* ── Cost Comparison ── */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center justify-between bg-gradient-to-l from-slate-50 to-white px-6 py-4 border-b border-slate-100">
                    <h5 className="flex items-center gap-2 text-base font-extrabold text-slate-800">
                        <ArrowLeftRight className="w-5 h-5 text-brand-primary" />
                        مقارنة التكاليف الإجمالية
                    </h5>
                    <div className="hidden sm:flex items-center gap-5 text-[11px] font-bold text-slate-500">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> أمر الشراء</span>
                        {hasReturns && <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> المرتجع</span>}
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> إذن الاستلام</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-violet-600" /> الفاتورة</span>
                    </div>
                </div>

                <div className="p-5 space-y-0">
                    {/* Header row */}
                    <div className="grid grid-cols-4 gap-3 pb-3 mb-1 border-b-2 border-slate-200">
                        <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">البند</div>
                        <div className="text-center text-xs font-extrabold text-blue-600">أمر الشراء</div>
                        <div className="text-center text-xs font-extrabold text-amber-600">إذن الاستلام</div>
                        <div className="text-center text-xs font-extrabold text-violet-600">الفاتورة</div>
                    </div>

                    {/* Cost rows */}
                    {[
                        { label: 'إجمالي البنود (Sub-total)', po: poSubTotal, grn: grnSubTotal, inv: invoiceSubTotal },
                        ...(hasReturns ? [{ label: 'يخصم: مرتجعات', po: -returnSubTotal, grn: undefined as number | undefined, inv: undefined as number | undefined, isReturn: true }] : []),
                        { label: 'الخصم', po: displayPoDiscount, grn: grnDiscountAmount, inv: invoiceDiscountAmount },
                        { label: 'الضريبة', po: displayPoTax, grn: grnTaxAmount, inv: invoiceTaxAmount },
                        { label: 'مصاريف النقل / التوصيل', po: poShippingCost, grn: grnShippingCost, inv: invoiceDeliveryCost },
                        { label: 'مصاريف أخرى', po: poOtherCosts, grn: grnOtherCosts, inv: invoiceOtherCosts },
                    ].map((row, idx) => {
                        const isReturn = (row as any).isReturn;
                        return (
                            <div
                                key={idx}
                                className={`grid grid-cols-4 gap-3 py-2.5 border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50/60 ${isReturn ? 'bg-rose-50/40' : ''
                                    }`}
                            >
                                <div className={`text-xs font-semibold ${isReturn ? 'text-rose-600' : 'text-slate-600'}`}>{row.label}</div>
                                <div className={`text-center text-xs font-bold ${isReturn ? 'text-rose-500' : 'text-slate-700'}`}>
                                    {row.po !== undefined ? (isReturn ? `(${formatNumber(Math.abs(row.po))})` : formatNumber(row.po)) : '—'}
                                </div>
                                <div className="text-center text-xs font-bold text-slate-700">
                                    {row.grn !== undefined ? formatNumber(row.grn) : '—'}
                                </div>
                                <div className="text-center text-xs font-extrabold text-violet-700">
                                    {row.inv !== undefined ? formatNumber(row.inv) : '—'}
                                </div>
                            </div>
                        );
                    })}

                    {/* Grand total row */}
                    <div className="mt-3 rounded-xl bg-gradient-to-l from-slate-100 to-slate-50 px-4 py-3.5">
                        <div className="grid grid-cols-4 gap-3 items-center">
                            <div className="text-sm font-black text-slate-800">الإجمالي الكلي</div>
                            <div className="text-center text-sm font-black text-blue-700">{formatNumber(displayPoTotal)}</div>
                            <div className="text-center text-sm font-black text-amber-700">{formatNumber(grnTotal > 0 ? grnTotal : displayPoTotal)}</div>
                            <div className="text-center">
                                <span className="inline-block text-sm font-black text-violet-700 bg-violet-100 rounded-lg px-3 py-1">
                                    {formatNumber(invoiceTotal)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Items Comparison Table ── */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center justify-between bg-gradient-to-l from-slate-50 to-white px-6 py-4 border-b border-slate-100">
                    <h5 className="flex items-center gap-2 text-base font-extrabold text-slate-800">
                        <Package className="w-5 h-5 text-brand-primary" />
                        مطابقة بنود الأصناف
                    </h5>
                    {items.length > 0 && (
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                {matchedItems} من {items.length} متطابق
                            </div>
                            <div className="w-20 h-2 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${matchPercentage === 100 ? 'bg-emerald-500' : matchPercentage >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                                        }`}
                                    style={{ width: `${matchPercentage}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b-2 border-slate-200">
                                <th rowSpan={2} className="px-4 py-3 text-right font-extrabold text-slate-600 text-xs sticky right-0 bg-white z-10 min-w-[140px]">
                                    الصنف
                                </th>
                                <th colSpan={3} className="px-4 py-2 text-center text-[11px] font-extrabold text-blue-600 bg-blue-50/50 border-x border-blue-100">
                                    أمر الشراء
                                </th>
                                <th colSpan={3} className="px-4 py-2 text-center text-[11px] font-extrabold text-rose-600 bg-rose-50/50 border-x border-rose-100">
                                    المرتجع
                                </th>
                                <th colSpan={3} className="px-4 py-2 text-center text-[11px] font-extrabold text-amber-600 bg-amber-50/50 border-x border-amber-100">
                                    إذن الاستلام
                                </th>
                                <th colSpan={3} className="px-4 py-2 text-center text-[11px] font-extrabold text-violet-600 bg-violet-50/50 border-x border-violet-100">
                                    الفاتورة
                                </th>
                                <th rowSpan={2} className="px-4 py-3 text-center font-extrabold text-slate-600 text-xs min-w-[60px]">
                                    الحالة
                                </th>
                            </tr>
                            <tr className="border-b border-slate-200 bg-slate-50/50">
                                {['الكمية', 'السعر', 'الإجمالي'].map((h, i) => (
                                    <th key={`po-${i}`} className="px-2 py-1.5 text-center text-[10px] font-bold text-blue-400 border-x border-blue-50">{h}</th>
                                ))}
                                {['الكمية', 'السعر', 'الإجمالي'].map((h, i) => (
                                    <th key={`ret-${i}`} className="px-2 py-1.5 text-center text-[10px] font-bold text-rose-400 border-x border-rose-50 bg-rose-50/20">{h}</th>
                                ))}
                                {['المقبولة', 'السعر', 'الإجمالي'].map((h, i) => (
                                    <th key={`grn-${i}`} className="px-2 py-1.5 text-center text-[10px] font-bold text-amber-400 border-x border-amber-50">{h}</th>
                                ))}
                                {['الكمية', 'السعر', 'الإجمالي'].map((h, i) => (
                                    <th key={`inv-${i}`} className="px-2 py-1.5 text-center text-[10px] font-bold text-violet-400 border-x border-violet-50">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {items.length > 0 ? items.map((item, index) => {
                                const netGrnQty = (item.grnQuantity || 0) - (item.returnedQuantity || 0);
                                const qtyMatch = (item.invoiceQuantity || 0) === netGrnQty;
                                const priceMatch = (item.invoiceUnitPrice || 0) === (item.poUnitPrice || 0);
                                const isAllMatch = qtyMatch && priceMatch;

                                return (
                                    <tr
                                        key={index}
                                        className={`border-b border-slate-100 transition-colors ${isAllMatch ? 'hover:bg-emerald-50/30' : 'hover:bg-rose-50/20 bg-rose-50/10'
                                            }`}
                                    >
                                        <td className="px-4 py-3 font-bold text-slate-800 sticky right-0 bg-inherit z-10 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isAllMatch ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                {item.itemName}
                                            </div>
                                        </td>

                                        {/* PO */}
                                        <td className="px-2 py-3 text-center text-xs text-blue-600 bg-blue-50/10">{item.poQuantity ?? '—'}</td>
                                        <td className="px-2 py-3 text-center text-xs text-blue-600 bg-blue-50/10">{formatNumber(item.poUnitPrice || 0)}</td>
                                        <td className="px-2 py-3 text-center text-xs font-bold text-blue-700 bg-blue-50/20">{formatNumber(item.poLineTotal || 0)}</td>

                                        {/* Return */}
                                        <td className="px-2 py-3 text-center text-xs text-rose-500 bg-rose-50/10">{item.returnedQuantity || 0}</td>
                                        <td className="px-2 py-3 text-center text-xs text-rose-500 bg-rose-50/10">{formatNumber(item.returnUnitPrice || item.poUnitPrice || 0)}</td>
                                        <td className="px-2 py-3 text-center text-xs font-bold text-rose-600 bg-rose-50/20">
                                            {formatNumber(item.returnLineTotal || ((item.returnedQuantity || 0) * (item.returnUnitPrice || item.poUnitPrice || 0)))}
                                        </td>

                                        {/* GRN */}
                                        <td className="px-2 py-3 text-center text-xs text-amber-600 bg-amber-50/10">{item.grnQuantity ?? '—'}</td>
                                        <td className="px-2 py-3 text-center text-xs text-amber-600 bg-amber-50/10">{formatNumber(item.grnUnitPrice || 0)}</td>
                                        <td className="px-2 py-3 text-center text-xs font-bold text-amber-700 bg-amber-50/20">{formatNumber(item.grnLineTotal || 0)}</td>

                                        {/* Invoice */}
                                        <td className="px-2 py-3 text-center text-xs font-bold text-violet-600 bg-violet-50/10">{item.invoiceQuantity ?? '—'}</td>
                                        <td className="px-2 py-3 text-center text-xs font-bold text-violet-600 bg-violet-50/10">{formatNumber(item.invoiceUnitPrice || 0)}</td>
                                        <td className="px-2 py-3 text-center text-xs font-extrabold text-violet-700 bg-violet-50/20">{formatNumber(item.invoiceLineTotal || 0)}</td>

                                        <td className="px-4 py-3 text-center">
                                            {isAllMatch ? (
                                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-rose-100">
                                                    <XCircle className="w-4 h-4 text-rose-600" />
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={14} className="px-4 py-12 text-center">
                                        <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                        <p className="text-sm text-slate-400 font-semibold">لا توجد بيانات أصناف للمطابقة</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Returns Reconciliation ── */}
            {items.length > 0 && items.some(i => (i.returnedQuantity || 0) > 0) && (
                <div className="rounded-2xl border border-indigo-200 bg-white shadow-sm overflow-hidden">
                    <div className="relative bg-gradient-to-l from-indigo-50 via-violet-50/50 to-white px-6 py-4 border-b border-indigo-100">
                        <div className="absolute top-0 left-0 w-32 h-32 -translate-y-16 -translate-x-16 rounded-full bg-indigo-200/20" />
                        <h5 className="flex items-center gap-2 text-base font-extrabold text-indigo-800 relative">
                            <TrendingDown className="w-5 h-5 text-indigo-600" />
                            تسوية المرتجعات مع أمر الشراء
                        </h5>
                        <p className="text-[11px] text-indigo-400 font-semibold mt-0.5 relative">
                            صافي الكميات بعد خصم المرتجعات من أمر الشراء
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-indigo-50/50 border-b border-indigo-100">
                                    <th className="px-4 py-3 text-right text-xs font-extrabold text-indigo-700">الصنف</th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-blue-600">كمية PO</th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-rose-600">المرتجع</th>
                                    <th className="px-3 py-3 text-center text-xs font-extrabold text-indigo-700">الصافي</th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-slate-500">سعر الوحدة</th>
                                    <th className="px-3 py-3 text-center text-xs font-extrabold text-indigo-700">الإجمالي</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reconciliationItems.map((item, index) => (
                                    <tr key={index} className="border-b border-indigo-50 hover:bg-indigo-50/30 transition-colors">
                                        <td className="px-4 py-3 font-bold text-slate-800">{item.itemName}</td>
                                        <td className="px-3 py-3 text-center text-blue-600 font-semibold">{item.poQty}</td>
                                        <td className="px-3 py-3 text-center">
                                            {item.retQty > 0 ? (
                                                <span className="inline-flex items-center gap-1 text-rose-600 font-bold bg-rose-50 rounded-md px-2 py-0.5 text-xs">
                                                    − {item.retQty}
                                                </span>
                                            ) : (
                                                <span className="text-slate-300">0</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-3 text-center">
                                            <span className="inline-block font-extrabold text-indigo-700 bg-indigo-50 rounded-md px-2.5 py-0.5 text-xs">
                                                {item.netQty}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 text-center text-slate-600 font-semibold">{formatNumber(item.unitPrice)}</td>
                                        <td className="px-3 py-3 text-center font-extrabold text-indigo-700">{formatNumber(item.lineTotal)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary Footer */}
                    <div className="border-t-2 border-indigo-100 bg-gradient-to-l from-slate-50/80 to-indigo-50/30 px-6 py-5 space-y-1">
                        {[
                            { label: 'الإجمالي الفرعي', value: reconciliationSubTotal, show: true },
                            { label: 'يخصم: إجمالي الخصم', value: reconciliationDiscountAmount, show: reconciliationDiscountAmount > 0, negative: true },
                            { label: 'الإجمالي بعد الخصم', value: reconciliationSubTotal - reconciliationDiscountAmount, show: reconciliationDiscountAmount > 0 },
                            { label: 'يضاف: إجمالي الضريبة', value: reconciliationTaxAmount, show: reconciliationTaxAmount > 0, positive: true },
                        ].filter(r => r.show).map((row, idx) => (
                            <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-200/60 last:border-0">
                                <span className={`text-sm font-semibold ${row.negative ? 'text-rose-600' : row.positive ? 'text-emerald-600' : 'text-slate-600'
                                    }`}>
                                    {row.label}
                                </span>
                                <span className={`text-sm font-bold ${row.negative ? 'text-rose-600' : row.positive ? 'text-emerald-600' : 'text-slate-800'
                                    }`}>
                                    {row.negative ? '− ' : row.positive ? '+ ' : ''}{formatNumber(row.value)}
                                </span>
                            </div>
                        ))}

                        {/* Net Due */}
                        <div className="mt-3 flex items-center justify-between rounded-xl bg-gradient-to-l from-indigo-100 to-indigo-50 px-5 py-4">
                            <span className="text-base font-black text-indigo-800">صافي المستحق بعد التسوية</span>
                            <span className="text-xl font-black text-indigo-800 tracking-tight">
                                {formatNumber(netDueAfterReconciliation)}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoiceMatchingValidation;