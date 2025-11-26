import { usePage } from '@inertiajs/react';
import { Globe } from 'lucide-react';

const LOCALES = [
    { code: 'en', label: 'EN', full: 'English' },
    { code: 'rw', label: 'RW', full: 'Kinyarwanda' },
];

export default function LocaleSwitcher() {
    const { locale } = usePage<{ locale: string }>().props;
    const current = locale ?? 'en';

    return (
        <div className="flex items-center gap-0.5 border rounded-md overflow-hidden">
            <Globe className="w-3.5 h-3.5 text-gray-400 ml-1.5" />
            {LOCALES.map(({ code, label, full }) => (
                <a
                    key={code}
                    href={`/lang/${code}`}
                    title={full}
                    className={`px-2 py-1 text-xs font-medium transition-colors ${
                        current === code
                            ? 'bg-emerald-600 text-white'
                            : 'text-gray-500 hover:bg-gray-50'
                    }`}
                >
                    {label}
                </a>
            ))}
        </div>
    );
}
