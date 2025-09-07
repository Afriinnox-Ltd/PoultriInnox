import { Link, usePage } from '@inertiajs/react'
import React from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SharedData } from '@/types'

function WelcomeNav({ auth }: any) {
    const { cartCount } = usePage<SharedData>().props;
    return (
        <nav className="bg-white/95 backdrop-blur-sm fixed w-full z-50 border-b border-emerald-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <span className="text-xl font-bold text-emerald-600">PoultriInnox</span>
                    </div>
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/" className="text-gray-600 hover:text-emerald-600 transition-colors">Home</Link>
                        <Link href="/store" className="text-gray-600 hover:text-emerald-600 transition-colors">Explore products</Link>

                        {auth ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger className='cursor-pointer flex items-center gap-2'>
                                    <span>My account </span> <span>
                                        {cartCount > 0 && (
                                            <span className="bg-emerald-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center font-medium">
                                                {cartCount > 99 ? '99+' : cartCount}
                                            </span>
                                        )}</span></DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>Dashboard</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <Link href="/cart" className="flex items-center gap-2">
                                            Cart
                                            {cartCount > 0 && (
                                                <span className="bg-emerald-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center font-medium">
                                                    {cartCount > 99 ? '99+' : cartCount}
                                                </span>
                                            )}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem><Link href="/orders">My orders</Link></DropdownMenuItem>
                                    <DropdownMenuItem><Link href="/profile">Profile</Link></DropdownMenuItem>
                                    <DropdownMenuItem><Link href="/settings">Settings</Link></DropdownMenuItem>
                                    <DropdownMenuItem><Link href="/logout">Logout</Link></DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link href="/login" className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default WelcomeNav
