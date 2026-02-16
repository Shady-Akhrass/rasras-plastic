export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
}

export interface Customer {
    customerId: number;
    nameAr: string;
    nameEn: string;
    // Add other fields as needed
}
