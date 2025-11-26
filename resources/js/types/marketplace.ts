// Marketplace Type Definitions

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    image_url?: string;
    parent_id?: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    children?: Category[];
    parent?: Category;
    products_count?: number;
}

export interface Vendor {
    id: number;
    user_id: number;
    business_name: string;
    business_description?: string;
    business_address?: string;
    business_phone?: string;
    business_email?: string;
    business_website?: string;
    tax_number?: string;
    bank_account_info?: string;
    verification_status: 'pending' | 'approved' | 'rejected' | 'suspended';
    is_verified: boolean;
    verification_documents?: string;
    commission_rate: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    user?: User;
    products?: Product[];
    orders?: Order[];
    rating?: number;
    total_sales?: number;
    total_products?: number;
}

export interface Product {
    id: number;
    vendor_id: number;
    category_id: number;
    name: string;
    slug: string;
    description?: string;
    short_description?: string;
    price: number;
    stock_quantity: number;
    unit_of_measure?: string;
    minimum_order_quantity?: number;
    maximum_order_quantity?: number;
    weight?: number;
    dimensions?: string;
    sku?: string;
    status: 'active' | 'inactive' | 'out_of_stock';
    meta_title?: string;
    meta_description?: string;
    is_featured: boolean;
    created_at: string;
    updated_at: string;
    vendor?: Vendor;
    category?: Category;
    images?: ProductImage[];
    reviews?: ProductReview[];
    rating?: number;
    total_reviews?: number;
    total_sales?: number;
    tags?: string[];
    payment_methods?: string[];
    shipping_option?: string;
    video_path?: string;
    extra_fee?: number;
    is_negotiable?: boolean;
    delivery_time?: string;
    return_policy?: string;
    additional_info?: string;
    variants?: ProductVariant[];
}

export interface ProductImage {
    image_path: string | undefined;
    id: number;
    product_id: number;
    alt_text?: string;
    is_primary: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface ProductReview {
    id: number;
    product_id: number;
    user_id: number;
    rating: number;
    title?: string;
    comment?: string;
    is_verified_purchase: boolean;
    is_approved: boolean;
    helpful_count: number;
    created_at: string;
    updated_at: string;
    user?: User;
    product?: Product;
}

export interface ProductVariant {
    id: number;
    product_id: number;
    name: string;
    value: string;
    price_adjustment: number;
    stock_quantity: number;
    sku?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Cart {
    id: number;
    user_id: number;
    session_id?: string;
    created_at: string;
    updated_at: string;
    items?: CartItem[];
    total_amount?: number;
    total_items?: number;
}

export interface CartItem {
    id: number;
    cart_id: number;
    product_id: number;
    variant_id?: number;
    quantity: number;
    unit_price: number;
    total_price: number;
    created_at: string;
    updated_at: string;
    product?: Product;
    variant?: ProductVariant;

}

export interface Order {
    id: number;
    user_id: number;
    order_number: string;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
    payment_method: 'credit_card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery';
    admin_confirmed: boolean;
    admin_confirmed_at?: string;
    admin_confirmed_by?: number;
    subtotal: number;
    tax_amount: number;
    shipping_amount: number;
    discount_amount: number;
    total_amount: number;
    currency: string;
    billing_address: string;
    shipping_address: string;
    notes?: string;
    shipped_at?: string;
    delivered_at?: string;
    created_at: string;
    updated_at: string;
    user?: User;
    items?: OrderItem[];
    shipping?: Shipping;
    vendor_orders?: VendorOrder[];
}

export interface OrderItem {
    id: number;
    order_id: number;
    vendor_order_id: number;
    product_id: number;
    variant_id?: number;
    product_name: string;
    product_sku?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    created_at: string;
    updated_at: string;
    product?: Product;
    variant?: ProductVariant;
    vendor_order?: VendorOrder;
}

export interface VendorOrder {
    id: number;
    order_id: number;
    vendor_id: number;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    subtotal: number;
    commission_amount: number;
    vendor_amount: number;
    created_at: string;
    updated_at: string;
    order?: Order;
    vendor?: Vendor;
    items?: OrderItem[];
}

export interface Shipping {
    id: number;
    order_id: number;
    tracking_number?: string;
    carrier?: string;
    status: 'pending' | 'processing' | 'shipped' | 'in_transit' | 'delivered' | 'failed';
    shipping_address: {
        name: string;
        phone: string;
        address_line_1: string;
        address_line_2?: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
    };
    estimated_delivery?: string;
    shipped_at?: string;
    delivered_at?: string;
    created_at: string;
    updated_at: string;
    order?: Order;
}

export interface Wishlist {
    id: number;
    user_id: number;
    product_id: number;
    created_at: string;
    updated_at: string;
    user?: User;
    product?: Product;
}

// Search and Filter Types
export interface ProductFilters {
    category?: string;
    vendor?: string;
    search?: string;
    price_min?: string;
    price_max?: string;
    in_stock?: boolean;
    rating_min?: number;
    is_featured?: boolean;
}

export interface ProductSort {
    sort_by: 'name' | 'price' | 'created_at' | 'rating' | 'sales';
    sort_direction: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

// Form Types
export interface AddToCartRequest {
    product_id: number;
    variant_id?: number;
    quantity: number;
}

export interface UpdateCartItemRequest {
    quantity: number;
}

export interface CheckoutRequest {
    shipping_address: {
        name: string;
        phone: string;
        address_line_1: string;
        address_line_2?: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
    };
    billing_address?: {
        name: string;
        phone: string;
        address_line_1: string;
        address_line_2?: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
    };
    payment_method: 'credit_card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery';
    notes?: string;
}

export interface VendorRegistrationRequest {
    business_name: string;
    business_description?: string;
    business_address?: string;
    business_phone?: string;
    business_email?: string;
    business_website?: string;
    tax_number?: string;
    bank_account_info?: string;
}

export interface ProductFormData {
    name: string;
    category_id: number;
    description?: string;
    short_description?: string;
    price: number;
    stock_quantity: number;
    minimum_order_quantity?: number;
    maximum_order_quantity?: number;
    weight?: number;
    dimensions?: string;
    sku?: string;
    status: 'active' | 'inactive' | 'out_of_stock';
    meta_title?: string;
    meta_description?: string;
    is_featured: boolean;
}

// Dashboard Types
export interface VendorDashboardStats {
    total_products: number;
    active_products: number;
    pending_products: number;
    draft_products: number;
    total_orders: number;
    pending_orders: number;
    processing_orders: number;
    completed_orders: number;
    cancelled_orders: number;
    total_revenue: number;
    monthly_revenue: number;
    avg_rating: number;
    total_reviews: number;
    status: string;
    is_verified: boolean;
    response_rate: number;
    on_time_delivery: number;
}

export interface AdminDashboardStats {
    total_vendors: number;
    total_products: number;
    total_orders: number;
    total_revenue: number;
    pending_vendor_approvals: number;
    recent_orders: Order[];
    top_vendors: Vendor[];
    revenue_chart: {
        date: string;
        revenue: number;
    }[];
}

// Error Types
export interface ValidationError {
    field: string;
    message: string;
}

export interface ApiError {
    message: string;
    errors?: ValidationError[];
    status?: number;
}
