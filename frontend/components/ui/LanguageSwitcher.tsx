'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { type Locale } from '@/lib/i18n/translations';

const languages: { code: Locale; label: string; display: string }[] = [
    { code: 'ko', label: '한국어', display: 'KR' },
    { code: 'en', label: 'English', display: 'EN' },
    { code: 'ja', label: '日本語', display: 'JA' },
    { code: 'zh', label: '中文', display: 'ZH' },
];

export function LanguageSwitcher() {
    const { locale, setLocale } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    const handleLanguageChange = (code: Locale) => {
        setLocale(code);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white flex items-center gap-2 h-10 px-3"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Globe className="w-5 h-5" />
                <span className="text-sm font-medium">{languages.find(l => l.code === locale)?.display ?? locale.toUpperCase()}</span>
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-[#111827]/95 border border-white/10 rounded-xl shadow-xl backdrop-blur-xl z-50 overflow-hidden"
                    >
                        <div className="py-1">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-white/10 flex items-center justify-between transition-colors"
                                    onClick={() => handleLanguageChange(lang.code)}
                                >
                                    <span className="flex items-center gap-3">
                                        <span>{lang.label}</span>
                                    </span>
                                    {locale === lang.code && (
                                        <Check className="w-4 h-4 text-primary" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
