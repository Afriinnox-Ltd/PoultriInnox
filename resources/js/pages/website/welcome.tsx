import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
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
    Utensils,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import WelcomeNav from '@/components/navigation/WelcomeNav';
import Footer from '@/components/marketplace/Footer';
export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const testimonials = [
        {
            id: 1,
            quote: "Since I started using Agriinnox, I can track every expense and finally understand where my money goes. It's a game-changer!",
            author: "Farmer",
            location: "Kigali",
            rating: 5
        },
        {
            id: 2,
            quote: "Buying livestock feeds has never been easier. The marketplace connects me directly to trusted providers.",
            author: "Consumer",
            location: "Huye",
            rating: 5
        },
        {
            id: 3,
            quote: "The remote brooding system saved my entire batch when I was away. The automated controls and alerts are incredibly reliable.",
            author: "Poultry Farmer",
            location: "Musanze",
            rating: 5
        },
        {
            id: 4,
            quote: "Financial tracking made simple! I can finally see my farm's profitability and make informed decisions about expansion.",
            author: "Livestock Owner",
            location: "Rubavu",
            rating: 5
        },
        {
            id: 5,
            quote: "The feed management system optimized our nutrition programs. We've seen 20% better growth rates since using Agriinnox.",
            author: "Commercial Farm Manager",
            location: "Muhanga",
            rating: 5
        }
    ];

    // Auto-slide testimonials with pause functionality
    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 5000); // Change every 5 seconds

        return () => clearInterval(interval);
    }, [testimonials.length, isPaused]);

    const goToTestimonial = (index: number) => {
        setCurrentTestimonial(index);
    };

    const nextTestimonial = () => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    };

    const prevTestimonial = () => {
        setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };


    const benefits = [
        "Simplifies daily farm operations",
        "Saves time & money through automation",
        "Gives financial clarity and insights",
        "Direct link between farmers & consumers",
        "Empowers sustainable and modern livestock farming",
        "24/7 remote monitoring capabilities"
    ];

    return (
        <>
            <Head title="The All-in-One Platform for Livestock Farmers & Consumers">
                <meta name="description" content="Agriinnox is a comprehensive digital platform designed for livestock farmers, service providers, and consumers. Manage your farm, sell and buy products, track finances, and brood remotely — all in one powerful web app." />
                <meta name="keywords" content="Agriinnox, Livestock Farming, Farm Management, Brooding, Feed Management, Marketplace, Financial Tracking, Remote Monitoring, IoT Integration" />
                <meta name="author" content="Afriinnox Technologies" />
                <meta property="og:title" content="Agriinnox - The All-in-One Platform for Livestock Farmers & Consumers" />
                <meta property="og:description" content="Agriinnox is a comprehensive digital platform designed for livestock farmers, service providers, and consumers. Manage your farm, sell and buy products, track finances, and brood remotely — all in one powerful web app." />
                <meta property="og:image" content="/assets/agriinnox-og-image.png" />
                <meta property="og:url" content="https://agriinnox.com" />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Agriinnox - The All-in-One Platform for Livestock Farmers & Consumers" />
                <meta name="twitter:description" content="Agriinnox is a comprehensive digital platform designed for livestock farmers, service providers, and consumers. Manage your farm, sell and buy products, track finances, and brood remotely — all in one powerful web app." />
                <meta name="twitter:image" content="/assets/agriinnox-og-image.png" />
                <meta name="twitter:site" content="@afriinnox" />
                <meta name="twitter:creator" content="@afriinnox" />

            </Head>
            <div className="bg-white min-h-screen">
                {/* Navigation Bar */}
                <WelcomeNav auth={auth} />

                {/* Hero Section */}
                <div className="relative bg-gradient-to-br min-h-screen flex justify-center items-center   pt-20 pb-20 overflow-hidden">
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
                                <div className="bg-white overflow-hidden border border-gray-200 transform perspective-1000 hover:scale-101 rounded-2xl transition-transform duration-700">

                                    <video
                                        className="w-full h-auto rounded-2xl" autoPlay loop muted playsInline>
                                        <source src="/assets/10685-226624850_tiny.mp4" type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            </div>

                            {/* Scroll indicator */}
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                                <ChevronDown className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className='flex flex-col sm:flex-row justify-center gap-6 '>
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
                                What is Agriinnox?
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Agriinnox is a digital solution built for livestock farmers, service providers, and consumers.
                                Our platform connects the livestock ecosystem — enabling farmers to sell products, track farm performance,
                                manage feeding, and even brood livestock remotely through smart technology.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="group relative bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300">
                                <div className="bg-emerald-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <ShoppingCart className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4"> Marketplace</h3>
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
                                <h3 className="text-xl font-bold text-gray-900 mb-4">My Finance</h3>
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
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Remote Brooding</h3>
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
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Feed Management</h3>
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
                                <h2 className="text-4xl font-bold text-gray-900 mb-6">Why Choose Agriinnox?</h2>
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
                                <img src='/assets/aja-island-CY1NVUsZoLE-unsplash.jpg' alt='' className="w-full rounded-2xl h-auto mb-4" />
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
                                Hear from successful livestock farmers who have transformed their operations with Agriinnox
                            </p>
                        </div>

                        {/* Testimonial Carousel */}
                        <div
                            className="relative max-w-4xl mx-auto"
                            onMouseEnter={() => setIsPaused(true)}
                            onMouseLeave={() => setIsPaused(false)}
                        >
                            <div className="overflow-hidden rounded-2xl">
                                <div
                                    className="flex transition-transform duration-500 ease-in-out"
                                    style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
                                >
                                    {testimonials.map((testimonial, index) => (
                                        <div key={testimonial.id} className="w-full flex-shrink-0">
                                            <div className="bg-white rounded-2xl p-8 md:p-12  border border-gray-100 mx-4">
                                                {/* Stars */}
                                                <div className="flex justify-center items-center mb-6">
                                                    {[...Array(testimonial.rating)].map((_, i) => (
                                                        <Star key={i} className="w-6 h-6 text-emerald-600 fill-current mx-1" />
                                                    ))}
                                                </div>

                                                {/* Quote */}
                                                <blockquote className="text-xl md:text-2xl text-gray-700 text-center mb-8 leading-relaxed italic">
                                                    "{testimonial.quote}"
                                                </blockquote>

                                                {/* Author */}
                                                <div className="flex items-center justify-center">
                                                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-emerald-600 rounded-full flex items-center justify-center mr-4">
                                                        <Users className="w-8 h-8 text-white" />
                                                    </div>
                                                    <div className="text-center">
                                                        <h4 className="text-lg font-semibold text-gray-900">{testimonial.author}</h4>
                                                        <p className="text-emerald-600 font-medium">{testimonial.location}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Navigation Arrows */}
                            <button
                                onClick={prevTestimonial}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white hover:bg-gray-50 rounded-full p-3 shadow-lg border border-gray-200 transition-all duration-200 hover:scale-110"
                                aria-label="Previous testimonial"
                            >
                                <ChevronLeft className="w-6 h-6 text-gray-600" />
                            </button>

                            <button
                                onClick={nextTestimonial}
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white hover:bg-gray-50 rounded-full p-3 shadow-lg border border-gray-200 transition-all duration-200 hover:scale-110"
                                aria-label="Next testimonial"
                            >
                                <ChevronRight className="w-6 h-6 text-gray-600" />
                            </button>

                            {/* Dots Indicator */}
                            <div className="flex justify-center mt-8 space-x-3">
                                {testimonials.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => goToTestimonial(index)}
                                        className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentTestimonial
                                            ? 'bg-emerald-600 scale-125'
                                            : 'bg-gray-300 hover:bg-gray-400'
                                            }`}
                                        aria-label={`Go to testimonial ${index + 1}`}
                                    />
                                ))}
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
                            with Agriinnox technology. Start your journey today.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-6">
                            <Link href="/register" className="group bg-white text-emerald-600 px-8 py-4 rounded-full hover:bg-gray-100 transition-all duration-300 font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                <span>Join Now</span>
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link href="/store" className="group bg-white text-emerald-600 px-8 py-4 rounded-full hover:bg-gray-100 transition-all duration-300 font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                <ShoppingCart className="w-5 h-5 mr-2" />
                                <span>Explore Marketplace</span>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <Footer auth={auth} />

            </div>
        </>

    );
};
