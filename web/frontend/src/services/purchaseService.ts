import apiClient from './apiClient';

// Interfaces
export interface PurchaseRequisitionItem {
    id?: number;
    prId?: number;
    itemId: number;
    itemNameAr?: string;
    itemNameEn?: string;
    itemCode?: string;
    requestedQty: number;
    unitId: number;
    unitName?: string;
    estimatedUnitPrice?: number;
    estimatedTotalPrice?: number;
    requiredDate?: string;
    specifications?: string;
    notes?: string;
}

export interface PurchaseRequisition {
    id?: number;
    prNumber?: string;
    prDate?: string;
    requestedByDeptId: number;
    requestedByDeptName?: string;
    requestedByUserId: number;
    requestedByUserName?: string;
    requiredDate?: string;
    priority: string;
    status?: string;
    totalEstimatedAmount?: number;
    justification?: string;
    approvedByUserId?: number;
    approvedByUserName?: string;
    approvedDate?: string;
    rejectionReason?: string;
    notes?: string;
    items: PurchaseRequisitionItem[];
    createdAt?: string;
    createdBy?: number;
    hasActiveOrders?: boolean;
    hasComparison?: boolean;
}

export interface RFQItem {
    id?: number;
    rfqId?: number;
    itemId: number;
    itemNameAr?: string;
    itemCode?: string;
    requestedQty: number;
    unitId: number;
    unitName?: string;
    specifications?: string;
    estimatedPrice?: number;
}

export interface RFQ {
    id?: number;
    rfqNumber?: string;
    rfqDate?: string;
    prId?: number;
    prNumber?: string;
    supplierId: number;
    supplierNameAr?: string;
    responseDueDate?: string;
    status?: string;
    notes?: string;
    items: RFQItem[];
    hasActiveOrders?: boolean;
    hasQuotation?: boolean;
}

export interface SupplierQuotationItem {
    id?: number;
    quotationId?: number;
    itemId: number;
    itemNameAr?: string;
    itemCode?: string;
    offeredQty: number;
    unitId: number;
    unitName?: string;
    unitPrice: number;
    discountPercentage?: number;
    discountAmount?: number;
    taxPercentage?: number;
    taxAmount?: number;
    totalPrice: number;
    deliveryDays?: number;
    polymerGrade?: string;
    notes?: string;
}

export interface SupplierQuotation {
    id?: number;
    quotationNumber?: string;
    rfqId?: number;
    rfqNumber?: string;
    supplierId: number;
    supplierNameAr?: string;
    quotationDate: string;
    validUntilDate?: string;
    currency?: string;
    exchangeRate?: number;
    paymentTerms?: string;
    deliveryTerms?: string;
    deliveryDays?: number;
    deliveryCost?: number;
    totalAmount: number;
    status?: string;
    notes?: string;
    items: SupplierQuotationItem[];
}

export interface QuotationComparisonDetail {
    id?: number;
    comparisonId?: number;
    quotationId: number;
    quotationNumber?: string;
    supplierId: number;
    supplierNameAr?: string;
    unitPrice?: number;
    totalPrice?: number;
    paymentTerms?: string;
    deliveryDays?: number;
    validUntilDate?: string;
    qualityRating?: number;
    priceRating?: number;
    overallScore?: number;
    deliveryCost?: number;
    comments?: string;
    polymerGrade?: string;
}

export interface QuotationComparison {
    id?: number;
    comparisonNumber?: string;
    comparisonDate?: string;
    prId?: number;
    prNumber?: string;
    itemId: number;
    itemNameAr?: string;
    selectedQuotationId?: number;
    selectedQuotationNumber?: string;
    selectedSupplierId?: number;
    selectedSupplierNameAr?: string;
    selectionReason?: string;
    status?: string;
    approvalStatus?: string;
    details: QuotationComparisonDetail[];
}

export interface Supplier {
    id: number;
    supplierCode: string;
    supplierNameAr: string;
    supplierNameEn?: string;
    phone?: string;
    email?: string;
}

const purchaseService = {
    // PRs
    getAllPRs: async () => {
        const response = await apiClient.get<{ data: PurchaseRequisition[] }>('/procurement/pr');
        return response.data.data;
    },
    getPRById: async (id: number) => {
        const response = await apiClient.get<{ data: PurchaseRequisition }>(`/procurement/pr/${id}`);
        return response.data.data;
    },
    createPR: async (pr: PurchaseRequisition) => {
        const response = await apiClient.post<{ data: PurchaseRequisition }>('/procurement/pr', pr);
        return response.data.data;
    },
    updatePR: async (id: number, pr: PurchaseRequisition) => {
        const response = await apiClient.put<{ data: PurchaseRequisition }>(`/procurement/pr/${id}`, pr);
        return response.data.data;
    },
    submitPR: async (id: number) => {
        const response = await apiClient.post<{ data: PurchaseRequisition }>(`/procurement/pr/${id}/submit`);
        return response.data.data;
    },
    deletePR: async (id: number) => {
        await apiClient.delete(`/procurement/pr/${id}`);
    },

    // RFQs
    getAllRFQs: async () => {
        const response = await apiClient.get<{ data: RFQ[] }>('/procurement/rfq');
        return response.data.data;
    },
    getRFQById: async (id: number) => {
        const response = await apiClient.get<{ data: RFQ }>(`/procurement/rfq/${id}`);
        return response.data.data;
    },
    createRFQ: async (rfq: RFQ) => {
        const response = await apiClient.post<{ data: RFQ }>('/procurement/rfq', rfq);
        return response.data.data;
    },
    updateRFQ: async (id: number, rfq: RFQ) => {
        const response = await apiClient.put<{ data: RFQ }>(`/procurement/rfq/${id}`, rfq);
        return response.data.data;
    },
    deleteRFQ: async (id: number) => {
        await apiClient.post(`/procurement/rfq/${id}/delete`);
    },

    // Quotations
    getAllQuotations: async () => {
        const response = await apiClient.get<{ data: SupplierQuotation[] }>('/procurement/quotation');
        return response.data.data;
    },
    getQuotationById: async (id: number) => {
        const response = await apiClient.get<{ data: SupplierQuotation }>(`/procurement/quotation/${id}`);
        return response.data.data;
    },
    createQuotation: async (quotation: SupplierQuotation) => {
        const response = await apiClient.post<{ data: SupplierQuotation }>('/procurement/quotation', quotation);
        return response.data.data;
    },
    deleteQuotation: async (id: number) => {
        await apiClient.post(`/procurement/quotation/${id}/delete`);
    },

    // Comparisons
    getAllComparisons: async () => {
        const response = await apiClient.get<{ data: QuotationComparison[] }>('/procurement/comparison');
        return response.data.data;
    },
    getComparisonById: async (id: number) => {
        const response = await apiClient.get<{ data: QuotationComparison }>(`/procurement/comparison/${id}`);
        return response.data.data;
    },
    createComparison: async (comparison: QuotationComparison) => {
        const response = await apiClient.post<{ data: QuotationComparison }>('/procurement/comparison', comparison);
        return response.data.data;
    },
    updateComparison: async (id: number, comparison: QuotationComparison) => {
        const response = await apiClient.put<{ data: QuotationComparison }>(`/procurement/comparison/${id}`, comparison);
        return response.data.data;
    },
    submitComparison: async (id: number) => {
        const response = await apiClient.post<{ data: QuotationComparison }>(`/procurement/comparison/${id}/submit`);
        return response.data.data;
    },
    financeReviewComparison: async (id: number, userId: number, approved: boolean, notes?: string) => {
        const response = await apiClient.post<{ data: QuotationComparison }>(`/procurement/comparison/${id}/finance-review`, null, {
            params: { userId, approved, notes }
        });
        return response.data.data;
    },
    managementApproveComparison: async (id: number, userId: number, approved: boolean, notes?: string) => {
        const response = await apiClient.post<{ data: QuotationComparison }>(`/procurement/comparison/${id}/management-approve`, null, {
            params: { userId, approved, notes }
        });
        return response.data.data;
    },
    deleteComparison: async (id: number) => {
        await apiClient.post(`/procurement/comparison/${id}/delete`);
    },

    // Suppliers
    getAllSuppliers: async () => {
        const response = await apiClient.get<{ data: Supplier[] }>('/suppliers');
        return response.data.data;
    },

    // Lifecycle
    getPRLifecycle: async (id: number) => {
        const response = await apiClient.get<{ data: PRLifecycle }>('/procurement/pr/' + id + '/lifecycle');
        return response.data.data;
    }
};

export interface PRLifecycle {
    requisition: { status: string; date: string; prNumber: string };
    approval: { status: string; currentStep: string; lastActionDate?: string };
    sourcing: { status: string; rfqCount: number; quotationCount: number; comparisonStatus: string };
    ordering: { status: string; poNumbers: string[]; lastPoDate?: string };
    receiving: { status: string; grnNumbers: string[]; lastGrnDate?: string };
    quality: { status: string; result: string; inspectionDate?: string };
}

export default purchaseService;
