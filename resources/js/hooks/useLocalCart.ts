import { useState, useEffect, useCallback } from 'react';

export interface LocalCartItem {
    product_id: number;
    variant_id: number | null;
    quantity: number;
    name: string;
    price: number;
    image: string;
    slug: string;
    stock_quantity: number;
    vendor_name?: string;
}

const CART_STORAGE_KEY = 'agriinnox_cart';

function toValidNumber(value: unknown): number {
    const num = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(num) ? num : 0;
}

function normalizeCartItem(raw: Partial<LocalCartItem>): LocalCartItem | null {
    const quantity = Math.floor(toValidNumber(raw.quantity));
    const stockQuantity = Math.max(0, Math.floor(toValidNumber(raw.stock_quantity)));

    if (!raw || typeof raw.product_id !== 'number') return null;
    if (quantity <= 0) return null;

    return {
        product_id: raw.product_id,
        variant_id: raw.variant_id ?? null,
        quantity: stockQuantity > 0 ? Math.min(quantity, stockQuantity) : quantity,
        name: typeof raw.name === 'string' ? raw.name : '',
        price: Math.max(0, toValidNumber(raw.price)),
        image: typeof raw.image === 'string' ? raw.image : '',
        slug: typeof raw.slug === 'string' ? raw.slug : '',
        stock_quantity: stockQuantity,
        vendor_name: typeof raw.vendor_name === 'string' ? raw.vendor_name : undefined,
    };
}

function readCart(): LocalCartItem[] {
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(parsed)) return [];
        return parsed
            .map((item) => normalizeCartItem(item))
            .filter((item): item is LocalCartItem => item !== null);
    } catch {
        return [];
    }
}

function writeCart(items: LocalCartItem[]) {
    const normalized = items
        .map((item) => normalizeCartItem(item))
        .filter((item): item is LocalCartItem => item !== null);

    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new Event('local-cart-updated'));
}

export function getLocalCartCount(): number {
    return readCart().reduce((sum, item) => sum + item.quantity, 0);
}

export function getLocalCartItems(): LocalCartItem[] {
    return readCart();
}

export function clearLocalCart() {
    localStorage.removeItem(CART_STORAGE_KEY);
    window.dispatchEvent(new Event('local-cart-updated'));
}

export default function useLocalCart() {
    const [items, setItems] = useState<LocalCartItem[]>(readCart);
    const [count, setCount] = useState(() => readCart().reduce((sum, i) => sum + i.quantity, 0));

    // Sync state when storage changes (other tabs or manual dispatches)
    useEffect(() => {
        const sync = () => {
            const cart = readCart();
            setItems(cart);
            setCount(cart.reduce((sum, i) => sum + i.quantity, 0));
        };

        window.addEventListener('local-cart-updated', sync);
        window.addEventListener('storage', sync);
        return () => {
            window.removeEventListener('local-cart-updated', sync);
            window.removeEventListener('storage', sync);
        };
    }, []);

    const addItem = useCallback((item: LocalCartItem) => {
        const cart = readCart();
        const key = `${item.product_id}-${item.variant_id ?? 'default'}`;
        const idx = cart.findIndex(c => `${c.product_id}-${c.variant_id ?? 'default'}` === key);

        if (idx >= 0) {
            const newQty = cart[idx].quantity + item.quantity;
            if (newQty > item.stock_quantity) return false;
            cart[idx].quantity = newQty;
            cart[idx].price = item.price;
        } else {
            cart.push({ ...item });
        }

        writeCart(cart);
        setItems([...cart]);
        setCount(cart.reduce((sum, i) => sum + i.quantity, 0));
        return true;
    }, []);

    const removeItem = useCallback((productId: number, variantId: number | null) => {
        const cart = readCart().filter(
            c => !(c.product_id === productId && c.variant_id === variantId)
        );
        writeCart(cart);
        setItems(cart);
        setCount(cart.reduce((sum, i) => sum + i.quantity, 0));
    }, []);

    const updateQuantity = useCallback((productId: number, variantId: number | null, quantity: number) => {
        const cart = readCart();
        const key = `${productId}-${variantId ?? 'default'}`;
        const idx = cart.findIndex(c => `${c.product_id}-${c.variant_id ?? 'default'}` === key);
        if (idx >= 0) {
            cart[idx].quantity = quantity;
            writeCart(cart);
            setItems([...cart]);
            setCount(cart.reduce((sum, i) => sum + i.quantity, 0));
        }
    }, []);

    const clear = useCallback(() => {
        writeCart([]);
        setItems([]);
        setCount(0);
    }, []);

    return { items, count, addItem, removeItem, updateQuantity, clear };
}
