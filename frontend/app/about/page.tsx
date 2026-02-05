"use client";

import { GlassCard } from '@/components/ui/GlassCard';
import { Logo } from '@/components/ui/Logo';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, GitBranch, PlayCircle, UserCheck } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import Link from 'next/link';

export default function AboutPage() {
    const { t } = useLanguage();

    const steps = [
        {
            icon: <UserCheck className="w-8 h-8 text-blue-400" />,
            title: t('about.step1_title'),
            desc: t('about.step1_desc')
        },
        {
            icon: <GitBranch className="w-8 h-8 text-purple-400" />,
            title: t('about.step2_title'),
            desc: t('about.step2_desc')
        },
        {
            icon: <Sparkles className="w-8 h-8 text-yellow-400" />,
            title: t('about.step3_title'),
            desc: t('about.step3_desc')
        },
        {
            icon: <BookOpen className="w-8 h-8 text-green-400" />,
            title: t('about.step4_title'),
            desc: t('about.step4_desc')
        }
    ];

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[100px]" />
            </div>

            {/* Navigation */}
            <nav className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50 max-w-7xl mx-auto w-full">
                <Link href="/">
                    <Logo size="large" />
                </Link>
                <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
                    {t('nav.login')}
                </Link>
            </nav>

            <main className="max-w-4xl w-full z-10 pt-24 pb-16 space-y-24">

                {/* Story Section */}
                <section className="text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-white to-purple-200 mb-6 font-serif">
                            {t('about.title')}
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 italic font-serif leading-relaxed mb-12">
                            &quot;{t('about.subtitle')}&quot;
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <GlassCard className="text-left p-8 md:p-12 bg-white/5 border-white/10">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                                <BookOpen className="w-6 h-6 text-blue-400" />
                                <span>{t('about.story_title')}</span>
                            </h2>
                            <div className="space-y-4 text-gray-300 leading-8 text-lg whitespace-pre-line">
                                {t('about.story_desc')}
                            </div>
                        </GlassCard>
                    </motion.div>
                </section>

                {/* User Guide Section */}
                <section>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold text-white mb-4">{t('about.guide_title')}</h2>
                        <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full" />
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">

                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute left-1/2 top-10 bottom-10 w-0.5 bg-gradient-to-b from-blue-500/20 via-purple-500/20 to-transparent -translate-x-1/2 z-0" />

                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className={`relative z-10 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'} md:col-start-${index % 2 === 0 ? '1' : '2'}`}
                            >
                                <GlassCard className="p-8 hover:bg-white/10 transition-colors h-full flex flex-col justify-center relative group overflow-hidden">
                                    <div className={`absolute top-0 ${index % 2 === 0 ? 'right-0' : 'left-0'} w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity`} />

                                    <div className={`flex flex-col ${index % 2 === 0 ? 'md:items-end' : 'md:items-start'} items-center space-y-4`}>
                                        <div className="p-3 rounded-full bg-white/5 border border-white/10 mb-2 group-hover:scale-110 transition-transform duration-300">
                                            {step.icon}
                                        </div>
                                        <h3 className="text-xl font-bold text-white group-hover:text-blue-200 transition-colors">{step.title}</h3>
                                        <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                                            {step.desc}
                                        </p>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                </section>

            </main>

            {/* Footer */}
            <footer className="w-full max-w-7xl mx-auto py-8 text-center text-gray-500 text-sm border-t border-white/5">
                <p>© 2026 TRNT Team. All rights reserved.</p>
            </footer>

        </div>
    );
}
