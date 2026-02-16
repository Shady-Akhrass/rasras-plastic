import React from 'react';
import { CheckCircle2, XCircle, FileText, Package, ShoppingCart } from 'lucide-react';
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
    grnShippingCost?: number;
    grnOtherCosts?: number;
    invoiceTotal?: number;
    invoiceSubTotal?: number;
    invoiceTaxAmount?: number;
    invoiceDiscountAmount?: number;
    invoiceDeliveryCost?: number;
    invoiceOtherCosts?: number;
    isValid?: boolean;
    message?: string;
    items?: Array<{
        itemName: string;
        poQuantity?: number;
        grnQuantity?: number;
        invoiceQuantity?: number;
        poUnitPrice?: number;
        grnUnitPrice?: number;
        invoiceUnitPrice?: number;
        poLineTotal?: number;
        grnLineTotal?: number;
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
    isValid = false,
    message,
    items = []
}) => {
    const variance = grnTotal > 0 ? Math.abs((grnTotal - poTotal) / poTotal * 100) : 0;
    const isHighVariance = variance > 10;

    const CostRow = ({ label, po, grn, inv, isBold = false }: { label: string, po?: number, grn?: number, inv?: number, isBold?: boolean }) => (
        <div className={`grid grid-cols-4 gap-2 py-1 border-b border-slate-100 last:border-0 ${isBold ? 'font-bold text-slate-800' : 'text-slate-600 font-medium'}`}>
            <div className="text-xs">{label}</div>
            <div className="text-center text-xs">{formatNumber(po || 0)}</div>
            <div className="text-center text-xs">{formatNumber(grn || 0)}</div>
            <div className="text-center text-xs font-bold text-brand-primary">{formatNumber(inv || 0)}</div>
        </div>
    );

    return (
        <div className="space-y-6" dir="rtl">
            {/* Validation Status */}
            <div className={`p-4 rounded-2xl border-2 ${isValid ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                <div className="flex items-center gap-3">
                    {isValid ? (
                        <div className="p-2 bg-emerald-100 rounded-xl">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        </div>
                    ) : (
                        <div className="p-2 bg-rose-100 rounded-xl">
                            <XCircle className="w-6 h-6 text-rose-600" />
                        </div>
                    )}
                    <div>
                        <h4 className={`font-bold text-lg ${isValid ? 'text-emerald-800' : 'text-rose-800'}`}>
                            {isValid ? 'المطابقة صحيحة' : 'المطابقة غير صحيحة'}
                        </h4>
                        <p className={`text-sm ${isValid ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {message || (isValid ? 'تمت مطابقة الفاتورة بنجاح مع أمر الشراء وإذن الاستلام' : 'يوجد خطأ في مطابقة الفاتورة')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Documents Detailed Comparison */}
            <div className="bg-white rounded-2xl border-2 border-slate-100 overflow-hidden shadow-sm">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <h5 className="font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-brand-primary" />
                        مقارنة التكاليف الإجمالية
                    </h5>
                    <div className="flex items-center gap-6 text-xs font-bold">
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500" /> أمر الشراء</div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-amber-500" /> إذن الاستلام</div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-brand-primary" /> الفاتورة</div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-4 gap-2 mb-4 pb-2 border-b-2 border-slate-200 font-bold text-slate-600">
                        <div>البند</div>
                        <div className="text-center">أمر الشراء ({poNumber || '-'})</div>
                        <div className="text-center">إذن الاستلام ({grnNumber || '-'})</div>
                        <div className="text-center">الفاتورة ({invoiceNumber || '-'})</div>
                    </div>

                    <CostRow label="إجمالي البنود (Sub-total)" po={poSubTotal} grn={grnSubTotal} inv={invoiceSubTotal} />
                    <CostRow label="الخصم" po={poDiscountAmount} grn={grnDiscountAmount} inv={invoiceDiscountAmount} />
                    <CostRow label="الضريبة" po={poTaxAmount} grn={grnTaxAmount} inv={invoiceTaxAmount} />
                    <CostRow label="مصاريف النقل/التوصيل" po={poShippingCost} grn={grnShippingCost} inv={invoiceDeliveryCost} />
                    <CostRow label="مصاريف أخرى" po={poOtherCosts} grn={grnOtherCosts} inv={invoiceOtherCosts} />
                    <div className="mt-2 bg-slate-50 rounded-xl px-4 py-3">
                        <CostRow label="الإجمالي الكلي" po={poTotal} grn={grnTotal} inv={invoiceTotal} isBold={true} />
                    </div>
                </div>
            </div>

            {/* Variance Warning */}
            {isHighVariance && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                        <ShoppingCart className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-amber-800">
                            ⚠️ تفاوت في المبالغ: {variance.toFixed(1)}%
                        </p>
                        <p className="text-sm text-amber-700">
                            يوجد تفاوت كبير بين مبلغ إذن الاستلام وأمر الشراء. يرجى مراجعة تفاصيل الكميات والأسعار أدناه.
                        </p>
                    </div>
                </div>
            )}

            {/* Items Comparison Table */}
            <div className="bg-white rounded-2xl border-2 border-slate-100 overflow-hidden shadow-sm">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                    <h5 className="font-bold text-slate-800 flex items-center gap-2">
                        <Package className="w-5 h-5 text-brand-primary" />
                        مطابقة بنود الأصناف الجردية
                    </h5>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-100 border-b border-slate-200">
                                <th rowSpan={2} className="px-4 py-3 text-right font-bold text-slate-700 sticky right-0 bg-slate-100">الصنف</th>
                                <th colSpan={3} className="px-4 py-2 text-center font-bold text-blue-700 border-x border-slate-200">أمر الشراء (PO)</th>
                                <th colSpan={3} className="px-4 py-2 text-center font-bold text-amber-700 border-x border-slate-200">إذن الاستلام (GRN)</th>
                                <th colSpan={3} className="px-4 py-2 text-center font-bold text-brand-primary border-x border-slate-200">الفاتورة (Invoice)</th>
                                <th rowSpan={2} className="px-4 py-3 text-center font-bold text-slate-700">الحالة</th>
                            </tr>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-2 py-2 text-center text-[10px] text-slate-500 border-x border-slate-100">الكمية</th>
                                <th className="px-2 py-2 text-center text-[10px] text-slate-500 border-x border-slate-100">السعر</th>
                                <th className="px-2 py-2 text-center text-[10px] text-slate-500 border-x border-slate-100">الإجمالي</th>

                                <th className="px-2 py-2 text-center text-[10px] text-slate-500 border-x border-slate-100">الكمية</th>
                                <th className="px-2 py-2 text-center text-[10px] text-slate-500 border-x border-slate-100">السعر</th>
                                <th className="px-2 py-2 text-center text-[10px] text-slate-500 border-x border-slate-100">الإجمالي</th>

                                <th className="px-2 py-2 text-center text-[10px] text-slate-500 border-x border-slate-100">الكمية</th>
                                <th className="px-2 py-2 text-center text-[10px] text-slate-500 border-x border-slate-100">السعر</th>
                                <th className="px-2 py-2 text-center text-[10px] text-slate-500 border-x border-slate-100">الإجمالي</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items.length > 0 ? items.map((item, index) => {
                                // Match logic: Invoice Qty & Price should match GRN/PO
                                const qtyMatch = (item.invoiceQuantity || 0) === (item.grnQuantity || 0);
                                const priceMatch = (item.invoiceUnitPrice || 0) === (item.poUnitPrice || 0);
                                const isAllMatch = qtyMatch && priceMatch;

                                return (
                                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 font-semibold text-slate-800 sticky right-0 bg-white">
                                            {item.itemName}
                                        </td>

                                        {/* PO columns */}
                                        <td className="px-2 py-3 text-center text-blue-600 bg-blue-50/20">{item.poQuantity}</td>
                                        <td className="px-2 py-3 text-center text-blue-600 bg-blue-50/20">{formatNumber(item.poUnitPrice || 0)}</td>
                                        <td className="px-2 py-3 text-center font-bold text-blue-700 bg-blue-50/40">{formatNumber(item.poLineTotal || 0)}</td>

                                        {/* GRN columns */}
                                        <td className="px-2 py-3 text-center text-amber-600 bg-amber-50/20">{item.grnQuantity}</td>
                                        <td className="px-2 py-3 text-center text-amber-600 bg-amber-50/20">{formatNumber(item.grnUnitPrice || 0)}</td>
                                        <td className="px-2 py-3 text-center font-bold text-amber-700 bg-amber-50/40">{formatNumber(item.grnLineTotal || 0)}</td>

                                        {/* Invoice columns */}
                                        <td className="px-2 py-3 text-center font-bold text-brand-primary bg-emerald-50/20">{item.invoiceQuantity}</td>
                                        <td className="px-2 py-3 text-center font-bold text-brand-primary bg-emerald-50/20">{formatNumber(item.invoiceUnitPrice || 0)}</td>
                                        <td className="px-2 py-3 text-center font-black text-brand-primary bg-emerald-50/40">{formatNumber(item.invoiceLineTotal || 0)}</td>

                                        <td className="px-4 py-3 text-center">
                                            {isAllMatch ? (
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-rose-500 mx-auto" />
                                            )}
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={11} className="px-4 py-8 text-center text-slate-500 italic">
                                        لا توجد بيانات أصناف للمطابقة
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InvoiceMatchingValidation;
