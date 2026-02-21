import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    Save,
    Plus,
    Trash2,
    Tag,
    Calendar,
    Users,
    DollarSign,
    FileText,
    CreditCard,
    ArrowRight,
    Clock,
    CheckCircle2,
    AlertCircle,
    Info,
    Package,
    RefreshCw,
    Eye,
    ShoppingCart,
    Truck,
    XCircle,
    Lock,
    Sparkles
} from 'lucide-react';
import { salesQuotationService, type SalesQuotationDto, type SalesQuotationItemDto } from '../../services/salesQuotationService';
import { customerRequestService } from '../../services/customerRequestService';
import type { CustomerRequest } from '../../types/sales';
import customerService, { type Customer } from '../../services/customerService';
import { itemService, type ItemDto } from '../../services/itemService';
import { priceListService, type PriceListDto, type PriceListItemDto } from '../../services/priceListService';
import { approvalService } from '../../services/approvalService';
import { toast } from 'react-hot-toast';
import { formatNumber } from '../../utils/format';
import { useSystemSettings } from '../../hooks/useSystemSettings';

// ──────────────────────────────────────────────
// 🔧 SAFE DATA EXTRACTION HELPERS
// ──────────────────────────────────────────────

/** Safely extract an array from any API response shape */
const extractArray = <T,>(response: any): T[] => {
    if (!response) return [];
    // Direct array
    if (Array.isArray(response)) return response;
    // { data: { data: [...] } }
    if (response?.data?.data && Array.isArray(response.data.data)) return response.data.data;
    // { data: [...] }
    if (response?.data && Array.isArray(response.data)) return response.data;
    // { items: [...] }  (some endpoints)
    if (response?.items && Array.isArray(response.items)) return response.items;
    // { result: [...] }
    if (response?.result && Array.isArray(response.result)) return response.result;
    return [];
};

/** Safely extract a single object from any API response shape */
const extractObject = <T,>(response: any): T | null => {
    if (!response) return null;
    // { data: { data: { ... } } }
    if (response?.data?.data && typeof response.data.data === 'object' && !Array.isArray(response.data.data)) {
        return response.data.data as T;
    }
    // { data: { ... } }
    if (response?.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        return response.data as T;
    }
    // Direct object (not array)
    if (typeof response === 'object' && !Array.isArray(response) && !response.data) {
        return response as T;
    }
    return response as T;
};

/** Safe number parser — never returns NaN */
const safeNumber = (value: any, fallback: number = 0): number => {
    if (value === null || value === undefined || value === '') return fallback;
    const num = typeof value === 'string' ? parseFloat(value) : Number(value);
    return isNaN(num) || !isFinite(num) ? fallback : num;
};

/** Extract price from a PriceListItemDto regardless of field name */
const extractPrice = (pli: PriceListItemDto | null | undefined): number => {
    if (!pli) return 0;
    const price =
        (pli as any).unitPrice ??
        (pli as any).price ??
        (pli as any).sellingPrice ??
        (pli as any).listPrice ??
        0;
    return safeNumber(price);
};

/** Extract itemId from a request item regardless of field name */
const extractItemId = (reqItem: any): number => {
    return safeNumber(reqItem?.productId || reqItem?.itemId || reqItem?.product_id || reqItem?.item_id);
};

/** Extract quantity from a request item */
const extractQuantity = (reqItem: any): number => {
    return safeNumber(reqItem?.quantity || reqItem?.qty || reqItem?.requestedQuantity);
};

/** Extract item name from various sources */
const extractItemName = (reqItem: any, itemDef?: ItemDto | null, pli?: PriceListItemDto | null): string => {
    return (
        itemDef?.itemNameAr ||
        (pli as any)?.itemNameAr ||
        (pli as any)?.itemName ||
        reqItem?.productName ||
        reqItem?.itemName ||
        reqItem?.productNameAr ||
        reqItem?.itemNameAr ||
        ''
    );
};

/** Extract unit ID from item definition or request item */
const extractUnitId = (itemDef?: ItemDto | null, reqItem?: any): number => {
    return safeNumber(
        itemDef?.unitId ||
        (itemDef as any)?.uomId ||
        (itemDef as any)?.unit_id ||
        reqItem?.unitId ||
        reqItem?.uomId ||
        reqItem?.unit_id
    );
};


// ──────────────────────────────────────────────
// COMPONENT
// ──────────────────────────────────────────────

const QuotationFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const isView = queryParams.get('mode') === 'view';
    const isNew = !id || id === 'new';
    const isEdit = !isNew;
    const { defaultCurrency } = useSystemSettings();

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [items, setItems] = useState<ItemDto[]>([]);
    const [priceListItems, setPriceListItems] = useState<PriceListItemDto[]>([]);
    const [allPriceListsWithItems, setAllPriceListsWithItems] = useState<PriceListDto[]>([]);
    const [approvedRequests, setApprovedRequests] = useState<CustomerRequest[]>([]);
    const [allQuotations, setAllQuotations] = useState<SalesQuotationDto[]>([]);
    const [selectedRequestId, setSelectedRequestId] = useState<number | ''>('');
    const approvalId = queryParams.get('approvalId');

    const [form, setForm] = useState<SalesQuotationDto>({
        quotationDate: new Date().toISOString().split('T')[0],
        validUntilDate: '',
        customerId: 0,
        priceListId: 0,
        currency: defaultCurrency || 'EGP',
        exchangeRate: 1,
        paymentTerms: '',
        taxAmount: 0,
        deliveryCost: 0,
        otherCosts: 0,
        notes: '',
        status: 'Draft',
        requestId: undefined,
        items: []
    });

    // Sync currency when defaultCurrency loads asynchronously
    useEffect(() => {
        if (defaultCurrency && isNew) {
            setForm(f => ({ ...f, currency: f.currency || defaultCurrency }));
        }
    }, [defaultCurrency, isNew]);

    // ──────────────────────────────────────────
    // Price list helpers
    // ──────────────────────────────────────────

    const findItemInPriceLists = useCallback((
        itemId: number,
        preferredPriceListId?: number
    ): { priceList: PriceListDto; priceListItem: PriceListItemDto } | null => {
        if (!itemId) return null;

        // Try preferred price list first
        if (preferredPriceListId) {
            const preferred = allPriceListsWithItems.find(pl =>
                safeNumber(pl.id) === preferredPriceListId
            );
            if (preferred) {
                const pli = (preferred.items || []).find(p =>
                    safeNumber(p.itemId) === itemId
                );
                if (pli) return { priceList: preferred, priceListItem: pli };
            }
        }

        // Search all price lists
        for (const pl of allPriceListsWithItems) {
            const pli = (pl.items || []).find(p =>
                safeNumber(p.itemId) === itemId
            );
            if (pli) return { priceList: pl, priceListItem: pli };
        }

        return null;
    }, [allPriceListsWithItems]);

    const allPriceListItemIds = useMemo(() => {
        const ids = new Set<number>();
        allPriceListsWithItems.forEach(pl => {
            (pl.items || []).forEach(pli => {
                const itemId = safeNumber(pli.itemId);
                if (itemId > 0) ids.add(itemId);
            });
        });
        return ids;
    }, [allPriceListsWithItems]);

    const getPriceFromList = useCallback((
        itemId: number,
        currentList: PriceListItemDto[] = priceListItems
    ): number => {
        if (!itemId || !currentList?.length) return 0;
        const pli = currentList.find(p => safeNumber(p.itemId) === itemId);
        return extractPrice(pli);
    }, [priceListItems]);

    // ──────────────────────────────────────────
    // Data Loading
    // ──────────────────────────────────────────

    const loadPriceListItems = useCallback(async (priceListId: number) => {
        if (!priceListId) {
            setPriceListItems([]);
            return [];
        }

        // Try preloaded first
        const preloaded = allPriceListsWithItems.find(pl =>
            safeNumber(pl.id) === priceListId
        );
        if (preloaded?.items?.length) {
            setPriceListItems(preloaded.items);
            return preloaded.items;
        }

        // Fetch from API
        try {
            const res = await priceListService.getPriceListById(priceListId);
            const data = extractObject<PriceListDto>(res);
            const plItems = data?.items || [];
            setPriceListItems(plItems);
            return plItems;
        } catch (err) {
            console.error('Failed to load price list items:', err);
            setPriceListItems([]);
            return [];
        }
    }, [allPriceListsWithItems]);

    const loadInitialData = useCallback(async () => {
        try {
            const [customersRes, itemsRes, priceListsRes] = await Promise.all([
                customerService.getActiveCustomers().catch(() => []),
                itemService.getActiveItems().catch(() => []),
                priceListService.getAllPriceLists().catch(() => [])
            ]);

            // 🔧 FIX: Safely extract arrays from any response shape
            const loadedCustomers = extractArray<Customer>(customersRes);
            const loadedItems = extractArray<ItemDto>(itemsRes);
            const loadedPriceLists = extractArray<PriceListDto>(priceListsRes);

            setCustomers(loadedCustomers);
            setItems(loadedItems);

            const activeSelling = loadedPriceLists.filter(
                (pl: PriceListDto) =>
                    (pl.listType === 'SELLING' || pl.listType === 'Selling' || (pl as any).type === 'SELLING') &&
                    (pl.isActive !== false) // treat undefined as active
            );

            // Load items for each price list
            const listsWithItems: PriceListDto[] = await Promise.all(
                activeSelling.map(async (pl: PriceListDto) => {
                    const plId = safeNumber(pl.id);
                    if (!plId) return { ...pl, items: [] };
                    try {
                        const res = await priceListService.getPriceListById(plId);
                        const data = extractObject<PriceListDto>(res);
                        return {
                            ...pl,
                            items: data?.items || extractArray<PriceListItemDto>(res)
                        };
                    } catch {
                        return { ...pl, items: [] };
                    }
                })
            );
            setAllPriceListsWithItems(listsWithItems);

            // Load requests and quotations
            try {
                const [reqsRes, quotsRes] = await Promise.all([
                    customerRequestService.getAllRequests().catch(() => []),
                    salesQuotationService.getAll().catch(() => [])
                ]);

                // 🔧 FIX: Safely extract arrays
                const allRequests = extractArray<CustomerRequest>(reqsRes);
                const allQuots = extractArray<SalesQuotationDto>(quotsRes);

                const approved = allRequests.filter(r =>
                    r.status === 'Approved' || r.status === 'approved'
                );
                setApprovedRequests(approved);
                setAllQuotations(allQuots);
            } catch {
                console.error('Failed to load customer requests or quotations');
            }
        } catch {
            toast.error('فشل تحميل البيانات الأساسية');
        }
    }, []);

    const filteredRequests = useMemo(() => {
        const currentId = safeNumber(id);
        const usedRequestIds = new Set(
            allQuotations
                .filter(q => safeNumber(q.id) !== currentId)
                .map(q => safeNumber(q.requestId))
                .filter(rid => rid > 0)
        );
        return approvedRequests.filter(r =>
            !usedRequestIds.has(safeNumber(r.requestId))
        );
    }, [approvedRequests, allQuotations, id]);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    // ──────────────────────────────────────────
    // Request Selection Handler
    // ──────────────────────────────────────────

    const handleRequestSelection = useCallback(async (requestId: number) => {
        setSelectedRequestId(requestId);
        if (!requestId) {
            setForm(f => ({ ...f, requestId: undefined, items: [] }));
            return;
        }

        const request = approvedRequests.find(r =>
            safeNumber(r.requestId) === requestId
        );
        if (!request) {
            toast.error('طلب العميل غير موجود');
            return;
        }

        const priceListId = safeNumber(request.priceListId || form.priceListId);

        // Load price list items and collect them to use immediately for mapping
        let currentPriceListItems = priceListItems;
        if (priceListId) {
            const preloaded = allPriceListsWithItems.find(pl =>
                safeNumber(pl.id) === priceListId
            );
            if (preloaded?.items?.length) {
                currentPriceListItems = preloaded.items;
                setPriceListItems(currentPriceListItems);
            } else {
                try {
                    const res = await priceListService.getPriceListById(priceListId);
                    const data = extractObject<PriceListDto>(res);
                    currentPriceListItems = data?.items || [];
                    setPriceListItems(currentPriceListItems);
                } catch (error) {
                    console.error('Failed to load price list items:', error);
                }
            }
        }

        // 🔧 FIX: Map request items with safe extraction
        const requestItems = extractArray<any>(request.items || []);
        let quotationItems: SalesQuotationItemDto[] = [];

        if (requestItems.length > 0) {
            quotationItems = requestItems.map(reqItem => {
                const productId = extractItemId(reqItem);
                const itemDef = items.find(i => safeNumber(i.id) === productId);

                const found = findItemInPriceLists(productId, priceListId || undefined);
                const price = found
                    ? extractPrice(found.priceListItem)
                    : getPriceFromList(productId, currentPriceListItems);

                const qty = extractQuantity(reqItem);

                return {
                    itemId: productId,
                    quantity: qty,
                    unitId: extractUnitId(itemDef, reqItem),
                    unitPrice: price,
                    discountPercentage: 0,
                    taxPercentage: 14,
                    totalPrice: qty * price,
                    itemNameAr: extractItemName(reqItem, itemDef, found?.priceListItem)
                };
            });
        }

        // 🔧 CONSOLIDATED UPDATE: Apply all changes in a single setForm call to avoid race conditions
        setForm(f => ({
            ...f,
            customerId: safeNumber(request.customerId),
            priceListId: priceListId,
            requestId: requestId,
            items: quotationItems
        }));

        if (quotationItems.length > 0) {
            toast.success('تم استيراد البيانات من طلب العميل');
        }
    }, [approvedRequests, form.priceListId, priceListItems, allPriceListsWithItems, items, findItemInPriceLists, getPriceFromList]);

    // ──────────────────────────────────────────
    // Load existing quotation
    // ──────────────────────────────────────────

    useEffect(() => {
        if (!isNew && id) {
            setLoading(true);
            const loadQuotation = async () => {
                try {
                    const res = await salesQuotationService.getById(parseInt(id));

                    // 🔧 FIX: Safely extract quotation object
                    const q = extractObject<SalesQuotationDto>(res);

                    if (q) {
                        // 🔧 FIX: Normalize items array
                        const normalizedItems: SalesQuotationItemDto[] = extractArray<SalesQuotationItemDto>(
                            q.items
                        ).map(item => ({
                            ...item,
                            itemId: safeNumber(item.itemId || (item as any).productId),
                            quantity: safeNumber(item.quantity || (item as any).qty),
                            unitId: safeNumber(item.unitId || (item as any).uomId),
                            unitPrice: safeNumber(item.unitPrice || (item as any).price),
                            discountPercentage: safeNumber(item.discountPercentage),
                            taxPercentage: safeNumber(item.taxPercentage, 14),
                            totalPrice: safeNumber(item.totalPrice)
                        }));

                        setForm({
                            ...q,
                            customerId: safeNumber(q.customerId),
                            priceListId: safeNumber(q.priceListId),
                            taxAmount: safeNumber(q.taxAmount),
                            deliveryCost: safeNumber(q.deliveryCost),
                            otherCosts: safeNumber(q.otherCosts),
                            exchangeRate: safeNumber(q.exchangeRate, 1),
                            items: normalizedItems
                        });

                        if (q.requestId) setSelectedRequestId(safeNumber(q.requestId));

                        const plId = safeNumber(q.priceListId);
                        if (plId) {
                            loadPriceListItems(plId);
                        }
                    } else {
                        toast.error('العرض غير موجود');
                        navigate('/dashboard/sales/quotations');
                    }
                } catch (err) {
                    console.error('Failed to load quotation:', err);
                    toast.error('فشل تحميل بيانات العرض');
                    navigate('/dashboard/sales/quotations');
                } finally {
                    setLoading(false);
                }
            };
            loadQuotation();
        }
    }, [id, isNew, navigate, loadPriceListItems]);

    // ──────────────────────────────────────────
    // Customer & Price List Change Handlers
    // ──────────────────────────────────────────

    const handleCustomerChange = useCallback((customerId: number) => {
        setForm(f => ({ ...f, customerId }));
        const customer = customers.find(c => safeNumber(c.id) === customerId);

        const customerPriceListId = safeNumber(
            customer?.priceListId || (customer as any)?.price_list_id
        );

        if (customerPriceListId > 0) {
            onPriceListChange(customerPriceListId);
        } else {
            onPriceListChange(0);
        }
    }, [customers]);

    const onPriceListChange = useCallback(async (priceListId: number) => {
        setForm(f => ({ ...f, priceListId }));

        if (!priceListId) {
            setPriceListItems([]);
            return;
        }

        try {
            const preloaded = allPriceListsWithItems.find(pl =>
                safeNumber(pl.id) === priceListId
            );
            let newPriceListItems: PriceListItemDto[];

            if (preloaded?.items?.length) {
                newPriceListItems = preloaded.items;
            } else {
                const res = await priceListService.getPriceListById(priceListId);
                const data = extractObject<PriceListDto>(res);
                newPriceListItems = data?.items || [];
            }
            setPriceListItems(newPriceListItems);

            // Update existing item prices
            setForm(f => {
                if (!f.items.length) return f;
                const updatedItems = f.items.map(item => {
                    const itemId = safeNumber(item.itemId);
                    const price = getPriceFromList(itemId, newPriceListItems);
                    const qty = safeNumber(item.quantity);
                    const disc = safeNumber(item.discountPercentage);
                    return {
                        ...item,
                        unitPrice: price,
                        totalPrice: qty * price * (1 - disc / 100)
                    };
                });
                return { ...f, items: updatedItems };
            });
            toast.success('تم تحديث الأسعار حسب القائمة المختارة');
        } catch {
            toast.error('فشل تحميل أسعار القائمة');
        }
    }, [allPriceListsWithItems, getPriceFromList]);

    // ──────────────────────────────────────────
    // Item CRUD
    // ──────────────────────────────────────────

    const addItem = () => {
        setForm(f => ({
            ...f,
            items: [...f.items, {
                itemId: 0,
                quantity: 1,
                unitId: 0,
                unitPrice: 0,
                discountPercentage: 0,
                taxPercentage: 14,
                totalPrice: 0
            }]
        }));
    };

    const removeItem = (idx: number) => {
        setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
    };

    const updateItem = useCallback((idx: number, updates: Partial<SalesQuotationItemDto>) => {
        const newItemId = safeNumber(updates.itemId);

        if (newItemId > 0) {
            const found = findItemInPriceLists(newItemId, form.priceListId || undefined);
            if (found?.priceList?.items) {
                setPriceListItems(found.priceList.items);
            }
        }

        setForm(f => {
            const newItems = [...f.items];
            if (idx < 0 || idx >= newItems.length) return f;

            const item = { ...newItems[idx], ...updates };
            let newPriceListId = f.priceListId;

            if (newItemId > 0) {
                const selectedItem = items.find(i => safeNumber(i.id) === newItemId);
                if (selectedItem) {
                    item.unitId = extractUnitId(selectedItem);
                }

                const found = findItemInPriceLists(newItemId, safeNumber(f.priceListId) || undefined);

                if (found) {
                    item.unitPrice = extractPrice(found.priceListItem);
                    const foundPlId = safeNumber(found.priceList.id);
                    if (foundPlId > 0) {
                        newPriceListId = foundPlId;
                    }
                } else {
                    item.unitPrice = getPriceFromList(newItemId);
                }
            }

            const qty = safeNumber(item.quantity);
            const price = safeNumber(item.unitPrice);
            const disc = safeNumber(item.discountPercentage);
            const taxPerc = safeNumber(item.taxPercentage);
            const beforeTax = qty * price * (1 - disc / 100);
            item.totalPrice = beforeTax * (1 + taxPerc / 100);

            newItems[idx] = item;
            return { ...f, items: newItems, priceListId: newPriceListId };
        });
    }, [items, form.priceListId, findItemInPriceLists, getPriceFromList]);

    // ──────────────────────────────────────────
    // Computed Totals
    // ──────────────────────────────────────────

    // 1. Raw total before any discounts
    const rawItemsTotal = useMemo(() =>
        form.items.reduce((s, i) => s + (safeNumber(i.quantity) * safeNumber(i.unitPrice)), 0)
        , [form.items]);

    // 2. Sum of all line item discounts
    const itemDiscountsTotal = useMemo(() =>
        form.items.reduce((s, i) => {
            const qty = safeNumber(i.quantity);
            const price = safeNumber(i.unitPrice);
            const disc = safeNumber(i.discountPercentage);
            return s + (qty * price * (disc / 100));
        }, 0)
        , [form.items]);

    // 3. Subtotal AFTER item discounts
    const subtotal = rawItemsTotal - itemDiscountsTotal;

    // 6. Tax aggregate
    const totalTaxAmount = useMemo(() =>
        form.items.reduce((sum, i) => {
            const qty = safeNumber(i.quantity);
            const price = safeNumber(i.unitPrice);
            const disc = safeNumber(i.discountPercentage);
            const taxPerc = safeNumber(i.taxPercentage);
            const beforeTax = qty * price * (1 - disc / 100);
            return sum + (beforeTax * (taxPerc / 100));
        }, 0)
        , [form.items]);

    const delivery = safeNumber(form.deliveryCost);
    const other = safeNumber(form.otherCosts);
    const grandTotal = subtotal + totalTaxAmount + delivery + other;

    // ──────────────────────────────────────────
    // Form Submission
    // ──────────────────────────────────────────

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLocked) return;
        if (form.approvalStatus === 'Approved') return;
        if (!form.customerId) { toast.error('يرجى اختيار العميل'); return; }
        if (isNew && !selectedRequestId) { toast.error('يرجى اختيار طلب عميل لاستيراد البيانات'); return; }
        if (form.items.length === 0) { toast.error('يرجى إضافة بند واحد على الأقل'); return; }

        // Validate items have valid data
        const invalidItems = form.items.filter(item =>
            safeNumber(item.itemId) === 0 || safeNumber(item.quantity) <= 0
        );
        if (invalidItems.length > 0) {
            toast.error('يرجى التأكد من اختيار الصنف والكمية لجميع البنود');
            return;
        }

        setSaving(true);
        try {
            const payload: SalesQuotationDto = {
                ...form,
                subTotal: subtotal,
                discountAmount: itemDiscountsTotal,
                taxAmount: totalTaxAmount,
                totalAmount: grandTotal
            };

            let savedQuotation: SalesQuotationDto | null = null;
            if (isNew) {
                savedQuotation = await salesQuotationService.create(payload);
                toast.success('تم إنشاء عرض السعر بنجاح');
            } else {
                savedQuotation = await salesQuotationService.update(parseInt(id!), payload);
                toast.success('تم تحديث عرض السعر بنجاح');
            }

            // NEW: Automatically trigger approval submission
            if (savedQuotation && savedQuotation.id) {
                const updated = extractObject<SalesQuotationDto>(savedQuotation) || savedQuotation;
                const finalId = updated.id || parseInt(id!);

                try {
                    await salesQuotationService.submitForApproval(finalId);
                    toast.success('تم إرسال العرض للاعتماد تلقائياً');
                } catch (approveErr) {
                    console.error('Failed to auto-submit for approval:', approveErr);
                    toast.error('تم حفظ العرض ولكن فشل الإرسال التلقائي للاعتماد');
                }
            }

            navigate('/dashboard/sales/quotations');
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                'فشل حفظ عرض السعر';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleApprovalAction = async (action: 'Approved' | 'Rejected') => {
        if (!approvalId) return;
        try {
            setProcessing(true);
            const toastId = toast.loading('جاري تنفيذ الإجراء...');
            await approvalService.takeAction(parseInt(approvalId), 1, action);
            toast.success(
                action === 'Approved' ? 'تم الاعتماد بنجاح' : 'تم رفض الطلب',
                { id: toastId }
            );
            navigate('/dashboard/sales/approvals');
        } catch {
            toast.error('فشل تنفيذ الإجراء');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">جاري التحميل...</div>;

    const isLocked = isView || (isEdit && form.status !== 'Draft' && form.status !== 'Rejected');

    return (
        <div className="space-y-6 pb-20" dir="rtl">
            <style>{`
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-slide-in { animation: slideInRight 0.4s ease-out; }
            `}</style>

            {/* Premium Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 
                rounded-3xl p-8 text-white shadow-2xl">
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => navigate('/dashboard/sales/quotations')}
                            className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-2xl border border-white/20 
                                hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
                        >
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                            <Tag className="w-10 h-10" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold">
                                    {isView ? `عرض سعر #${form.quotationNumber || ''}` : isNew ? 'تسجيل عرض سعر جديد' : `تعديل عرض سعر #${form.quotationNumber || ''}`}
                                </h1>
                                {isLocked && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-lg text-xs font-bold border border-white/20">
                                        <Lock className="w-3 h-3" /> للعرض فقط
                                    </span>
                                )}
                                {form.approvalStatus && (
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${form.approvalStatus === 'Approved' ? 'bg-emerald-500/20 text-white border-emerald-300/30' :
                                        form.approvalStatus === 'Rejected' ? 'bg-rose-500/20 text-white border-rose-300/30' :
                                            form.approvalStatus === 'Pending' ? 'bg-amber-500/20 text-white border-amber-300/30' :
                                                'bg-slate-500/20 text-white border-slate-300/30'
                                        }`}>
                                        {form.approvalStatus === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                                        {form.approvalStatus === 'Rejected' && <XCircle className="w-3 h-3" />}
                                        {form.approvalStatus === 'Pending' && <Clock className="w-3 h-3" />}
                                        {form.approvalStatus === 'Approved' ? 'معتمد' :
                                            form.approvalStatus === 'Rejected' ? 'مرفوض' :
                                                form.approvalStatus === 'Pending' ? 'قيد الانتظار' : form.approvalStatus}
                                    </span>
                                )}
                            </div>
                            <p className="text-white/80 text-lg">أدخل تفاصيل عرض السعر والخصومات والضرائب</p>
                        </div>
                    </div>

                    <div className="flex gap-3 flex-wrap">
                        {isView && approvalId && (
                            <>
                                <button
                                    onClick={() => handleApprovalAction('Approved')}
                                    disabled={processing}
                                    className="flex items-center gap-2 px-6 py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-xl hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                                >
                                    {processing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                    <span>اعتماد</span>
                                </button>
                                <button
                                    onClick={() => handleApprovalAction('Rejected')}
                                    disabled={processing}
                                    className="flex items-center gap-2 px-6 py-4 bg-rose-500 text-white rounded-2xl font-bold shadow-xl hover:bg-rose-600 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                                >
                                    {processing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                                    <span>رفض</span>
                                </button>
                                <div className="flex items-center gap-2 px-6 py-4 bg-amber-500/20 text-white rounded-2xl border border-white/30 backdrop-blur-sm">
                                    <Eye className="w-5 h-5" />
                                    <span className="font-bold">عرض من صندوق الاعتماد</span>
                                </div>
                            </>
                        )}
                        {isView && !approvalId && (
                            <div className="flex items-center gap-2 px-6 py-4 bg-amber-500/20 text-white rounded-2xl border border-white/30 backdrop-blur-sm">
                                <Eye className="w-5 h-5" />
                                <span className="font-bold">وضع العرض فقط</span>
                            </div>
                        )}
                        {form.status === 'Approved' && form.approvalStatus === 'Approved' && (
                            <button
                                onClick={async () => {
                                    if (window.confirm('هل أنت متأكد من تحويل هذا العرض إلى طلب مبيعات؟')) {
                                        try {
                                            setSaving(true);
                                            await salesQuotationService.convertToSalesOrder(parseInt(id!));
                                            toast.success('تم تحويل العرض إلى طلب مبيعات بنجاح');
                                            navigate('/dashboard/sales/orders');
                                        } catch {
                                            toast.error('فشل تحويل العرض');
                                        } finally {
                                            setSaving(false);
                                        }
                                    }
                                }}
                                disabled={saving}
                                className="flex items-center gap-3 px-8 py-4 bg-white text-emerald-600 rounded-2xl 
                                    font-bold shadow-xl hover:scale-105 active:scale-95 transition-all 
                                    disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                <span>تحويل لطلب مبيعات</span>
                            </button>
                        )}
                        {!isLocked && (
                            <>
                                <button
                                    onClick={handleSubmit}
                                    disabled={saving}
                                    className="flex items-center gap-3 px-8 py-4 bg-white text-emerald-600 rounded-2xl 
                                        font-bold shadow-xl hover:scale-105 active:scale-95 transition-all 
                                        disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                >
                                    {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    <span>{saving ? 'جاري الحفظ...' : 'حفظ عرض السعر'}</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Basic Info Card */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-slide-in">
                        <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-brand-primary/10 rounded-xl">
                                    <FileText className="w-5 h-5 text-brand-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">البيانات الأساسية</h3>
                                    <p className="text-slate-500 text-sm">المعلومات الأساسية لعرض السعر</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Customer Request Selection */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                        <FileText className="w-4 h-4 text-fuchsia-500" />
                                        اختيار طلب عميل <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={selectedRequestId}
                                        onChange={(e) => handleRequestSelection(safeNumber(e.target.value))}
                                        className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all
                                        ${isLocked
                                                ? 'bg-slate-100 border-transparent cursor-not-allowed opacity-70 text-slate-500 font-bold'
                                                : 'border-slate-100 focus:border-indigo-500 bg-slate-50/50'}`}
                                        disabled={isLocked || !isNew}
                                        required
                                    >
                                        <option value="">-- اختر طلب عميل للاستيراد منه --</option>
                                        {filteredRequests.map((r) => {
                                            const reqId = safeNumber(r.requestId);
                                            const custName = customers.find(c =>
                                                safeNumber(c.id) === safeNumber(r.customerId)
                                            )?.customerNameAr || 'عميل غير معروف';
                                            const dateStr = r.requestDate
                                                ? new Date(r.requestDate).toLocaleDateString('ar-EG')
                                                : '';
                                            return (
                                                <option key={reqId} value={reqId}>
                                                    CR-{reqId} - {custName} {dateStr && `(${dateStr})`}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    {!isNew && form.requestId && (
                                        <p className="text-xs text-slate-400 mt-1">
                                            مرتبط بطلب العميل CR-{form.requestId}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                        <Users className="w-4 h-4 text-brand-primary" />
                                        العميل <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={form.customerId || ''}
                                        onChange={(e) => handleCustomerChange(safeNumber(e.target.value))}
                                        className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all
                                        ${isLocked
                                                ? 'bg-slate-100 border-transparent cursor-not-allowed opacity-70 text-slate-500 font-bold'
                                                : 'border-slate-100 focus:border-indigo-500 bg-slate-50/50'}`}
                                        required
                                        disabled={isLocked}
                                    >
                                        <option value="">اختر العميل...</option>
                                        {customers.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.customerNameAr} ({c.customerCode})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-brand-primary" />
                                        تاريخ العرض <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={form.quotationDate || ''}
                                        onChange={(e) => setForm(f => ({ ...f, quotationDate: e.target.value }))}
                                        min={new Date().toISOString().split('T')[0]}
                                        className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all
                                        ${isLocked
                                                ? 'bg-slate-100 border-transparent cursor-not-allowed opacity-70 text-slate-500 font-bold'
                                                : 'border-slate-100 focus:border-indigo-500 bg-slate-50/50'}`}
                                        required
                                        disabled={isLocked}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                        <Clock className="w-4 h-4 text-rose-500" />
                                        صلاحية العرض
                                    </label>
                                    <input
                                        type="date"
                                        value={form.validUntilDate || ''}
                                        onChange={(e) => setForm(f => ({ ...f, validUntilDate: e.target.value }))}
                                        min={new Date().toISOString().split('T')[0]}
                                        className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all
                                        ${isLocked
                                                ? 'bg-slate-100 border-transparent cursor-not-allowed opacity-70 text-slate-500 font-bold'
                                                : 'border-slate-100 focus:border-indigo-500 bg-slate-50/50'}`}
                                        disabled={isLocked}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-indigo-500" />
                                        شروط الدفع
                                    </label>
                                    <input
                                        type="text"
                                        value={form.paymentTerms || ''}
                                        onChange={(e) => setForm(f => ({ ...f, paymentTerms: e.target.value }))}
                                        className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all text-right
                                        ${isLocked
                                                ? 'bg-slate-100 border-transparent cursor-not-allowed opacity-70 text-slate-500 font-medium'
                                                : 'border-slate-100 focus:border-indigo-500 bg-slate-50/50'}`}
                                        placeholder="مثال: آجل 30 يوم"
                                        disabled={isLocked}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                        <DollarSign className="w-4 h-4 text-emerald-500" />
                                        العملة
                                    </label>
                                    <input
                                        type="text"
                                        value={form.currency || ''}
                                        readOnly
                                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-50 bg-slate-100 text-slate-500 font-bold outline-none cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <Info className="w-4 h-4 text-slate-500" />
                                    ملاحظات
                                </label>
                                <textarea
                                    value={form.notes || ''}
                                    onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all bg-slate-50/50 text-right resize-none"
                                    placeholder="أي ملاحظات إضافية لعرض السعر..."
                                    disabled={isLocked}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Items Card */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in"
                        style={{ animationDelay: '100ms' }}>

                        {/* Header */}
                        <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-100 rounded-xl">
                                    <ShoppingCart className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">الأصناف المسعرة</h3>
                                    <p className="text-slate-500 text-sm">قائمة الأصناف وأسعارها في العرض</p>
                                </div>
                            </div>
                        </div>

                        {/* Table Content */}
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px]">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-600 text-sm font-bold border-b border-slate-200">
                                        <th className="py-4 pr-6 text-right">
                                            الصنف <span className="text-rose-500">*</span>
                                        </th>
                                        <th className="py-4 px-4 text-center">
                                            الكمية <span className="text-rose-500">*</span>
                                        </th>
                                        <th className="py-4 px-4 text-center">
                                            السعر <span className="text-rose-500">*</span>
                                        </th>
                                        <th className="py-4 px-4 text-center">درجة البوليمر</th>
                                        <th className="py-4 px-4 text-center">خصم %</th>
                                        <th className="py-4 px-4 text-center">الضريبة %</th>
                                        <th className="py-4 px-4 text-center">الإجمالي</th>
                                        {!isLocked && <th className="py-4 pl-6"></th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {form.items.map((it, idx) => {
                                        const itemId = safeNumber(it.itemId);
                                        const selectedItem = items.find(i => safeNumber(i.id) === itemId);

                                        return (
                                            <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                                                {/* Item Select */}
                                                <td className="py-4 pr-6">
                                                    <select
                                                        value={itemId || ''}
                                                        onChange={(e) => updateItem(idx, { itemId: safeNumber(e.target.value) })}
                                                        disabled={isLocked}
                                                        className={`w-full min-w-[200px] px-3 py-2 border-2 rounded-xl text-sm font-semibold outline-none transition-all
                                    ${isLocked
                                                                ? 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-70'
                                                                : 'bg-white border-slate-200 focus:border-brand-primary'}`}
                                                    >
                                                        <option value="">اختر الصنف...</option>
                                                        {items
                                                            .filter(i => {
                                                                const iId = safeNumber(i.id);
                                                                return allPriceListItemIds.has(iId) || iId === itemId;
                                                            })
                                                            .map((i) => {
                                                                const iId = safeNumber(i.id);
                                                                const foundPL = allPriceListsWithItems.find(pl =>
                                                                    (pl.items || []).some(pli => safeNumber(pli.itemId) === iId)
                                                                );
                                                                const pli = (foundPL?.items || []).find(p => safeNumber(p.itemId) === iId);
                                                                const priceVal = extractPrice(pli);
                                                                const priceHint = priceVal > 0 ? ` - ${priceVal.toFixed(2)}` : '';
                                                                return (
                                                                    <option key={iId} value={iId}>
                                                                        {i.itemNameAr || i.itemCode}{priceHint}
                                                                    </option>
                                                                );
                                                            })}
                                                    </select>
                                                </td>

                                                {/* Quantity Input */}
                                                <td className="py-4 px-4">
                                                    <input
                                                        type="number"
                                                        min={0.001}
                                                        step="any"
                                                        value={it.quantity || ''}
                                                        onChange={(e) => updateItem(idx, { quantity: safeNumber(e.target.value) })}
                                                        disabled={isLocked}
                                                        className={`w-24 px-3 py-2 border-2 rounded-xl text-sm text-center font-bold outline-none transition-all
                                    ${isLocked
                                                                ? 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-70'
                                                                : 'bg-white border-slate-200 text-brand-primary focus:border-brand-primary'}`}
                                                    />
                                                </td>

                                                {/* Unit Price Input */}
                                                <td className="py-4 px-4">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        step={0.01}
                                                        value={it.unitPrice || ''}
                                                        onChange={(e) => updateItem(idx, { unitPrice: safeNumber(e.target.value) })}
                                                        disabled={isLocked}
                                                        className={`w-28 px-3 py-2 border-2 rounded-xl text-sm text-center font-bold outline-none transition-all
                                    ${isLocked
                                                                ? 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-70'
                                                                : 'bg-white border-slate-200 text-emerald-600 focus:border-brand-primary'}`}
                                                    />
                                                </td>

                                                {/* Grade (Read Only Display styled as Input) */}
                                                <td className="py-4 px-4">
                                                    <div className={`w-28 px-3 py-2 border-2 border-slate-200 rounded-xl bg-slate-100 text-center font-semibold text-slate-500 text-sm`}>
                                                        {selectedItem?.grade || '—'}
                                                    </div>
                                                </td>

                                                {/* Discount Input */}
                                                <td className="py-4 px-4">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={100}
                                                        step={0.01}
                                                        value={it.discountPercentage || ''}
                                                        onChange={(e) => updateItem(idx, { discountPercentage: safeNumber(e.target.value) })}
                                                        disabled={isLocked}
                                                        className={`w-20 px-3 py-2 border-2 rounded-xl text-sm text-center font-semibold outline-none transition-all
                                    ${isLocked
                                                                ? 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-70'
                                                                : 'bg-white border-slate-200 focus:border-brand-primary text-rose-500'}`}
                                                    />
                                                </td>

                                                {/* Tax Input */}
                                                <td className="py-4 px-4">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={100}
                                                        step={0.01}
                                                        value={it.taxPercentage || ''}
                                                        onChange={(e) => updateItem(idx, { taxPercentage: safeNumber(e.target.value) })}
                                                        disabled={isLocked}
                                                        className={`w-20 px-3 py-2 border-2 rounded-xl text-sm text-center font-semibold outline-none transition-all
                                    ${isLocked
                                                                ? 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-70'
                                                                : 'bg-white border-slate-200 focus:border-brand-primary text-indigo-600'}`}
                                                    />
                                                </td>

                                                {/* Total Price Display */}
                                                <td className="py-4 px-4 text-center font-bold text-slate-800">
                                                    {formatNumber(safeNumber(it.totalPrice), { minimumFractionDigits: 2 })}
                                                </td>

                                                {/* Delete Action */}
                                                {!isLocked && (
                                                    <td className="py-4 pl-6 text-left">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(idx)}
                                                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {/* Empty State */}
                            {form.items.length === 0 && (
                                <div className="py-20 text-center">
                                    <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                                        <Package className="w-10 h-10 text-slate-400" />
                                    </div>
                                    <p className="text-slate-400 font-semibold">لا توجد أصناف</p>
                                    {!isLocked && (
                                        <button
                                            type="button"
                                            onClick={addItem}
                                            className="mt-4 px-6 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                                        >
                                            إضافة صنف يدوياً
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Add Item Button (If items exist) */}
                            {form.items.length > 0 && !isLocked && (
                                <div className="p-4 border-t border-slate-100 bg-slate-50/30">
                                    <button
                                        type="button"
                                        onClick={addItem}
                                        className="flex items-center gap-2 px-4 py-2 text-brand-primary hover:bg-brand-primary/5 rounded-xl font-bold transition-all text-sm"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>إضافة صنف جديد</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Footer: Extra Costs Section */}
                        <div className="p-6 bg-slate-50/50 border-t border-slate-100">

                            {/* Delivery Cost */}
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-brand-primary/10 rounded-xl">
                                        <Truck className="w-5 h-5 text-brand-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 tracking-tight">مصاريف الشحن</h4>
                                        <p className="text-slate-500 text-xs font-medium">تكلفة الشحن والتوصيل لهذا العرض</p>
                                    </div>
                                </div>
                                <div className="relative w-full md:w-56">
                                    <input
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        value={form.deliveryCost || ''}
                                        onChange={(e) => setForm(f => ({ ...f, deliveryCost: safeNumber(e.target.value) }))}
                                        disabled={isLocked}
                                        className={`w-full px-5 py-3 border-2 border-slate-200 rounded-2xl 
                        text-xl text-center font-black text-brand-primary outline-none focus:border-brand-primary 
                        transition-all shadow-sm
                        ${isLocked ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-white'}`}
                                        placeholder="0.00"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs pointer-events-none">
                                        {form.currency}
                                    </div>
                                </div>
                            </div>

                            {/* Other Costs */}
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 mt-4 border-t border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-amber-500/10 rounded-xl">
                                        <Sparkles className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 tracking-tight">مصاريف أخرى</h4>
                                        <p className="text-slate-500 text-xs font-medium">أي تكاليف إضافية أخرى</p>
                                    </div>
                                </div>
                                <div className="relative w-full md:w-56">
                                    <input
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        value={form.otherCosts || ''}
                                        onChange={(e) => setForm(f => ({ ...f, otherCosts: safeNumber(e.target.value) }))}
                                        disabled={isLocked}
                                        className={`w-full px-5 py-3 border-2 border-slate-200 rounded-2xl 
                        text-xl text-center font-black text-brand-primary outline-none focus:border-brand-primary 
                        transition-all shadow-sm
                        ${isLocked ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-white'}`}
                                        placeholder="0.00"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs pointer-events-none">
                                        {form.currency}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Settings and Summary */}
                <div className="space-y-6">

                    <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-2xl animate-slide-in delay-200 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
                        <div className="absolute bottom-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full translate-x-1/3 translate-y-1/3 blur-2xl" />

                        <div className="relative space-y-6">
                            <div className="flex items-center gap-3 pb-6 border-b border-white/5">
                                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                                    <DollarSign className="w-6 h-6 text-emerald-400" />
                                </div>
                                <h3 className="font-bold text-xl">الملخص المالي</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-slate-400">
                                    <span className="text-sm">إجمالي البنود</span>
                                    <span className="font-bold text-white/90">{formatNumber(rawItemsTotal)} {form.currency}</span>
                                </div>

                                <div className="flex justify-between items-center text-rose-400">
                                    <span className="text-sm">إجمالي الخصومات</span>
                                    <span className="font-bold">-{formatNumber(itemDiscountsTotal)} {form.currency}</span>
                                </div>

                                <div className="flex justify-between items-center py-2 border-y border-white/5 text-slate-300">
                                    <span className="text-sm font-semibold">الإجمالي قبل الضريبة</span>
                                    <span className="font-bold">{formatNumber(subtotal)} {form.currency}</span>
                                </div>

                                <div className="flex justify-between items-center p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                    <span className="text-emerald-400 font-semibold text-sm">ضريبة القيمة المضافة</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-lg text-emerald-400">
                                            {formatNumber(totalTaxAmount)}
                                        </span>
                                        <span className="text-xs text-emerald-400/60 font-medium">{form.currency}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center px-4 py-2 text-white/60">
                                    <span className="text-sm">مصاريف الشحن</span>
                                    <span className="font-bold">{formatNumber(delivery)} {form.currency}</span>
                                </div>

                                <div className="flex justify-between items-center px-4 py-2 text-white/60">
                                    <span className="text-sm">مصاريف إضافية أخرى</span>
                                    <span className="font-bold">{formatNumber(other)} {form.currency}</span>
                                </div>

                                <div className="pt-6 mt-2 border-t border-white/10">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">الإجمالي النهائي</div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-4xl font-black text-white">{formatNumber(grandTotal)}</span>
                                                <span className="text-indigo-400 font-bold">{form.currency}</span>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
                                            <CreditCard className="w-8 h-8 text-indigo-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm animate-slide-in delay-300">
                        <div className="flex gap-4">
                            <div className="p-3 bg-indigo-50 rounded-2xl h-fit">
                                <Info className="w-6 h-6 text-indigo-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-slate-800">معلومات هامة</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    هذا العرض صالح لمدة محددة. بمجرد قبول العميل للعرض، يمكنك تحويله مباشرة إلى طلب مبيعات لمتابعة دورة الطلب والتوريد.
                                </p>
                            </div>
                        </div>
                    </div>

                    {!isNew && (
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-slide-in delay-300">
                            <div className="flex items-center gap-4">
                                <div className={`p-4 rounded-2xl shadow-sm ${form.status === 'Accepted' || form.status === 'Approved'
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : form.status === 'Rejected'
                                        ? 'bg-rose-50 text-rose-600'
                                        : 'bg-indigo-50 text-indigo-600'
                                    }`}>
                                    {form.status === 'Accepted' || form.status === 'Approved'
                                        ? <CheckCircle2 className="w-8 h-8" />
                                        : form.status === 'Rejected'
                                            ? <AlertCircle className="w-8 h-8" />
                                            : <Clock className="w-8 h-8" />}
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">حالة العرض</div>
                                    <div className="text-lg font-black text-slate-800">
                                        {form.status === 'Accepted' || form.status === 'Approved' ? 'تم القبول' :
                                            form.status === 'Rejected' ? 'مرفوض' :
                                                form.status === 'Sent' || form.status === 'Pending' ? 'تم الإرسال' : 'مسودة'}
                                    </div>
                                </div>
                            </div>
                            {form.status === 'Rejected' && (form as any).rejectedReason && (
                                <div className="mt-4 p-3 bg-rose-50 rounded-xl text-xs text-rose-700 border border-rose-100 italic">
                                    سبب الرفض: {(form as any).rejectedReason}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};

export default QuotationFormPage;