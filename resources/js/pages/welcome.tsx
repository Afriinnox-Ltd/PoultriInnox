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
    Lightbulb
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
            icon: <Heart className="w-12 h-12 text-red-500" />,
            title: "Health Monitoring",
            description: "Advanced health tracking system monitors chick behavior, feeding patterns, and vital signs to detect issues early."
        },
        {
            icon: <BarChart3 className="w-12 h-12 text-emerald-600" />,
            title: "Growth Analytics",
            description: "Comprehensive growth tracking with detailed analytics, weight monitoring, and performance metrics for optimal development."
        },
        {
            icon: <Bell className="w-12 h-12 text-yellow-600" />,
            title: "Smart Alerts",
            description: "Instant notifications for temperature changes, feeding schedules, health concerns, and maintenance requirements."
        },
        {
            icon: <Shield className="w-12 h-12 text-purple-600" />,
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
        "95% higher chick survival rates",
        "50% reduction in manual monitoring time",
        "Automated feeding and watering systems",
        "Real-time environmental controls",
        "Data-driven decision making",
        "24/7 remote monitoring"
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
                        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-200/20 rounded-full blur-2xl"></div>
                    </div>

                    <div className="relative max-w-7xl mx-auto   px-4 sm:px-6 lg:px-8 pt-16">
                        <div className="text-center">
                            <p className="text-2xl md:text-3xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
                                Transform your poultry farming with smart technology.
                                <br className="hidden md:block" />
                                Maximize survival rates, minimize labor, and optimize growth through intelligent automation.
                            </p>
                            {/* Hero Image */}
                            <div className="relative mx-auto max-w-5xl">
                                <div className="bg-white overflow-hidden border border-gray-200 transform perspective-1000 hover:scale-105 transition-transform duration-700">

                                    <video
                                        className="w-full h-auto" autoPlay loop muted playsInline>
                                        <source  src="/assets/4124024-uhd_4096_2160_25fps.mp4" type="video/mp4" />
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

                {/* Features Section */}
                {/* Features Section */}
                <section id="features" className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-20">
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                                Smart Brooding Technology
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Experience the future of poultry farming with our intelligent IoT system that monitors,
                                controls, and optimizes every aspect of chick care.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="group relative bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300">
                                <div className="bg-emerald-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Thermometer className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Temperature Control</h3>
                                <p className="text-gray-600 mb-4">
                                    Precise temperature monitoring and automatic adjustment to maintain optimal brooding conditions 24/7.
                                </p>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li className="flex items-center">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                                        ±0.5°C accuracy
                                    </li>
                                    <li className="flex items-center">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                                        Auto-regulation
                                    </li>
                                    <li className="flex items-center">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                                        Real-time alerts
                                    </li>
                                </ul>
                            </div>

                            <div className="group relative bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300">
                                <div className="bg-blue-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Droplets className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Humidity Management</h3>
                                <p className="text-gray-600 mb-4">
                                    Advanced humidity control ensures perfect moisture levels for healthy chick development.
                                </p>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li className="flex items-center">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                        60-70% RH range
                                    </li>
                                    <li className="flex items-center">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                        Automatic misting
                                    </li>
                                    <li className="flex items-center">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                        Smart ventilation
                                    </li>
                                </ul>
                            </div>

                            <div className="group relative bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300">
                                <div className="bg-purple-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Lightbulb className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Smart Lighting</h3>
                                <p className="text-gray-600 mb-4">
                                    Automated day/night cycles with optimal light intensity to promote natural growth patterns.
                                </p>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li className="flex items-center">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                                        Programmable schedules
                                    </li>
                                    <li className="flex items-center">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                                        LED energy efficiency
                                    </li>
                                    <li className="flex items-center">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                                        Growth optimization
                                    </li>
                                </ul>
                            </div>

                            <div className="group relative bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300">
                                <div className="bg-orange-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <BarChart3 className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Real-time Analytics</h3>
                                <p className="text-gray-600 mb-4">
                                    Comprehensive data tracking and insights to optimize your brooding operations and maximize efficiency.
                                </p>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li className="flex items-center">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                                        Performance metrics
                                    </li>
                                    <li className="flex items-center">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                                        Historical data
                                    </li>
                                    <li className="flex items-center">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                                        Predictive insights
                                    </li>
                                </ul>
                            </div>

                            <div className="group relative bg-gradient-to-br from-red-50 to-red-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300">
                                <div className="bg-red-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <AlertTriangle className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Alert System</h3>
                                <p className="text-gray-600 mb-4">
                                    Instant notifications for critical events ensure you never miss important changes in your brooding environment.
                                </p>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li className="flex items-center">
                                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                                        SMS & email alerts
                                    </li>
                                    <li className="flex items-center">
                                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                                        Emergency protocols
                                    </li>
                                    <li className="flex items-center">
                                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                                        24/7 monitoring
                                    </li>
                                </ul>
                            </div>

                            <div className="group relative bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300">
                                <div className="bg-emerald-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Globe className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Remote Access</h3>
                                <p className="text-gray-600 mb-4">
                                    Monitor and control your brooding system from anywhere in the world through our secure web platform.
                                </p>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li className="flex items-center">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                                        Web dashboard
                                    </li>
                                    <li className="flex items-center">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                                        Mobile responsive
                                    </li>
                                    <li className="flex items-center">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                                        Secure encryption
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
                                <h2 className="text-4xl font-bold text-gray-900 mb-6">Why Choose ChicksBrooder?</h2>
                                <p className="text-lg text-gray-600 mb-8">
                                    Join thousands of successful poultry farmers who have revolutionized their brooding operations with our smart technology.
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
                                            <div className="bg-emerald-500 h-2 rounded-full" style={{width: '98.5%'}}></div>
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
                                                <div className="bg-gradient-to-r from-emerald-500 to-emerald-500 h-2 rounded-full" style={{width: '56%'}}></div>
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
                                    <Thermometer className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-gray-900">Temperature Sensors</p>
                                </div>
                                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                    <Monitor className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-gray-900">Humidity Monitors</p>
                                </div>
                                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                    <Bell className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-gray-900">Motion Detectors</p>
                                </div>
                                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                    <Heart className="w-8 h-8 text-purple-500 mx-auto mb-2" />
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
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Farmers Say</h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Hear from successful poultry farmers who have transformed their operations with ChicksBrooder
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                                <div className="flex items-center mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-600 mb-6 italic">
                                    "ChicksBrooder increased our survival rate from 85% to 97%. The automated monitoring gives us peace of mind, especially during critical first weeks."
                                </p>
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                                        <Users className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Sarah Johnson</h4>
                                        <p className="text-gray-600 text-sm">Johnson Poultry Farm</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                                <div className="flex items-center mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-600 mb-6 italic">
                                    "The analytics dashboard helped us identify optimal feeding schedules. We've reduced feed waste by 30% while improving growth rates."
                                </p>
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                                        <Users className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Michael Chen</h4>
                                        <p className="text-gray-600 text-sm">Chen Family Farms</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                                <div className="flex items-center mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-600 mb-6 italic">
                                    "The remote monitoring feature is a game-changer. I can check on my chicks from anywhere and get instant alerts if something needs attention."
                                </p>
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                                        <Users className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Maria Rodriguez</h4>
                                        <p className="text-gray-600 text-sm">Rodriguez Organic Farms</p>
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
                            Ready to Transform Your Farm?
                        </h2>
                        <p className="text-xl text-emerald-100 mb-12">
                            Join the smart farming revolution and give your chicks the best start in life
                            with PoultriInnox technology. Start your journey today.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-6">
                            <Link href="/store" className="group bg-white text-emerald-600 px-8 py-4 rounded-xl hover:bg-gray-100 transition-all duration-300 font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                <ShoppingCart className="w-5 h-5 mr-2" />
                                <span>Browse Products</span>
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            {auth ? (
                                <Link href="/dashboard" className="group bg-emerald-800 text-white px-8 py-4 rounded-xl hover:bg-emerald-900 transition-all duration-300 font-semibold flex items-center justify-center shadow-lg hover:shadow-xl">
                                    <BarChart3 className="w-5 h-5 mr-2" />
                                    <span>Dashboard</span>
                                </Link>
                            ) : (
                                <Link href="/login" className="group bg-emerald-800 text-white px-8 py-4 rounded-xl hover:bg-emerald-900 transition-all duration-300 font-semibold flex items-center justify-center shadow-lg hover:shadow-xl">
                                    <Users className="w-5 h-5 mr-2" />
                                    <span>Get Started</span>
                                </Link>
                            )}
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
                                    Revolutionizing poultry farming across Africa with smart IoT technology.
                                    Maximize survival rates, minimize labor, and optimize growth.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
                                <ul className="space-y-4">
                                    <li>
                                        <a href="#features" className="text-gray-200 hover:text-white transition-colors">Features</a>
                                    </li>
                                    <li>
                                        <a href="#analytics" className="text-gray-200 hover:text-white transition-colors">Analytics</a>
                                    </li>
                                    <li>
                                        <a href="#testimonials" className="text-gray-200 hover:text-white transition-colors">Testimonials</a>
                                    </li>
                                    <li>
                                        <Link href="/store" className="text-gray-200 hover:text-white transition-colors">Marketplace</Link>
                                    </li>
                                    {auth && (
                                        <li>
                                            <Link href="/dashboard" className="text-gray-200 hover:text-white transition-colors">Dashboard</Link>
                                        </li>
                                    )}
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-6">Support</h3>
                                <ul className="space-y-4">
                                    <li>
                                        <a href="#" className="text-gray-200 hover:text-white transition-colors">Help Center</a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-gray-200 hover:text-white transition-colors">Contact Us</a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-gray-200 hover:text-white transition-colors">Documentation</a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-gray-200 hover:text-white transition-colors">System Status</a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="border-t border-gray-800 mt-12 pt-8">
                            <div className="flex flex-col md:flex-row justify-between items-center">
                                <p className="text-gray-200 text-sm">
                                    © 2024 PoultriInnox. All rights reserved. Empowering African agriculture through technology.
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
