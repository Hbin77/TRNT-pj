'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Logo } from '@/components/ui/Logo';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, BookOpen, Compass, PlayCircle, GitBranch, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

export default function Home() {
  const { t } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen relative overflow-hidden text-white selection:bg-primary/30">

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 container mx-auto px-6 py-6 flex justify-between items-center">
        <Link href="/" className="group">
          <Logo />
        </Link>
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/login">
            <Button variant="ghost" className="text-gray-400 hover:text-white">{t('nav.login')}</Button>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/register">
              <Button className="shadow-lg shadow-primary/20">{t('nav.start')}</Button>
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-16 pb-32 container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Hero Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-left space-y-8"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary-foreground text-sm font-medium">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              {t('hero.badge')}
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
              {t('hero.title_prefix')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-purple-400">{t('hero.title_highlight')}</span>{t('hero.title_suffix')}
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg text-gray-400 max-w-xl leading-relaxed">
              {t('hero.description')}
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 pt-4">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                  {t('hero.start_btn')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="#preview" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg h-14 px-8 bg-white/5 border-white/10 hover:bg-white/10">
                  <PlayCircle className="mr-2 w-5 h-5" />
                  {t('hero.preview_btn')}
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-8 flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`w-10 h-10 rounded-full border-2 border-[#030712] flex items-center justify-center text-xs font-bold text-white z-${10 - i}`} style={{ backgroundColor: `hsl(${220 + i * 10}, 70%, ${50 + i * 5}%)` }}>
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <p>{t('hero.stats')}</p>
            </motion.div>
          </motion.div>

          {/* Hero Visual - Abstract 3D Representation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-[4/3] max-w-[600px] mx-auto perspective-1000">
              {/* Floating Cards Effect */}
              <motion.div
                animate={{ y: [0, 25, 0] }}
                transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-10 -right-10 w-80 z-30"
              >
                <GlassCard className="bg-[#0A0A0F]/80 backdrop-blur-xl border-white/10 p-6 shadow-2xl">
                  <div className="flex flex-col relative">
                    <Quote className="w-8 h-8 text-blue-400/50 absolute -top-2 -left-2 rotate-180" />
                    <blockquote className="text-white/90 text-sm leading-relaxed font-medium italic pl-6 pt-2 mb-4 font-serif">
                      &quot;Two roads diverged in a wood, and I—<br />
                      I took the one less traveled by.&quot;
                    </blockquote>
                    <div className="flex items-center justify-end space-x-3 border-t border-white/5 pt-3">
                      <div className="text-right">
                        <div className="text-xs text-blue-300 font-bold tracking-wide">Robert Frost</div>
                        <div className="text-[10px] text-white/40 uppercase tracking-widest">The Road Not Taken</div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center border border-blue-500/20">
                        <span className="text-xs">🍂</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Main Visual - Infinite Possibilities Card */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="relative z-10 w-full h-full rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-md transform rotate-[-6deg] overflow-hidden shadow-2xl group"
              >
                <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />

                <img
                  src="/hero-visual.png"
                  alt="Infinite Possibilities"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Features Bento Grid */}
        <section className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">{t('features.title')}</h2>
            <p className="text-gray-400 text-lg">{t('features.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Feature 1 (Large) */}
            <GlassCard className="md:col-span-2 md:row-span-2 p-10 flex flex-col justify-between overflow-hidden relative group border-primary/20 bg-primary/5">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <BookOpen className="w-40 h-40" />
              </div>
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6 text-primary">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">{t('features.engine_title')}</h3>
                <p className="text-lg text-gray-300 leading-relaxed max-w-md">
                  {t('features.engine_desc')}
                </p>
              </div>
              <div className="mt-8">
                <div className="flex items-center space-x-2 text-primary font-medium">
                  <span>{t('features.try_btn')}</span> <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </GlassCard>

            {/* Feature 2 */}
            <GlassCard className="p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 text-purple-400">
                <GitBranch className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('features.sim_title')}</h3>
              <p className="text-gray-400">
                {t('features.sim_desc')}
              </p>
            </GlassCard>

            {/* Feature 3 */}
            <GlassCard className="p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 text-blue-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('features.visual_title')}</h3>
              <p className="text-gray-400">
                {t('features.visual_desc')}
              </p>
            </GlassCard>

            {/* Feature 4 (Wide) */}
            <GlassCard className="md:col-span-3 p-8 flex items-center justify-between flex-wrap gap-6 bg-gradient-to-r from-gray-900 to-gray-800">
              <div className="flex-1 min-w-[300px]">
                <h3 className="text-xl font-bold text-white mb-2">{t('features.cta_title')}</h3>
                <p className="text-gray-400">
                  {t('features.cta_desc')}
                </p>
              </div>
              <Link href="/register">
                <Button variant="outline" className="h-12 border-white/20 hover:bg-white/10">
                  {t('features.free_btn')}
                </Button>
              </Link>
            </GlassCard>

          </div>
        </section>

        {/* Footer */}
        <footer className="mt-32 pt-16 border-t border-white/5 text-center text-gray-500 pb-8">
          <div className="flex items-center justify-center space-x-2 mb-4 opacity-50">
            <Sparkles className="w-5 h-5" />
            <span className="font-bold text-lg">TRNT</span>
          </div>
          <p className="mb-4">The Road Not Taken</p>
          <div className="flex justify-center space-x-6 text-sm mb-8">
            <Link href="/terms" className="hover:text-white transition-colors">{t('footer.terms')}</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">{t('footer.privacy')}</Link>
            <Link href="/about" className="hover:text-white transition-colors">{t('footer.about')}</Link>
          </div>
          <p className="text-xs">{t('footer.rights')}</p>
        </footer>
      </main>
    </div>
  );
}
