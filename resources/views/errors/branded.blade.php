<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title') - Agriinnox</title>

    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>

    <style>
        @keyframes float {

            0%,
            100% {
                transform: translateY(0px);
            }

            50% {
                transform: translateY(-20px);
            }
        }

        @keyframes pulse-slow {

            0%,
            100% {
                opacity: 1;
            }

            50% {
                opacity: 0.5;
            }
        }

        .float-animation {
            animation: float 3s ease-in-out infinite;
        }

        .pulse-slow {
            animation: pulse-slow 2s ease-in-out infinite;
        }
    </style>
</head>

<body class="antialiased bg-gradient-to-br from-emerald-50 via-white to-green-50 min-h-screen">

    <!-- Error Content -->
    <div class="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
        <div class="max-w-2xl w-full text-center">
            <!-- Animated Icon -->
            <div class="mb-8 flex justify-center">
                <div class="relative">
                    <!-- Error Code -->
                    <div
                        class="relative bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-full w-32 h-32 flex items-center justify-center">
                        <span class="text-4xl font-bold">@yield('code')</span>
                    </div>
                </div>
            </div>

            <!-- Error Title -->
            <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                @yield('title')
            </h1>

            <!-- Error Message -->
            <p class="text-lg md:text-xl text-gray-600 mb-8 max-w-md mx-auto">
                @yield('message')
            </p>

            <!-- Additional Description -->
            <div class="mb-10">
                <p class="text-gray-500 mb-4">
                    @yield('description', 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.')
                </p>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a href="javascript:history.back()"
                    class="inline-flex items-center px-6 py-3 border-2 border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition font-semibold shadow-sm hover:shadow-md">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Go Back
                </a>

                <a href="/"
                    class="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold shadow-md hover:shadow-lg">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6">
                        </path>
                    </svg>
                    Go Home
                </a>
            </div>

            <!-- Help Section -->
            <div class="mt-12 pt-8 border-t border-gray-200">
                <p class="text-sm text-gray-500 mb-4">
                    Need help? Contact our support team
                </p>
                <div class="flex flex-wrap justify-center gap-6 text-sm">
                    <a href="mailto:support@agriinnox.com"
                        class="text-emerald-600 hover:text-emerald-700 font-medium flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z">
                            </path>
                        </svg>
                        Email Support
                    </a>
                    <a href="/help" class="text-emerald-600 hover:text-emerald-700 font-medium flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
                            </path>
                        </svg>
                        Help Center
                    </a>
                </div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div class="text-center text-sm text-gray-500">
                <p>&copy; {{ date('Y') }} Agriinnox. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script>
        function toggleMobileMenu() {
            const menu = document.getElementById('mobileMenu');
            menu.classList.toggle('hidden');
        }
    </script>
</body>

</html>