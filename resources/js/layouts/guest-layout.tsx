import React from 'react';
export default function GuestLayout({ children, title, description, ...props }: { children: React.ReactNode; title: string; description: string }) {
    return (
        <div>
            {children}
        </div>
    );
}
