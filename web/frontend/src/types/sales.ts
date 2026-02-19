export interface CustomerRequest {
    requestId: number;
    requestNumber: string;
    requestDate: string;
    customerId: number;
    customerName?: string;
    priceListId?: number;
    status: string;
    notes: string;
    items: CustomerRequestItem[];
    schedules: CustomerRequestDeliverySchedule[];
}

export interface CustomerRequestDeliverySchedule {
    scheduleId?: number;
    requestId?: number;
    deliveryDate: string;
    productId?: number;
    quantity: number;
    notes?: string;
}

export interface CustomerRequestItem {
    itemId?: number;
    productId?: number;
    productName: string;
    quantity: number;
    unitId?: number;
    notes?: string;
}
