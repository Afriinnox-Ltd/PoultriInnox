import { Link } from '@inertiajs/react';
import React, { useState } from 'react';
import {
    ShoppingCart,
    DollarSign,
    Thermometer,
    Utensils,
    Package,
    Users,
    CreditCard,
    Calculator,
    Monitor,
    Bell,
    BarChart3,
    PieChart,
    Activity,
    TrendingUp,
    Egg,
    Pill,
    Syringe,
    Heart,
    ChevronRight
} from 'lucide-react';

interface MegaMenuProps {
    isVisible: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

const MegaMenu: React.FC<MegaMenuProps> = ({ isVisible, onMouseEnter, onMouseLeave }) => {
    const [hoveredSection, setHoveredSection] = useState<string | null>(null);

    const menuSections = [
        {
            id: 'marketplace',
            title: 'Marketplace',
            icon: <ShoppingCart className="w-6 h-6 text-emerald-600" />,
            description: 'Buy and sell livestock products directly',
            link: '/store',
            features: [
                { name: 'Browse Products', icon: <Package className="w-4 h-4" />, link: '/store' },
                { name: 'Find Suppliers', icon: <Users className="w-4 h-4" />, link: '/store/suppliers' },
                { name: 'Livestock Feed', icon: <Utensils className="w-4 h-4" />, link: '/store/category/feed' },
                { name: 'Equipment & Tools', icon: <Monitor className="w-4 h-4" />, link: '/store/category/equipment' },
            ]
        },
        {
            id: 'finance',
            title: 'My Finance',
            icon: <DollarSign className="w-6 h-6 text-emerald-600" />,
            description: 'Track expenses and manage farm finances',
            link: '#',
            features: [
                { name: 'Income Tracking', icon: <TrendingUp className="w-4 h-4" />, link: '#', },
                { name: 'Expense Management', icon: <CreditCard className="w-4 h-4" />, link: '#', },
                { name: 'Budget Calculator', icon: <Calculator className="w-4 h-4" />, link: '#', },
                { name: 'Financial Reports', icon: <PieChart className="w-4 h-4" />, link: '#', },
            ]
        },
        {
            id: 'brooding',
            title: 'Remote Brooding',
            icon: <Thermometer className="w-6 h-6 text-emerald-600" />,
            description: 'Monitor and control brooding conditions remotely',
            link: '#',
            features: [
                { name: 'Live Monitoring', icon: <Activity className="w-4 h-4" />, link: '#', },
                { name: 'Temperature Control', icon: <Thermometer className="w-4 h-4" />, link: '#', },
                { name: 'Batch Management', icon: <Egg className="w-4 h-4" />, link: '#', },
                { name: 'Smart Alerts', icon: <Bell className="w-4 h-4" />, link: '#', },
            ]
        },
        {
            id: 'feed',
            title: 'Feed Management',
            icon: <Utensils className="w-6 h-6 text-emerald-600" />,
            description: 'Optimize feeding schedules and nutrition',
            link: '#',
            features: [
                { name: 'Feed Programs', icon: <Utensils className="w-4 h-4" />, link: '#', },
                { name: 'Nutrition Tracking', icon: <BarChart3 className="w-4 h-4" />, link: '#', },
                { name: 'Feed Inventory', icon: <Package className="w-4 h-4" />, link: '#', },
                { name: 'Consumption Reports', icon: <PieChart className="w-4 h-4" />, link: '#', },
            ]
        }
    ];


    return (
        <div
            className={`absolute top-full left-0 w-full bg-white shadow-2xl border-t-2 border-emerald-500 transition-all duration-300 ease-in-out transform ${
                isVisible ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4'
            }`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            style={{ zIndex: 1000 }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-8">
                    {/* Main Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {menuSections.map((section) => (
                            <div
                                key={section.id}
                                className={`group p-6 rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 ${
                                    hoveredSection === section.id ? 'bg-emerald-50 border-emerald-300' : 'bg-white hover:bg-emerald-50'
                                }`}
                                onMouseEnter={() => setHoveredSection(section.id)}
                                onMouseLeave={() => setHoveredSection(null)}
                            >
                                <div className="flex items-center mb-4">
                                    {section.icon}
                                    <h3 className="text-lg font-semibold text-gray-900 ml-3">{section.title}</h3>
                                </div>
                                <p className="text-sm text-gray-600 mb-4">{section.description}</p>
                                <Link
                                    href={section.link}
                                    className="inline-flex items-center mt-4 text-emerald-600 font-medium text-sm hover:text-emerald-700 group/link"
                                >
                                    Open
                                    <ChevronRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MegaMenu;
