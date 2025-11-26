import React from 'react';
import WelcomeNav from '@/components/navigation/WelcomeNav';
import Footer from '@/components/marketplace/Footer';
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { Toaster } from '@/components/ui/sonner';

export default function GuestLayout({ children, title, description, ...props }: { children: React.ReactNode; title?: string; description?: string }) {
    const { auth } = usePage<SharedData>().props;

    return (
        <div className="min-h-screen bg-white">
            <WelcomeNav auth={auth} />
            
            <main className="pt-20 pb-12">
                {children}
            </main>

            <Footer auth={auth} />
            <Toaster position="bottom-right" richColors />
        </div>
    );
}
