import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';


const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => title ? `${title} - ${appName}` : appName,
    resolve: (name) => {
        const pages = import.meta.glob('./pages/**/*.tsx');
        const pagePromise = resolvePageComponent(`./pages/${name}.tsx`, pages);

        return pagePromise.then((module: any) => {
            const component = module.default;
            const originalLayout = component.layout;

            // Define wrapper layout
            component.layout = (page: any) => {
                let content;
                if (originalLayout) {
                    if (typeof originalLayout === 'function') {
                        content = originalLayout(page);
                    } else {
                        // If layout is a component
                        const Layout = originalLayout;
                        content = <Layout children={page} />;
                    }
                } else {
                    content = page;
                }

                return content;
            };

            return module;
        });
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
// initializeTheme();
