import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import React from 'react';
import {
    Heart,
    TrendingUp,
    Shield,
    BarChart3,
    Thermometer,
    Bell,
    Users,
    ShoppingCart,
    CheckCircle,
    Star,
    Monitor,
    Wifi,
    Package,
    Zap,
    Award,
    Globe,
    ArrowRight,
    Play,
    ChevronDown,
    Droplets,
    AlertTriangle,
    Lightbulb,
    DollarSign,
    Calculator,
    PieChart,
    Utensils
} from 'lucide-react';
import WelcomeNav from '@/components/navigation/WelcomeNav';
export default function Welcome() {
    const { auth } = usePage<SharedData>().props;


    const features = [
        {
            icon: <Thermometer className="w-12 h-12 text-emerald-600" />,
            title: "Smart Temperature Control",
            description: "Automated temperature monitoring and control system ensures optimal brooding conditions 24/7 with real-time adjustments."
        },
        {
            icon: <Heart className="w-12 h-12 text-emerald-500" />,
            title: "Health Monitoring",
            description: "Advanced health tracking system monitors chick behavior, feeding patterns, and vital signs to detect issues early."
        },
        {
            icon: <BarChart3 className="w-12 h-12 text-emerald-600" />,
            title: "Growth Analytics",
            description: "Comprehensive growth tracking with detailed analytics, weight monitoring, and performance metrics for optimal development."
        },
        {
            icon: <Bell className="w-12 h-12 text-emerald-600" />,
            title: "Smart Alerts",
            description: "Instant notifications for temperature changes, feeding schedules, health concerns, and maintenance requirements."
        },
        {
            icon: <Shield className="w-12 h-12 text-emerald-600" />,
            title: "Safety Features",
            description: "Built-in safety protocols with emergency shutoffs, backup systems, and fail-safe mechanisms for maximum protection."
        },
        {
            icon: <Monitor className="w-12 h-12 text-indigo-600" />,
            title: "Remote Monitoring",
            description: "Access your brooder data from anywhere with our mobile-friendly dashboard and real-time monitoring capabilities."
        }
    ];

    const benefits = [
        "✔ Simplifies daily farm operations",
        "✔ Saves time & money through automation",
        "✔ Gives financial clarity and insights",
        "✔ Direct link between farmers & consumers",
        "✔ Empowers sustainable and modern livestock farming",
        "✔ 24/7 remote monitoring capabilities"
    ];

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="bg-white min-h-screen">
                {/* Navigation Bar */}
                <WelcomeNav auth={auth} />

                {/* Hero Section */}
                <div className="relative bg-gradient-to-br min-h-screen flex justify-center items-center   pt-20 pb-32 overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute inset-0">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-emerald-200/20 rounded-full blur-2xl"></div>
                    </div>

                    <div className="relative max-w-7xl mx-auto   px-4 sm:px-6 lg:px-8 pt-16">
                        <div className="text-center">
                            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                                The All-in-One Platform for
                                <span className="text-emerald-600"> Livestock Farmers</span> & Consumers
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
                                Manage your farm, sell and buy products, track finances, and brood remotely — all in one powerful web app.
                            </p>
                            {/* Hero Image */}
                            <div className="relative mx-auto max-w-5xl">
                                <div className="bg-white overflow-hidden border border-gray-200 transform perspective-1000 hover:scale-105 transition-transform duration-700">

                                    <video
                                        className="w-full h-auto" autoPlay loop muted playsInline>
                                        <source src="/assets/4124024-uhd_4096_2160_25fps.mp4" type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                </div>
                            </div>

                            {/* Scroll indicator */}
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                                <ChevronDown className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className='flex flex-col sm:flex-row justify-center gap-6 mt-12'>
                    <Link href="/register" className="bg-emerald-600 text-white px-8 py-3 rounded-full shadow-lg hover:bg-emerald-700 transition font-semibold">
                        Get Started
                    </Link>
                    <Link href="/store" className="bg-white border-2 border-emerald-600 text-emerald-600 px-8 py-3 rounded-full shadow-lg hover:bg-emerald-50 transition font-semibold">
                        Explore Marketplace
                    </Link>
                </div>
                {/* Features Section */}
                <section id="features" className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-20">
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                                What is Poultriinnox?
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Poultriinnox is a digital solution built for livestock farmers, service providers, and consumers.
                                Our platform connects the livestock ecosystem — enabling farmers to sell products, track farm performance,
                                manage feeding, and even brood livestock remotely through smart technology.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="group relative bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300">
                                <div className="bg-emerald-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <ShoppingCart className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">🛒 Marketplace</h3>
                                <p className="text-gray-600 mb-4">
                                    Farmers, service providers, and suppliers list products and services. Customers search, order, and buy directly from the platform.
                                </p>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li className="flex items-center">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                                        Direct farmer-consumer connection
                                    </li>
                                    <li className="flex items-center">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                                        Trusted suppliers network
                                    </li>
                                    <li className="flex items-center">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                                        Secure online payments
                                    </li>
                                </ul>
                            </div>

                            <div className="group relative bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300">
                                <div className="bg-emerald-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <DollarSign className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">💰 My Finance</h3>
                                <p className="text-gray-600 mb-4">
                                    Track every expense and income in your farm. Get automated financial reports showing profits or losses.
                                </p>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li className="flex items-center">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                                        Financial move tracking
                                    </li>
                                    <li className="flex items-center">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                                        Budget calculator & tracker
                                    </li>
                                    <li className="flex items-center">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                                        Automated reports
                                    </li>
                                </ul>
                            </div>

                            <div className="group relative bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300">
                                <div className="bg-emerald-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Thermometer className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">🌡️ Remote Brooding</h3>
                                <p className="text-gray-600 mb-4">
                                    Control and monitor livestock brooding with our Broodiinnox automated system — from anywhere, at any time.
                                </p>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li className="flex items-center">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                                        Temperature monitoring
                                    </li>
                                    <li className="flex items-center">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                                        Remote control access
                                    </li>
                                    <li className="flex items-center">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                                        Automated alerts
                                    </li>
                                </ul>
                            </div>

                            <div className="group relative bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300">
                                <div className="bg-emerald-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Utensils className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">🍽️ Feed Management</h3>
                                <p className="text-gray-600 mb-4">
                                    Organize feeding schedules, track nutrition, and optimize livestock growth with smart feeding tools.
                                </p>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li className="flex items-center">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                                        Automated schedules
                                    </li>
                                    <li className="flex items-center">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                                        Nutrition tracking
                                    </li>
                                    <li className="flex items-center">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                                        Growth optimization
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>                {/* Benefits Section */}
                <div className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-4xl font-bold text-gray-900 mb-6">Why Choose Poultriinnox?</h2>
                                <p className="text-lg text-gray-600 mb-8">
                                    Join thousands of successful livestock farmers who have revolutionized their farming operations with our comprehensive digital platform.
                                </p>

                                <div className="space-y-4">
                                    {benefits.map((benefit, index) => (
                                        <div key={index} className="flex items-center space-x-3">
                                            <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                                            <span className="text-gray-700 font-medium">{benefit}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="">
                                <img src='/assets/pexels-photo-4124024.jpeg' alt='Real-time Monitoring Dashboard' className="w-full h-auto mb-4" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Analytics Dashboard Preview */}
                <section id="analytics" className="py-24 bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                                Performance at a Glance
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Our comprehensive dashboard gives you real-time insights into your brooding operations,
                                helping you make informed decisions for optimal results.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-8">
                                <div className="bg-white p-6 rounded-2xl  border border-gray-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Environmental Conditions</h3>
                                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-emerald-600">32.5°C</div>
                                            <div className="text-sm text-gray-600">Temperature</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-emerald-600">65%</div>
                                            <div className="text-sm text-gray-600">Humidity</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl  border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Survival Metrics</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Current Batch</span>
                                            <span className="font-semibold text-emerald-600">98.5%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '98.5%' }}></div>
                                        </div>
                                        <div className="flex justify-between items-center text-sm text-gray-600">
                                            <span>485 healthy chicks</span>
                                            <span>7 lost</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Energy Efficiency</h3>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-2xl font-bold text-emerald-600">2.3 kWh</div>
                                            <div className="text-sm text-gray-600">Today's consumption</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-emerald-600">-15%</div>
                                            <div className="text-xs text-gray-600">vs. last week</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl  overflow-hidden border border-gray-200">
                                <div className="bg-gradient-to-r bg-emerald-600 p-6 text-white">
                                    <h3 className="text-xl font-bold mb-2">Live Dashboard</h3>
                                    <p className="text-emerald-100">Real-time monitoring and control</p>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                                    <Thermometer className="w-5 h-5 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">Heating System</div>
                                                    <div className="text-sm text-gray-600">Optimal temperature maintained</div>
                                                </div>
                                            </div>
                                            <div className="w-12 h-6 bg-emerald-500 rounded-full relative">
                                                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                                    <Droplets className="w-5 h-5 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">Ventilation</div>
                                                    <div className="text-sm text-gray-600">Auto-adjusting airflow</div>
                                                </div>
                                            </div>
                                            <div className="w-12 h-6 bg-emerald-500 rounded-full relative">
                                                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                                    <Lightbulb className="w-5 h-5 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">LED Lighting</div>
                                                    <div className="text-sm text-gray-600">Day cycle active</div>
                                                </div>
                                            </div>
                                            <div className="w-12 h-6 bg-emerald-500 rounded-full relative">
                                                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-gray-900 mb-1">Day 14</div>
                                            <div className="text-sm text-gray-600 mb-4">Current brooding cycle</div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-gradient-to-r from-emerald-500 to-emerald-500 h-2 rounded-full" style={{ width: '56%' }}></div>
                                            </div>
                                            <div className="flex justify-between mt-2 text-xs text-gray-600">
                                                <span>Start</span>
                                                <span>7 days remaining</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* IoT Features Section */}
                <div className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">Smart IoT Integration</h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Connect your brooding system to the cloud for advanced analytics and remote management
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 justify-center align-middle gap-8 mb-16">
                            <div className="text-center p-8 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
                                <div className="bg-emerald-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <Wifi className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold mb-4 text-gray-900">Cloud Connectivity</h3>
                                <p className="text-gray-600 leading-relaxed">Seamless connection to our secure cloud platform for real-time data storage, backup, and advanced analysis capabilities.</p>
                            </div>

                            <div className="text-center p-8 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
                                <div className="bg-emerald-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <BarChart3 className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold mb-4 text-gray-900">Real-time Analytics</h3>
                                <p className="text-gray-600 leading-relaxed">Advanced machine learning algorithms provide actionable insights and predictive analytics for optimizing your operations.</p>
                            </div>
                        </div>

                        {/* IoT Device Integration */}
                        <div className="bg-gray-50 rounded-2xl p-8">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Supported IoT Devices</h3>
                                <p className="text-gray-600">Compatible with a wide range of sensors and smart devices</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                    <Thermometer className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-gray-900">Temperature Sensors</p>
                                </div>
                                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                    <Monitor className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-gray-900">Humidity Monitors</p>
                                </div>
                                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                    <Bell className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-gray-900">Motion Detectors</p>
                                </div>
                                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                    <Heart className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-gray-900">Health Monitors</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Testimonials Section */}
                <div className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Hear from successful livestock farmers who have transformed their operations with Poultriinnox
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                                <div className="flex items-center mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-emerald-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-600 mb-6 italic">
                                    "Since I started using Poultriinnox, I can track every expense and finally understand where my money goes. It's a game-changer!"
                                </p>
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                                        <Users className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Farmer</h4>
                                        <p className="text-gray-600 text-sm">Kigali</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                                <div className="flex items-center mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-emerald-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-600 mb-6 italic">
                                    "Buying livestock feeds has never been easier. The marketplace connects me directly to trusted providers."
                                </p>
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                                        <Users className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Consumer</h4>
                                        <p className="text-gray-600 text-sm">Huye</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <section className="bg-gradient-to-r bg-emerald-600  py-24">
                    <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Ready to transform your livestock business?
                        </h2>
                        <p className="text-xl text-emerald-100 mb-12">
                            Join the digital farming revolution and connect your livestock ecosystem
                            with Poultriinnox technology. Start your journey today.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-6">
                            <Link href="/register" className="group bg-white text-emerald-600 px-8 py-4 rounded-full hover:bg-gray-100 transition-all duration-300 font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                <span>Join Now</span>
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link href="/store" className="group bg-emerald-800 text-white px-8 py-4 rounded-full hover:bg-emerald-900 transition-all duration-300 font-semibold flex items-center justify-center shadow-lg hover:shadow-xl">
                                <ShoppingCart className="w-5 h-5 mr-2" />
                                <span>Explore Marketplace</span>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-emerald-600 border-t  text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div className="col-span-1 md:col-span-2">
                                <div className="flex items-center mb-6">
                                    <span className="text-2xl font-bold">PoultriInnox</span>
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
                                        <a href="mailto:info@poultriinnox.com" className="text-gray-200 hover:text-white transition-colors flex items-center">
                                            📧 info@poultriinnox.com
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
                                    © 2025 Poultriinnox. All rights reserved. Empowering African livestock farming through technology.
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
            </div>
        </>

    );
};
