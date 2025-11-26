import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import WelcomeNav from '@/components/navigation/WelcomeNav';
import Footer from '@/components/marketplace/Footer';
import { Toaster } from '@/components/ui/sonner';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronRight, Layers, Home, Package } from 'lucide-react';
import { type SharedData } from '@/types';

interface SubCategory {
    id: number;
    name: string;
    slug: string;
    icon: string | null;
    color: string | null;
    products_count: number;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    products_count: number;
    children: SubCategory[];
}

interface Props {
    categories: Category[];
}

export default function PublicCategoriesPage({ categories }: Props) {
    const { auth } = usePage<SharedData>().props;
    const [search, setSearch] = useState('');

    const filtered = search.trim()
        ? categories.filter(cat =>
            cat.name.toLowerCase().includes(search.toLowerCase()) ||
            cat.children.some(c => c.name.toLowerCase().includes(search.toLowerCase()))
          )
        : categories;

    const total = categories.reduce((sum, c) => sum + (c.products_count ?? 0), 0);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <WelcomeNav auth={auth} />
            <Head title="All Categories — Store" />
            <Toaster position="bottom-right" richColors />

            <main className="flex-1 pt-16">
                {/* Header */}
                <div className="bg-white border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        {/* Breadcrumb */}
                        <nav className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                            <Link href="/" className="hover:text-emerald-600 flex items-center gap-1">
                                <Home className="w-3.5 h-3.5" /> Home
                            </Link>
                            <ChevronRight className="w-3.5 h-3.5" />
                            <Link href="/store" className="hover:text-emerald-600">Store</Link>
                            <ChevronRight className="w-3.5 h-3.5" />
                            <span className="text-gray-900 font-medium">All Categories</span>
                        </nav>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                    <Layers className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">All Categories</h1> 
                                </div>
                            </div>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search categories..."
                                    className="pl-9"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {filtered.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No categories match "{search}"</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filtered.map(category => (
                                <Link
                                    key={category.id}
                                    href={`/store/search?category=${category.id}`}
                                    className="group bg-white rounded-2xl border hover:border-emerald-300 hover:shadow-md transition-all overflow-hidden"
                                >
                                    {/* Category header */}
                                    <div
                                        className="flex items-center gap-4 p-5" 
                                    >
                                        <div
                                            className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shadow-sm flex-shrink-0"
                                            style={{ backgroundColor: category.color || '#059669' }}
                                        >
                                            <Package className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h2 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors text-base leading-tight">
                                                {category.name}
                                            </h2>
                                            {category.description && (
                                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{category.description}</p>
                                            )}
                                            <Badge variant="secondary" className="mt-1 text-xs">
                                                {category.products_count ?? 0} product{(category.products_count ?? 0) !== 1 ? 's' : ''}
                                            </Badge>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-600 transition-colors flex-shrink-0" />
                                    </div>

                                    {/* Subcategories */}
                                    {category.children.length > 0 && (
                                        <div className="px-5 py-3 border-t bg-gray-50 flex flex-wrap gap-2">
                                            {category.children.slice(0, 5).map(sub => (
                                                <span
                                                    key={sub.id}
                                                    onClick={e => { e.preventDefault(); window.location.href = `/store/search?category=${sub.id}`; }}
                                                    className="inline-flex items-center gap-1 text-xs bg-white border rounded-full px-2 py-0.5 text-gray-600 hover:border-emerald-400 hover:text-emerald-600 transition-colors cursor-pointer"
                                                >
                                                    
                                                    {sub.name}
                                                    {sub.products_count > 0 && (
                                                        <span className="text-gray-400">({sub.products_count})</span>
                                                    )}
                                                </span>
                                            ))}
                                            {category.children.length > 5 && (
                                                <span className="text-xs text-gray-400 self-center">
                                                    +{category.children.length - 5} more
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer auth={auth} />
        </div>
    );
}
