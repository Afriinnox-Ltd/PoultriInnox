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
    Wifi
} from 'lucide-react';
export default function Welcome() {
    const { auth } = usePage<SharedData>().props;


    const features = [
        {
            icon: <Thermometer className="w-12 h-12 text-green-600" />,
            title: "Smart Temperature Control",
            description: "Automated temperature monitoring and control system ensures optimal brooding conditions 24/7 with real-time adjustments."
        },
        {
            icon: <Heart className="w-12 h-12 text-red-500" />,
            title: "Health Monitoring",
            description: "Advanced health tracking system monitors chick behavior, feeding patterns, and vital signs to detect issues early."
        },
        {
            icon: <BarChart3 className="w-12 h-12 text-green-600" />,
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
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-green-50 to-green-50 py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
                                Welcome to <span className="text-green-600">Poultriinnox</span>
                            </h1>
                            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                                Revolutionary IoT-powered chick brooding system that combines smart technology with proven farming practices.
                                Maximize your chick survival rates while minimizing manual labor through automated monitoring and control.
                            </p>
                            <div className="flex justify-center space-x-4 mb-12">
                                <Link href="/store" className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center space-x-2">
                                    <ShoppingCart className="w-5 h-5" />
                                    <span>Explore Marketplace</span>
                                </Link>

                            </div>
                            {/* Hero Image */}
                            <div className="relative mx-auto max-w-4xl">
                                <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                                    <img
                                        src="/chick-brooder-hero.svg"
                                        alt="ChicksBrooder Smart System Overview"
                                        className="w-full h-auto"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">Advanced Features</h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Our comprehensive suite of features ensures optimal chick care and farming efficiency
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {features.map((feature, index) => (
                                <div key={index} className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
                                    <div className="flex items-center justify-center mb-6">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">{feature.title}</h3>
                                    <p className="text-gray-600 text-center leading-relaxed">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Benefits Section */}
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
                                            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                                            <span className="text-gray-700 font-medium">{benefit}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8">
                                    <Link href="/about" className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold">
                                        Learn More About Our Technology
                                    </Link>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                                <img
                                    src="/monitoring-dashboard.svg"
                                    alt="Real-time Monitoring Dashboard"
                                    className="w-full h-auto mb-4"
                                />
                                <div className="text-center">
                                    <h3 className="text-2xl font-semibold text-gray-800 mb-2">Proven Results</h3>
                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-green-600">95%</div>
                                            <div className="text-sm text-gray-600">Survival Rate</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-green-600">50%</div>
                                            <div className="text-sm text-gray-600">Time Saved</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-purple-600">24/7</div>
                                            <div className="text-sm text-gray-600">Monitoring</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-orange-600">100+</div>
                                            <div className="text-sm text-gray-600">Happy Farmers</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Analytics Showcase */}
                <div className="py-20 bg-gradient-to-br from-green-50 to-indigo-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div className="bg-white rounded-xl shadow-lg p-8">
                                <img
                                    src="/growth-analytics.svg"
                                    alt="Advanced Growth Analytics"
                                    className="w-full h-auto"
                                />
                            </div>

                            <div>
                                <h2 className="text-4xl font-bold text-gray-900 mb-6">Advanced Analytics & Insights</h2>
                                <p className="text-lg text-gray-600 mb-8">
                                    Track every aspect of your chick development with comprehensive analytics and data-driven insights that help you make informed decisions.
                                </p>

                                <div className="space-y-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="bg-green-100 rounded-lg p-3">
                                            <BarChart3 className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Growth Tracking</h3>
                                            <p className="text-gray-600">Monitor weight gain, development milestones, and growth patterns with precision analytics.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4">
                                        <div className="bg-green-100 rounded-lg p-3">
                                            <TrendingUp className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
                                            <p className="text-gray-600">Compare performance against industry benchmarks and optimize your brooding strategies.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4">
                                        <div className="bg-purple-100 rounded-lg p-3">
                                            <Heart className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Health Insights</h3>
                                            <p className="text-gray-600">Early detection of health issues through behavioral pattern analysis and vital monitoring.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>      {/* IoT Features Section */}
                <div className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">Smart IoT Integration</h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Connect your brooding system to the cloud for advanced analytics and remote management
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                            <div className="text-center p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                                <div className="bg-green-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <Wifi className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold mb-4 text-gray-900">Cloud Connectivity</h3>
                                <p className="text-gray-600 leading-relaxed">Seamless connection to our secure cloud platform for real-time data storage, backup, and advanced analysis capabilities.</p>
                            </div>

                            <div className="text-center p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                                <div className="bg-green-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <BarChart3 className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold mb-4 text-gray-900">Real-time Analytics</h3>
                                <p className="text-gray-600 leading-relaxed">Advanced machine learning algorithms provide actionable insights and predictive analytics for optimizing your operations.</p>
                            </div>

                            <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                                <div className="bg-purple-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <Users className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold mb-4 text-gray-900">Multi-user Access</h3>
                                <p className="text-gray-600 leading-relaxed">Grant secure access to team members, veterinarians, and consultants with customizable permission levels and role management.</p>
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
                                    <Monitor className="w-8 h-8 text-green-500 mx-auto mb-2" />
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
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                                        <Users className="w-6 h-6 text-green-600" />
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
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                                        <Users className="w-6 h-6 text-green-600" />
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
                <div className="bg-gradient-to-r from-green-600 to-green-600 py-20">
                    <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                        <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Brooding Operation?</h2>
                        <p className="text-xl text-green-100 mb-8">
                            Join the smart farming revolution and give your chicks the best start in life with ChicksBrooder technology.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <Link href="/store" className="bg-white text-green-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold">
                                Explore Marketplace
                            </Link>
                            <Link href="/dashboard" className="bg-green-800 text-white px-8 py-4 rounded-lg hover:bg-green-900 transition-colors font-semibold">
                                Explore our products
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>

    );
};
