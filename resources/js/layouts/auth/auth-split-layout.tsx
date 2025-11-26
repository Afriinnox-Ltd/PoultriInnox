import WelcomeNav from '@/components/navigation/WelcomeNav';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    const { auth } = usePage<SharedData>().props;

    return (
        <div className="min-h-screen bg-white">
            <WelcomeNav auth={auth} />

            <div className="flex flex-col lg:flex-row min-h-screen  ">
                {/* Left Side: Form Area */}
                <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 lg:p-20 z-10 bg-white">
                    <div className="w-full max-w-md space-y-8">
                        <div className="text-center lg:text-left">
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
                                {title}
                            </h1>
                            {description && (
                                <p className="mt-3 text-lg text-gray-500">
                                    {description}
                                </p>
                            )}
                        </div>

                        <div className="mt-10">
                            {children}
                        </div>
                    </div>
                </div>

                {/* Right Side: Immersive Visual */}
                <div className="hidden lg:block relative flex-1">
                    <div className="absolute inset-0">
                     
                        <div className="absolute inset-0 bg-emerald-600/40 mix-blend-multiply" />
                        <div className="absolute inset-0 bg-emerald-600" />
                    </div>

                    <div className="absolute bottom-12 left-12 right-12 text-white">
                        <div className="space-y-4">
                            
                            <h2 className="text-4xl font-bold tracking-tight">
                                Empowering the next generation of farmers.
                            </h2>
                            <p className="max-w-xl text-lg text-emerald-100">
                                Join a community of thousands of farmers across Rwanda using smart tools to grow their business and improve productivity.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
