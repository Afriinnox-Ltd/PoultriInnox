import { Link, usePage } from '@inertiajs/react'
import React, { useState, useRef, useEffect } from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SharedData } from '@/types'
import MegaMenu from './MegaMenu'
import { ChevronDown, Menu, X, ShoppingCart } from 'lucide-react'
 
import useLocalCart from '@/hooks/useLocalCart'
import LocaleSwitcher from '../LocaleSwitcher'

function WelcomeNav({ auth, categories = [], products = [] }: any) {
    const [isMegaMenuVisible, setIsMegaMenuVisible] = useState(false);
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { cartCount, categories: sharedCategories } = usePage<SharedData>().props;
    const { count: localCartCount } = useLocalCart();
    const serverCartCount = Math.max(0, Number(cartCount) || 0);
    const totalCartCount = auth?.user ? serverCartCount : localCartCount;

    // Search state
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
    const searchRef = useRef<HTMLDivElement>(null);

    // Safe array handling
    const safeCategories = (Array.isArray(categories) && categories.length > 0) ? categories : (Array.isArray(sharedCategories) ? sharedCategories : []);
    const safeProducts = Array.isArray(products) ? products : [];

    // Handle search input changes and show suggestions
    const handleSearchInput = (value: string) => {
        setSearchTerm(value);

        if (value.trim().length > 0) {
            // Filter products based on search term
            const filtered = safeProducts.filter((product: any) =>
                product.name.toLowerCase().includes(value.toLowerCase()) ||
                product.description?.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 8); // Limit to 8 suggestions

            setSearchSuggestions(filtered);
            setShowSearchDropdown(true);
        } else {
            setSearchSuggestions([]);
            setShowSearchDropdown(false);
        }
    };

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        if (selectedCategory) params.set('category', selectedCategory);

        window.location.href = `/store/search?${params.toString()}`;
        setShowSearchDropdown(false);
    };

    // Handle clicking outside search dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSearchDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get current URL for redirect after login
    const currentUrl = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
    const loginUrl = `/login${currentUrl ? `?intended=${encodeURIComponent(currentUrl)}` : ''}`;

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };
    return (
        <nav className="bg-white backdrop-blur-sm fixed w-full z-50 border-b border-emerald-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href={'/'} className="flex items-center">
                        <span className="text-xl font-bold text-emerald-600">Agriinnox</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8 relative">
                        <Link href="/" className="text-gray-600 hover:text-emerald-600 transition-colors">Home</Link>
                        <Link href="/help" className="text-gray-600 hover:text-emerald-600 transition-colors">Help</Link>
                        <Link href="/partners" className="text-gray-600 hover:text-emerald-600 transition-colors">Partners</Link>

                        {/* Explore Products with Mega Menu */}
                        <div
                            className="relative"
                            onMouseEnter={() => setIsMegaMenuVisible(true)}
                            onMouseLeave={() => setIsMegaMenuVisible(false)}
                        >
                            <a
                                href="#"
                                className="flex items-center text-gray-600 hover:text-emerald-600 transition-colors group"
                            >
                                <span>Explore Products</span>
                                <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isMegaMenuVisible ? 'rotate-180' : ''}`} />
                            </a>
                        </div>

                        {auth?.user ? (
                            <div
                                className="relative"
                                onMouseEnter={() => setIsAccountMenuOpen(true)}
                                onMouseLeave={() => setIsAccountMenuOpen(false)}
                            >
                                <DropdownMenu open={isAccountMenuOpen} onOpenChange={setIsAccountMenuOpen}>
                                    <DropdownMenuTrigger className='cursor-pointer flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors'>
                                        <span className='flex items-center'>
                                            My account
                                            <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
                                        </span>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuSeparator />
                                        {/* <DropdownMenuItem>
                                            <Link href="/cart" className="flex items-center gap-2 w-full">
                                                Cart
                                            </Link>
                                        </DropdownMenuItem> */}

                                            {
                                            auth?.user?.role === 'partner' ? (
                                                    <DropdownMenuItem>
                                                        <Link href="/partner/dashboard" className="flex items-center gap-2 w-full">
                                                            Dashboard
                                                        </Link>
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem><Link href="/dashboard" className="w-full">Dashboard</Link></DropdownMenuItem>

                                                )

                                            }
                                     
                                        <DropdownMenuItem><Link href="/orders" className="w-full">My orders</Link></DropdownMenuItem>
                                        <DropdownMenuItem><Link href="/settings" className="w-full">Settings</Link></DropdownMenuItem>
                                        {/* <DropdownMenuItem><Link href="/logout" className="w-full">Logout</Link></DropdownMenuItem> */}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ) : (
                            <Link href={loginUrl} className="bg-emerald-600 text-white px-10 py-2 rounded-full hover:bg-emerald-700 transition-colors">
                                Login / Register
                            </Link>
                        )}

                        {/* Desktop cart icon - always visible */}
                        {/* <Link href="/cart" className="relative p-2 text-gray-600 hover:text-emerald-600 transition-colors hidden md:block">
                            <ShoppingCart className="w-5 h-5" />
                            {totalCartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium">
                                    {totalCartCount > 9 ? '9+' : totalCartCount}
                                </span>
                            )}
                        </Link> */}
                        {/* <LocaleSwitcher /> */}
                        
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center space-x-4">
                        {/* Cart icon for mobile - always visible */}
                        {/* <Link href="/cart" className="relative p-2">
                            <ShoppingCart className="w-6 h-6 text-gray-600" />
                            {totalCartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center font-medium">
                                    {totalCartCount > 9 ? '9+' : totalCartCount}
                                </span>
                            )}
                        </Link> */}

                        <button
                            onClick={toggleMobileMenu}
                            className="p-2 rounded-md text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Search Bar - Reusable Section */}
             

                {/* Mobile Menu */}
                <div className={`md:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
                        <Link
                            href="/"
                            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            href="/help"
                            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Help
                        </Link>
                        <Link
                            href="/partners"
                            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Partners
                        </Link>

                        <a
                            href="/store"
                            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Marketplace
                        </a>

                        {/* Mobile Features Menu */}
                        {/* <div className="px-3 py-2">
                            <div className="text-sm font-semibold text-gray-900 mb-2">Features</div>
                            <div className="pl-4 space-y-1">
                                <Link
                                    href="#"
                                    className="block py-2 text-sm text-gray-600 hover:text-emerald-600 transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    My Finance
                                </Link>
                                <Link
                                    href="#"
                                    className="block py-2 text-sm text-gray-600 hover:text-emerald-600 transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Remote Brooding
                                </Link>
                                <Link
                                    href="#"
                                    className="block py-2 text-sm text-gray-600 hover:text-emerald-600 transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Feed Management
                                </Link>
                            </div>
                        </div> */}

                        {auth?.user ? (
                            <>
                                <div className="border-t border-gray-200 pt-2">
                                    <div className="px-3 py-2 text-sm font-semibold text-gray-900">Account</div>
                                    <Link
                                        href="/dashboard"
                                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        href="/orders"
                                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        My Orders
                                    </Link>
                                    <Link
                                        href="/settings"
                                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Settings
                                    </Link>
                                    <Link
                                        href="/logout"
                                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Logout
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <div className="border-t border-gray-200 pt-2">
                                <Link
                                    href={loginUrl}
                                    className="block mx-3 my-2 px-4 py-2 text-center bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="block mx-3 my-2 px-4 py-2 text-center border-2 border-emerald-600 text-emerald-600 rounded-full hover:bg-emerald-50 transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mega Menu - only show on desktop */}
            <div className="hidden md:block">
                <MegaMenu
                    isVisible={isMegaMenuVisible}
                    onMouseEnter={() => setIsMegaMenuVisible(true)}
                    onMouseLeave={() => setIsMegaMenuVisible(false)}
                />
            </div>
        </nav>
    )
}

export default WelcomeNav
