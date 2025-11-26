import { Link } from '@inertiajs/react'
import React from 'react'

function Footer({auth}: {auth: any}) {
    return (
        <>
           {/* Footer */}
                <footer className="bg-emerald-600 border-t  text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div className="col-span-1 md:col-span-2">
                                <div className="flex items-center mb-6">
                                    <span className="text-2xl font-bold">Agriinnox</span>
                                </div>
                                <p className="text-white mb-6 max-w-md">
                                    Connecting the livestock ecosystem across Africa with smart digital solutions.
                                    Manage your farm, track finances, and access the marketplace — all in one platform.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
                                <ul className="space-y-4">
                                    <li>
                                        <Link href="/store" className="text-gray-200 hover:text-white transition-colors">Marketplace</Link>
                                    </li>
                                    <li>
                                        <a href="#" className="text-gray-200 hover:text-white transition-colors">My Finance</a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-gray-200 hover:text-white transition-colors">Remote Brooding</a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-gray-200 hover:text-white transition-colors">Feed Management</a>
                                    </li>
                                    {auth.user && (
                                        <li>
                                            <Link href="/dashboard" className="text-gray-200 hover:text-white transition-colors">Dashboard</Link>
                                        </li>
                                    )}
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-6">Contact Info</h3>
                                <ul className="space-y-4">
                                    <li>
                                        <a href="mailto:info@agriinnox.com" className="text-gray-200 hover:text-white transition-colors flex items-center">
                                            📧 info@agriinnox.com
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-gray-200 hover:text-white transition-colors">About</a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-gray-200 hover:text-white transition-colors">Contact Us</a>
                                    </li>
                                    <li>
                                        <div className="flex space-x-4 mt-4">
                                            <a href="#" className="text-gray-200 hover:text-white transition-colors">Facebook</a>
                                            <a href="#" className="text-gray-200 hover:text-white transition-colors">Twitter</a>
                                            <a href="#" className="text-gray-200 hover:text-white transition-colors">LinkedIn</a>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="border-t border-gray-800 mt-12 pt-8">
                            <div className="flex flex-col md:flex-row justify-between items-center">
                                <p className="text-gray-200 text-sm">
                                    © {new Date().getFullYear()} agriinnox . All rights reserved. Empowering African livestock farming through technology.
                                </p>
                                <div className="flex items-center space-x-6 mt-4 md:mt-0">
                                    <a href="#" className="text-gray-200 hover:text-white text-sm transition-colors">Privacy Policy</a>
                                    <a href="#" className="text-gray-200 hover:text-white text-sm transition-colors">Terms of Service</a>
                                    <a href="#" className="text-gray-200 hover:text-white text-sm transition-colors">Cookie Policy</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
        </>
    )
}

export default Footer