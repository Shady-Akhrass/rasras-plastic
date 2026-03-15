import React, { useEffect, useState, useRef } from 'react';
import {
    MapPin, Phone, Mail, Globe,
    ChevronDown,
    Target, Eye, Award, Users, TrendingUp,
    ArrowUp, Sparkles, MessageCircle, Clock,
    CheckCircle2, Star, Package, Layers, Zap,
    ShieldCheck, Network, BarChart3,
    Factory, Car, UtensilsCrossed, HardHat, ShoppingCart, Cpu,
    BookOpen, Download, FileText
} from 'lucide-react';

interface CompanyInfo {
    companyNameAr: string;
    companyNameEn: string;
    address: string;
    city: string;
    country: string;
    phone: string;
    fax: string;
    email: string;
    website: string;
    logoPath: string;
    headerPath: string;
    footerText: string;
    aboutText?: string;
    visionText?: string;
    missionText?: string;
    goalsText?: string;
    statsHappyClients?: number;
    statsYearsExperience?: number;
    statsProjectsCompleted?: number;
    statsCustomerSatisfaction?: number;
    footerTextEn?: string;
    aboutTextEn?: string;
    visionTextEn?: string;
    missionTextEn?: string;
    goalsTextEn?: string;
    servicesContentAr?: string;
    servicesContentEn?: string;
    productsContentAr?: string;
    productsContentEn?: string;
    partnersContent?: string;
    industriesContentAr?: string;
    industriesContentEn?: string;
    brochurePath?: string;
}

// Intersection Observer Hook for scroll animations
const useIntersectionObserver = (options = {}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.disconnect();
            }
        }, { threshold: 0.1, ...options });

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return { ref, isVisible };
};

// Animated Counter Component
const AnimatedCounter: React.FC<{ end: number; suffix?: string; duration?: number }> = ({
    end, suffix = '', duration = 2000
}) => {
    const [count, setCount] = useState(0);
    const { ref, isVisible } = useIntersectionObserver();

    useEffect(() => {
        if (!isVisible) return;

        let startTime: number;
        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [isVisible, end, duration]);

    return <span ref={ref}>{count}{suffix}</span>;
};

// جزيئات عائمة ناعمة - أقل تشتيتاً
const FloatingParticles: React.FC = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
            <div
                key={i}
                className="absolute w-1.5 h-1.5 md:w-2 md:h-2 bg-white/15 rounded-full animate-float"
                style={{
                    left: `${10 + (i * 7) % 80}%`,
                    top: `${15 + (i * 11) % 70}%`,
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: `${6 + (i % 4)}s`
                }}
            />
        ))}
    </div>
);

// Stats Item - ظهور انسيابي
const StatItem: React.FC<{
    icon: React.ReactNode;
    value: number;
    suffix: string;
    label: string;
    delay: number;
}> = ({ icon, value, suffix, label, delay }) => {
    const { ref, isVisible } = useIntersectionObserver();

    return (
        <div
            ref={ref}
            className={`text-center px-4 py-8 md:py-10 transition-all duration-700 ease-out
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ transitionDelay: `${delay}ms`, transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
        >
            <div className="w-12 h-12 mx-auto mb-4 bg-white/15 backdrop-blur-md rounded-xl 
                flex items-center justify-center text-white border border-white/10
                hover:bg-white/25 transition-colors duration-300">
                {icon}
            </div>
            <div className="text-3xl md:text-5xl font-extrabold text-white mb-1.5 tabular-nums">
                <AnimatedCounter end={value} suffix={suffix} />
            </div>
            <p className="text-white/70 text-xs md:text-sm font-medium uppercase tracking-wide">{label}</p>
        </div>
    );
};

// Feature Card Component - انسياب عند الظهور
const FeatureCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    delay: number;
}> = ({ icon, title, description, delay }) => {
    const { ref, isVisible } = useIntersectionObserver();

    return (
        <div
            ref={ref}
            className={`group relative bg-white p-6 md:p-7 rounded-2xl border border-slate-100/80 
                hover:border-brand-primary/25 hover:shadow-lg hover:shadow-brand-primary/8 
                transition-all duration-400 ease-out hover:-translate-y-0.5
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: `${delay}ms`, transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
        >
            {/* top accent */}
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-brand-primary/0 via-brand-primary/40 to-brand-primary/0 
                rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

            <div className="flex items-start gap-5">
                <div className="shrink-0 w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center 
                    group-hover:bg-brand-primary group-hover:text-white group-hover:scale-105
                    text-brand-primary transition-all duration-300 ease-out">
                    {icon}
                </div>
                <div>
                    <h3 className="text-base md:text-lg font-bold text-slate-800 mb-1.5">{title}</h3>
                    <p className="text-slate-500 leading-relaxed text-sm md:text-[15px]">{description}</p>
                </div>
            </div>
        </div>
    );
};

const PublicCompanyPage: React.FC = () => {
    const [company, setCompany] = useState<CompanyInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [showNavbar, setShowNavbar] = useState(false);
    const [locale, setLocale] = useState<'ar' | 'en'>(() =>
        typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'ar'
    );
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        company: '',
        message: ''
    });

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_URL;
                const response = await fetch(`${baseUrl}/api/public/company`);
                if (!response.ok) {
                    throw new Error(`HTTP error ${response.status}`);
                }
                const json = await response.json();
                if (json?.data) {
                    setCompany(json.data);
                } else {
                    throw new Error('No data in response');
                }
            } catch (err) {
                console.error('Failed to load public company info', err);
                setError('فشل تحميل بيانات الشركة');
            } finally {
                setLoading(false);
            }
        };
        fetchInfo();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 500);
            setShowNavbar(window.scrollY > window.innerHeight * 0.6);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    const handleContactChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setContactForm(prev => ({ ...prev, [name]: value }));
    };

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!company?.email) return;
        const subject =
            locale === 'ar'
                ? `تواصل من موقع ${company.companyNameAr}`
                : `Contact from ${company.companyNameEn || company.companyNameAr} website`;
        const lines = [
            locale === 'ar' ? `الاسم: ${contactForm.name}` : `Name: ${contactForm.name}`,
            locale === 'ar' ? `البريد: ${contactForm.email}` : `Email: ${contactForm.email}`,
            locale === 'ar' ? `اسم الشركة: ${contactForm.company}` : `Company: ${contactForm.company}`,
            '',
            locale === 'ar' ? 'الرسالة:' : 'Message:',
            contactForm.message
        ];
        const body = encodeURIComponent(lines.join('\n'));
        const mailto = `mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${body}`;
        window.location.href = mailto;
    };

    // Loading State with Skeleton
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                {/* Skeleton Hero */}
                <div className="h-[70vh] bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                        animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                </div>

                {/* Skeleton Content */}
                <div className="container mx-auto px-6 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-48 bg-white rounded-2xl animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-center p-12 bg-white rounded-3xl shadow-xl">
                    <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full 
                        flex items-center justify-center">
                        <span className="text-4xl">😔</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">عذراً!</h2>
                    <p className="text-red-500 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-brand-primary text-white rounded-xl 
                            hover:bg-brand-primary/90 transition-colors"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            </div>
        );
    }

    if (!company) return null;

    // Helper to resolve image URL
    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http') || url.startsWith('blob:')) return url;
        const baseUrl = import.meta.env.VITE_API_URL || 'https://api.rasrasplastic.com';
        return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    // Helpers to parse services/products content from dashboard (each line in a specific format)
    const parseServices = (raw: string | undefined, locale: 'ar' | 'en') => {
        if (!raw) return null;
        const lines = raw
            .split('\n')
            .map(l => l.trim())
            .filter(Boolean);
        if (!lines.length) return null;
        return lines.map(line => {
            const [title, desc] = line.split('|').map(p => p.trim());
            return {
                title: title || (locale === 'ar' ? 'خدمة' : 'Service'),
                desc: desc || ''
            };
        });
    };

    const parseProducts = (raw: string | undefined, locale: 'ar' | 'en') => {
        if (!raw) return null;
        const lines = raw
            .split('\n')
            .map(l => l.trim())
            .filter(Boolean);
        if (!lines.length) return null;
        return lines.map(line => {
            const parts = line.split('|').map(p => p.trim());
            const title = parts[0] || (locale === 'ar' ? 'منتج' : 'Product');
            const subtitle = parts[1] || '';
            const highlight = parts[2] || '';
            return { title, subtitle, highlight };
        });
    };

    const parsePartners = (raw: string | undefined) => {
        if (!raw) return null;
        const lines = raw
            .split('\n')
            .map(l => l.trim())
            .filter(Boolean);
        if (!lines.length) return null;
        return lines.map(line => {
            const parts = line.split('|').map(p => p.trim());
            const name = parts[0] || 'Partner';
            const logo = parts[1] || '';
            const url = parts[2] || '';
            return { name, logo, url };
        });
    };

    const parseIndustries = (raw: string | undefined) => {
        if (!raw) return null;
        const lines = raw
            .split('\n')
            .map(l => l.trim())
            .filter(line => line && line !== '|');
        if (!lines.length) return null;
        return lines.map(line => {
            const [title, desc] = line.split('|').map(p => p.trim());
            return { title: title || '', desc: desc || '' };
        }).filter(item => item.title);
    };

    return (
        <div
            className="min-h-screen bg-slate-50 font-readex antialiased scroll-smooth"
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
        >
            {/* Sticky Navbar - يظهر بعد تجاوز الهيرو */}
            <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-out
                ${showNavbar
                    ? 'translate-y-0 opacity-100 pointer-events-auto'
                    : '-translate-y-full opacity-0 pointer-events-none'
                }`}>
                <div className="bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-sm shadow-slate-200/60">
                    <div className="container mx-auto px-6 max-w-6xl flex items-center justify-between h-14">
                        <div className="flex items-center gap-3">
                            {company.logoPath && (
                                <img src={getImageUrl(company.logoPath)} alt="Logo"
                                    className="w-7 h-7 object-contain" />
                            )}
                            <span className="font-bold text-slate-800 text-sm">
                                {locale === 'ar' ? company.companyNameAr : (company.companyNameEn || company.companyNameAr)}
                            </span>
                        </div>
                        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                            {(locale === 'ar'
                                ? [
                                    { label: 'من نحن', href: '#about' },
                                    { label: 'خدماتنا', href: '#services' },
                                    { label: 'منتجاتنا', href: '#products' },
                                    { label: 'القطاعات', href: '#industries' },
                                    { label: 'شركاؤنا', href: '#partners' }
                                  ]
                                : [
                                    { label: 'About', href: '#about' },
                                    { label: 'Services', href: '#services' },
                                    { label: 'Products', href: '#products' },
                                    { label: 'Industries', href: '#industries' },
                                    { label: 'Partners', href: '#partners' }
                                  ]
                            ).map(item => (
                                <a key={item.label} href={item.href}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="hover:text-brand-primary transition-colors duration-200">
                                    {item.label}
                                </a>
                            ))}
                        </div>
                        <a href="#contact"
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white 
                                rounded-xl text-sm font-bold hover:bg-brand-primary/90 transition-colors duration-200">
                            <MessageCircle className="w-4 h-4" />
                            <span>{locale === 'ar' ? 'تواصل' : 'Contact'}</span>
                        </a>
                    </div>
                </div>
            </nav>

            {/* Custom Styles - انسيابية وتدفق بصري */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
                    50% { transform: translateY(-12px) scale(1.05); opacity: 0.9; }
                }
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                @keyframes gradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-float { animation: float 8s ease-in-out infinite; }
                .animate-shimmer { animation: shimmer 2.5s ease-in-out infinite; }
                .animate-gradient { background-size: 200% 200%; animation: gradient 18s ease infinite; }
                .animate-fade-up { animation: fadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
                .section-flow { transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1); }
                @keyframes localeFlip {
                    0% {
                        opacity: 0;
                        transform: perspective(800px) rotateX(80deg) translateY(10px);
                        transform-origin: center bottom;
                    }
                    40% {
                        opacity: 0.5;
                        transform: perspective(800px) rotateX(-10deg) translateY(2px);
                    }
                    100% {
                        opacity: 1;
                        transform: perspective(800px) rotateX(0deg) translateY(0);
                    }
                }
                .animate-locale-flip {
                    animation: localeFlip 1s cubic-bezier(0.19, 1, 0.22, 1);
                }
                @keyframes logoMarquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>

            {/* Hero Section - انسياب من الأعلى */}
            <section className="relative min-h-screen flex items-center overflow-hidden">
                {/* Language Toggle */}
                <div className="absolute top-6 right-6 z-20">
                    <button
                        type="button"
                        onClick={() => setLocale(prev => (prev === 'ar' ? 'en' : 'ar'))}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 text-white text-xs md:text-sm
                            border border-white/30 backdrop-blur-md hover:bg-black/60 transition-all duration-200"
                    >
                        <Globe className="w-4 h-4" />
                        <span className="font-medium">
                            {locale === 'ar' ? 'English' : 'العربية'}
                        </span>
                    </button>
                </div>
                {/* Background */}
                {company.headerPath ? (
                    <>
                        <img
                            src={getImageUrl(company.headerPath)}
                            alt="Header"
                            className="absolute inset-0 w-full h-full object-cover scale-105 transition-transform duration-[2s] ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 transition-opacity duration-500" />
                    </>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-primary via-brand-primary/95 to-slate-800 animate-gradient" />
                )}

                <FloatingParticles />

                {/* Content - ظهور تدريجي */}
                <div className="relative container mx-auto px-6 py-24 max-w-6xl">
                    <div className="max-w-3xl space-y-8">
                        {/* Logo */}
                        {company.logoPath && (
                            <div className="w-24 h-24 md:w-28 md:h-28 bg-white/15 backdrop-blur-xl rounded-3xl p-3 
                                shadow-2xl border border-white/25 animate-fade-up" style={{ animationDelay: '0.1s' }}>
                                <img
                                    src={getImageUrl(company.logoPath)}
                                    alt="Logo"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        )}

                        <div className="space-y-5">
                            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/15 
                                backdrop-blur-md rounded-full text-white/90 text-sm font-medium 
                                animate-fade-up border border-white/20" style={{ animationDelay: '0.2s' }}>
                                <Sparkles className="w-4 h-4" />
                                <span key={locale} className="animate-locale-flip">
                                    {locale === 'ar' ? 'مرحباً بكم في' : 'Welcome to'}
                                </span>
                            </div>

                            <h1
                                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.15] tracking-tight animate-fade-up"
                                style={{ animationDelay: '0.25s' }}
                            >
                                <span key={locale} className="inline-block animate-locale-flip">
                                    {locale === 'ar' ? company.companyNameAr : company.companyNameEn || company.companyNameAr}
                                </span>
                            </h1>

                            <p
                                className="text-xl md:text-2xl text-white/75 font-light leading-relaxed animate-fade-up"
                                dir="ltr"
                                style={{ animationDelay: '0.3s' }}
                            >
                                <span key={locale} className="inline-block animate-locale-flip">
                                    {locale === 'ar'
                                        ? company.companyNameEn
                                        : company.companyNameEn || 'RasRas Plastics'}
                                </span>
                            </p>

                            <p
                                className="text-lg md:text-xl text-white/60 max-w-xl leading-relaxed animate-fade-up"
                                style={{ animationDelay: '0.35s' }}
                            >
                                <span key={locale} className="inline-block animate-locale-flip">
                                    {locale === 'ar'
                                        ? (company.aboutText && company.aboutText.trim().length > 0
                                            ? company.aboutText
                                            : 'نحن ملتزمون بتقديم أعلى معايير الجودة والتميز في خدماتنا، ونسعى دائماً لتحقيق رضا عملائنا.')
                                        : (company.aboutTextEn && company.aboutTextEn.trim().length > 0
                                            ? company.aboutTextEn
                                            : 'We are committed to delivering the highest standards of quality and excellence, building long-term partnerships and customer satisfaction.')}
                                </span>
                            </p>

                            <div className="flex flex-wrap gap-4 pt-4 animate-fade-up" style={{ animationDelay: '0.45s' }}>
                                <a
                                    href="#contact"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="group inline-flex items-center gap-3 px-7 py-3.5 
                                        bg-white text-brand-primary rounded-2xl font-bold 
                                        hover:bg-white/95 hover:shadow-2xl hover:shadow-white/25 hover:-translate-y-0.5
                                        transition-all duration-300 ease-out"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    <span>{locale === 'ar' ? 'تواصل معنا' : 'Contact us'}</span>
                                </a>
                                {company.phone && (
                                    <a
                                        href={`tel:${company.phone}`}
                                        className="group inline-flex items-center gap-3 px-7 py-3.5 
                                            bg-white/15 backdrop-blur-md text-white rounded-2xl 
                                            font-bold border border-white/25 hover:bg-white/25 hover:-translate-y-0.5
                                            transition-all duration-300 ease-out"
                                    >
                                        <Phone className="w-5 h-5" />
                                        <span dir="ltr">{company.phone}</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator - انسياب */}
                <button
                    type="button"
                    onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                    className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/60 hover:text-white 
                        transition-colors duration-300 cursor-pointer flex flex-col items-center gap-1"
                >
                    <span className="text-xs font-medium">
                        {locale === 'ar' ? 'اكتشف المزيد' : 'Discover more'}
                    </span>
                    <ChevronDown className="w-8 h-8 animate-bounce" />
                </button>

                {/* موجة انسيابية ناعمة على حافة القسم بالكامل */}
                <div className="absolute inset-x-0 bottom-0 pointer-events-none">
                    <svg
                        viewBox="0 0 1440 120"
                        className="w-full h-24 md:h-32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        preserveAspectRatio="none"
                    >
                        <path d="M0 120C360 80 720 40 1080 70C1260 85 1380 95 1440 100V120H0Z" fill="#f8fafc" className="transition-all duration-700" />
                        <path d="M0 120C300 90 600 60 900 75C1200 90 1320 100 1440 105V120H0Z" fill="#f1f5f9" className="transition-all duration-700" opacity="0.8" />
                    </svg>
                </div>
            </section>

            {/* Stats Section */}
            <section className="relative -mt-1 py-16 md:py-24 overflow-hidden section-flow">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary via-brand-primary/95 to-slate-800" />
                <FloatingParticles />
                {/* inner glow */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.06)_0%,_transparent_70%)] pointer-events-none" />

                <div className="relative container mx-auto px-6 max-w-6xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10 rtl:divide-x-reverse">
                        <StatItem
                            icon={<Users className="w-8 h-8" />}
                            value={company.statsHappyClients ?? 500}
                            suffix="+"
                            label={locale === 'ar' ? 'عميل سعيد' : 'Happy clients'}
                            delay={0}
                        />
                        <StatItem
                            icon={<Award className="w-8 h-8" />}
                            value={company.statsYearsExperience ?? 15}
                            suffix="+"
                            label={locale === 'ar' ? 'سنة خبرة' : 'Years of experience'}
                            delay={100}
                        />
                        <StatItem
                            icon={<CheckCircle2 className="w-8 h-8" />}
                            value={company.statsProjectsCompleted ?? 1000}
                            suffix="+"
                            label={locale === 'ar' ? 'مشروع منجز' : 'Projects delivered'}
                            delay={200}
                        />
                        <StatItem
                            icon={<Star className="w-8 h-8" />}
                            value={company.statsCustomerSatisfaction ?? 98}
                            suffix="%"
                            label={locale === 'ar' ? 'رضا العملاء' : 'Customer satisfaction'}
                            delay={300}
                        />
                    </div>
                </div>
            </section>

            {/* About Section - خلفية بيضاء نظيفة */}
            <section id="about" className="relative py-20 md:py-28 bg-white overflow-hidden">
                {/* subtle decoration */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.05)_0%,_transparent_60%)] pointer-events-none" />
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
                        {/* Text Content */}
                        <div className="space-y-8">
                            <div className="space-y-5">
                                <span className="inline-block px-5 py-2.5 bg-brand-primary/10 text-brand-primary 
                                    rounded-full text-sm font-semibold tracking-wide">
                                    {locale === 'ar' ? 'من نحن' : 'About us'}
                                </span>
                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 leading-[1.2] tracking-tight">
                                    {locale === 'ar'
                                        ? <>نبني المستقبل مع<span className="text-brand-primary"> شركائنا</span></>
                                        : <>Building the future with<span className="text-brand-primary"> our partners</span></>}
                                </h2>
                                <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-xl">
                                    {locale === 'ar'
                                        ? (company.aboutText && company.aboutText.trim().length > 0
                                            ? company.aboutText
                                            : `${company.companyNameAr} هي مؤسسة رائدة في مجالها، نسعى لتقديم أفضل الخدمات والحلول المبتكرة لعملائنا في ${company.city} وجميع أنحاء ${company.country}.`)
                                        : (company.aboutTextEn && company.aboutTextEn.trim().length > 0
                                            ? company.aboutTextEn
                                            : `${company.companyNameEn || 'RasRas Plastics'} is a leading company in its field, providing high‑quality plastic raw materials and integrated solutions to factories and partners in Egypt and beyond.`)}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {(locale === 'ar'
                                    ? [
                                        { text: 'فريق متخصص من الخبراء', icon: <Users className="w-4 h-4" /> },
                                        { text: 'حلول مبتكرة ومتكاملة', icon: <Zap className="w-4 h-4" /> },
                                        { text: 'دعم فني على مدار الساعة', icon: <Clock className="w-4 h-4" /> },
                                        { text: 'التزام بأعلى معايير الجودة', icon: <ShieldCheck className="w-4 h-4" /> }
                                    ]
                                    : [
                                        { text: 'A specialized team of experts', icon: <Users className="w-4 h-4" /> },
                                        { text: 'Innovative and integrated solutions', icon: <Zap className="w-4 h-4" /> },
                                        { text: 'Technical support around the clock', icon: <Clock className="w-4 h-4" /> },
                                        { text: 'Commitment to the highest quality', icon: <ShieldCheck className="w-4 h-4" /> }
                                    ]).map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-brand-primary/5 
                                            border border-slate-100 hover:border-brand-primary/20 transition-all duration-200 group">
                                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center 
                                                text-brand-primary shadow-sm group-hover:scale-105 transition-transform duration-200 shrink-0">
                                                {feature.icon}
                                            </div>
                                            <span className="text-slate-700 font-medium text-sm">{feature.text}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Vision & Mission Cards */}
                        <div className="space-y-5 lg:space-y-6">
                            <FeatureCard
                                icon={<Eye className="w-8 h-8" />}
                                title={locale === 'ar' ? 'رؤيتنا' : 'Our vision'}
                                description={locale === 'ar'
                                    ? (company.visionText && company.visionText.trim().length > 0
                                        ? company.visionText
                                        : 'أن نكون الخيار الأول والشريك الموثوق في تقديم الحلول المتكاملة، ونسعى للريادة والتميز في كل ما نقدمه.')
                                    : 'To be the preferred and trusted partner for supplying high‑quality plastic raw materials and integrated solutions.'}
                                delay={0}
                            />
                            <FeatureCard
                                icon={<Target className="w-8 h-8" />}
                                title={locale === 'ar' ? 'مهمتنا' : 'Our mission'}
                                description={locale === 'ar'
                                    ? (company.missionText && company.missionText.trim().length > 0
                                        ? company.missionText
                                        : 'تقديم خدمات عالية الجودة تفوق توقعات عملائنا، مع الحفاظ على القيم والمبادئ التي تميزنا في السوق.')
                                    : 'To deliver high‑quality services and materials that exceed customer expectations while maintaining our values and principles.'}
                                delay={100}
                            />
                            <FeatureCard
                                icon={<TrendingUp className="w-8 h-8" />}
                                title={locale === 'ar' ? 'أهدافنا' : 'Our goals'}
                                description={locale === 'ar'
                                    ? (company.goalsText && company.goalsText.trim().length > 0
                                        ? company.goalsText
                                        : 'التطوير المستمر والابتكار في خدماتنا، وبناء علاقات طويلة الأمد مع عملائنا وشركائنا.')
                                    : 'Continuous development and innovation in our services, and building long‑term partnerships with our clients and stakeholders.'}
                                delay={200}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="relative py-20 md:py-28 bg-gradient-to-b from-emerald-50 to-white overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(16,185,129,0.08)_0%,_transparent_60%)] pointer-events-none" />
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="text-center mb-14 md:mb-16">
                        <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary/10 text-brand-primary 
                            rounded-full text-sm font-semibold mb-5">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                            {locale === 'ar' ? 'خدماتنا' : 'Our services'}
                        </span>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4 leading-tight">
                            {locale === 'ar'
                                ? <>حلول متكاملة <span className="text-brand-primary">لخامات البلاستيك</span></>
                                : <>Integrated solutions for <span className="text-brand-primary">plastic materials</span></>}
                        </h2>
                        <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                            {locale === 'ar'
                                ? 'نقدم مجموعة متكاملة من الخدمات لدعم المصانع والعملاء في حصولهم على أفضل خامات البلاستيك البتروكيماوية.'
                                : 'We provide a full range of services to support factories and customers in sourcing the best petrochemical plastic raw materials.'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {(parseServices(locale === 'ar' ? company.servicesContentAr : company.servicesContentEn, locale)
                            ?? (locale === 'ar'
                                ? [
                                    {
                                        title: 'الاستيراد والتصدير',
                                        desc: 'نسهّل عمليات الاستيراد والتصدير عبر إدارة المستندات والشحن والتخليص لضمان وصول الشحنات بأمان وفي الوقت المحدد.'
                                    },
                                    {
                                        title: 'توريد خامات عالية الجودة',
                                        desc: 'نوفر خامات بلاستيك بتروكيماوية عالية الجودة من أفضل الموردين العالميين بما يتوافق مع احتياجات خطوط الإنتاج.'
                                    },
                                    {
                                        title: 'حلول مخصصة',
                                        desc: 'نقدم حلول توريد مرنة من حيث الكميات والدرجات والمواعيد بما يتناسب مع طبيعة كل عميل ونشاطه الصناعي.'
                                    },
                                    {
                                        title: 'تسعير شفاف',
                                        desc: 'نحرص على تقديم تسعير واضح وتواصل مستمر في جميع مراحل الطلب من العرض وحتى التسليم النهائي.'
                                    },
                                    {
                                        title: 'شبكة موردين عالمية',
                                        desc: 'علاقات قوية مع كبرى الشركات العالمية تتيح لنا توفير خامات تنافسية من حيث الجودة والسعر والتوافر.'
                                    },
                                    {
                                        title: 'دعم للصناعة',
                                        desc: 'نلبي احتياجات قطاعات صناعية متعددة عبر توفير خامات تدعم الاستدامة والتطوير في خطوط الإنتاج.'
                                    }
                                ]
                                : [
                                    {
                                        title: 'Import & Export',
                                        desc: 'We simplify import and export operations through documentation management, shipping and clearance to ensure safe and on‑time delivery.'
                                    },
                                    {
                                        title: 'High‑quality sourcing',
                                        desc: 'We supply high‑quality petrochemical plastic raw materials from top global producers, aligned with your production needs.'
                                    },
                                    {
                                        title: 'Custom solutions',
                                        desc: 'Flexible sourcing options in terms of quantities, grades and schedules tailored to each customer and industry.'
                                    },
                                    {
                                        title: 'Transparent pricing',
                                        desc: 'Clear pricing and continuous communication at every stage of the order from quotation to final delivery.'
                                    },
                                    {
                                        title: 'Global supplier network',
                                        desc: 'Strong relationships with leading global companies enable us to offer competitive quality, price and availability.'
                                    },
                                    {
                                        title: 'Industry support',
                                        desc: 'We serve multiple industrial sectors by providing materials that support sustainability and development in production lines.'
                                    }
                                ])).map((service, idx) => {
                                    const serviceIcons = [
                                        <Layers className="w-5 h-5" />,
                                        <ShieldCheck className="w-5 h-5" />,
                                        <Zap className="w-5 h-5" />,
                                        <BarChart3 className="w-5 h-5" />,
                                        <Network className="w-5 h-5" />,
                                        <CheckCircle2 className="w-5 h-5" />
                                    ];
                                    return (
                                        <div
                                            key={service.title}
                                            className="group relative bg-white rounded-2xl p-6 border border-slate-100 
                                            hover:border-brand-primary/30 hover:shadow-xl hover:shadow-brand-primary/8 
                                            transition-all duration-300 overflow-hidden hover:-translate-y-1.5"
                                        >
                                            {/* top accent on hover */}
                                            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-brand-primary to-transparent 
                                            opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            <div className="relative">
                                                <div className="flex items-center justify-between mb-5">
                                                    <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center
                                                    group-hover:bg-brand-primary group-hover:text-white group-hover:scale-105 transition-all duration-300">
                                                        {serviceIcons[idx % serviceIcons.length]}
                                                    </div>
                                                    <span className="text-3xl font-black text-slate-100 group-hover:text-brand-primary/15 transition-colors duration-300">
                                                        {String(idx + 1).padStart(2, '0')}
                                                    </span>
                                                </div>
                                                <h3 className="text-base md:text-lg font-bold text-slate-800 mb-2">{service.title}</h3>
                                                <p className="text-slate-500 text-sm leading-relaxed">
                                                    {service.desc}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                    </div>
                </div>
            </section>

            {/* Products Section */}
            <section id="products" className="relative py-20 md:py-28 bg-white overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(16,185,129,0.06)_0%,_transparent_60%)] pointer-events-none" />
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="text-center mb-14 md:mb-16">
                        <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary/10 text-brand-primary 
                            rounded-full text-sm font-semibold mb-5">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                            {locale === 'ar' ? 'منتجاتنا' : 'Our products'}
                        </span>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4 leading-tight">
                            {locale === 'ar'
                                ? <>خامات <span className="text-brand-primary">بلاستيك متنوعة</span> لصناعات مختلفة</>
                                : <>A wide range of <span className="text-brand-primary">plastic raw materials</span></>}
                        </h2>
                        <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                            {locale === 'ar'
                                ? 'نوفر مجموعة واسعة من خامات البلاستيك الأساسية والهندسية لتلبية احتياجات مختلف التطبيقات الصناعية.'
                                : 'We offer a broad selection of commodity and engineering plastics to support a variety of industrial applications.'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {(parseProducts(locale === 'ar' ? company.productsContentAr : company.productsContentEn, locale)
                            ?? (locale === 'ar'
                                ? [
                                    {
                                        title: 'Polyethylene (PE)',
                                        subtitle: 'LDPE, LLDPE, HDPE',
                                        highlight: 'خامات متعددة الاستخدامات للتعبئة والتغليف والمنتجات البلاستيكية العامة.'
                                    },
                                    {
                                        title: 'Polypropylene (PP)',
                                        subtitle: 'Homo-Polymer, Co-Polymer',
                                        highlight: 'مناسب لتطبيقات التعبئة، الألياف، وقطع السيارات والمنتجات المنزلية.'
                                    },
                                    {
                                        title: 'Polyvinyl Chloride (PVC)',
                                        subtitle: 'درجات متنوعة',
                                        highlight: 'يُستخدم في المواسير، الكابلات، مواد البناء والعديد من التطبيقات الصناعية.'
                                    },
                                    {
                                        title: 'Polystyrene (PS)',
                                        subtitle: 'GPPS, HIPS',
                                        highlight: 'مثالي للتعبئة، الأدوات المكتبية، والمنتجات الاستهلاكية خفيفة الوزن.'
                                    },
                                    {
                                        title: 'Polyethylene Terephthalate (PET)',
                                        subtitle: 'PET Resin',
                                        highlight: 'مستخدم بشكل واسع في صناعة عبوات المياه والمشروبات والمنتجات الغذائية.'
                                    },
                                    {
                                        title: 'Engineering Plastics',
                                        subtitle: 'ABS, PC, Nylon وغيرها',
                                        highlight: 'خامات هندسية للتطبيقات التي تتطلب أداءً عالياً ومتانة خاصة.'
                                    }
                                ]
                                : [
                                    {
                                        title: 'Polyethylene (PE)',
                                        subtitle: 'LDPE, LLDPE, HDPE',
                                        highlight: 'Versatile materials used in packaging and general plastic products.'
                                    },
                                    {
                                        title: 'Polypropylene (PP)',
                                        subtitle: 'Homo-Polymer, Co-Polymer',
                                        highlight: 'Suitable for packaging, fibers, automotive parts and household products.'
                                    },
                                    {
                                        title: 'Polyvinyl Chloride (PVC)',
                                        subtitle: 'Various grades',
                                        highlight: 'Used in pipes, cables, building materials and many industrial applications.'
                                    },
                                    {
                                        title: 'Polystyrene (PS)',
                                        subtitle: 'GPPS, HIPS',
                                        highlight: 'Ideal for packaging, stationery and lightweight consumer products.'
                                    },
                                    {
                                        title: 'Polyethylene Terephthalate (PET)',
                                        subtitle: 'PET Resin',
                                        highlight: 'Widely used for water and beverage bottles and food packaging.'
                                    },
                                    {
                                        title: 'Engineering Plastics',
                                        subtitle: 'ABS, PC, Nylon, etc.',
                                        highlight: 'Engineering plastics for applications that require high performance and special durability.'
                                    }
                                ]))
                            .map((product, idx) => (
                                <div
                                    key={product.title}
                                    className="group relative bg-white rounded-2xl border border-slate-100 
                                        hover:border-brand-primary/30 hover:shadow-xl hover:shadow-brand-primary/8 
                                        transition-all duration-300 overflow-hidden hover:-translate-y-1.5"
                                >
                                    {/* colored top bar */}
                                    <div className="h-1 w-full bg-gradient-to-r from-brand-primary/60 to-brand-primary/20 
                                        group-hover:from-brand-primary group-hover:to-brand-primary/60 transition-all duration-300" />
                                    <div className="p-6">
                                        <div className="flex items-start justify-between gap-3 mb-4">
                                            <div className="w-11 h-11 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center
                                                group-hover:bg-brand-primary group-hover:text-white group-hover:scale-105 transition-all duration-300 shrink-0">
                                                <Package className="w-5 h-5" />
                                            </div>
                                            <span className="text-3xl font-black text-slate-100 group-hover:text-brand-primary/20 transition-colors duration-300 leading-none mt-1">
                                                {String(idx + 1).padStart(2, '0')}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-bold text-slate-800 mb-1" dir="ltr">
                                            {product.title}
                                        </h3>
                                        <p className="text-brand-primary text-xs font-bold mb-3 tracking-wide" dir="ltr">
                                            {product.subtitle}
                                        </p>
                                        <p className="text-slate-500 text-sm leading-relaxed">
                                            {product.highlight}
                                        </p>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </section>

            {/* Industries We Serve Section */}
            <section id="industries" className="relative py-20 md:py-28 bg-gradient-to-b from-emerald-50 to-white overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(16,185,129,0.07)_0%,_transparent_60%)] pointer-events-none" />
                <div className="container mx-auto px-6 max-w-6xl">
                    {/* Header */}
                    <div className="text-center mb-14 md:mb-16">
                        <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary/10 text-brand-primary 
                            rounded-full text-sm font-semibold mb-5">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                            {locale === 'ar' ? 'القطاعات التي نخدمها' : 'Industries we serve'}
                        </span>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4 leading-tight">
                            {locale === 'ar'
                                ? <>نخدم <span className="text-brand-primary">قطاعات صناعية</span> متنوعة</>
                                : <>Serving <span className="text-brand-primary">diverse industrial</span> sectors</>}
                        </h2>
                        <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                            {locale === 'ar'
                                ? 'نوفر خامات البلاستيك المناسبة لاحتياجات كل قطاع صناعي، من التعبئة والتغليف إلى البناء والإلكترونيات.'
                                : 'We supply the right plastic raw materials for every industrial sector, from packaging to construction and electronics.'}
                        </p>
                    </div>

                    {/* Industry Cards Grid */}
                    {(() => {
                        const defaultIndustries = locale === 'ar'
                            ? [
                                { title: 'التصنيع البلاستيكي', desc: 'مصانع التصنيع والتعبئة البلاستيكية' },
                                { title: 'السيارات والصناعات', desc: 'مصنّعو قطع السيارات والصناعات الميكانيكية' },
                                { title: 'الصناعات الغذائية', desc: 'الصناعات الغذائية وحلول التعبئة والتغليف' },
                                { title: 'البناء والإنشاء', desc: 'شركات البناء والبنية التحتية' },
                                { title: 'السلع الاستهلاكية', desc: 'منتجو السلع الاستهلاكية والمنزلية' },
                                { title: 'الإلكترونيات والكهرباء', desc: 'مصانع النسيج والأجهزة الكهربائية والإلكترونية' },
                                { title: 'التغليف والحاويات', desc: 'مصنّعو الحاويات والأكياس والعبوات البلاستيكية' },
                                { title: 'قطاعات أخرى', desc: 'نرحب بجميع القطاعات الصناعية الأخرى' }
                              ]
                            : [
                                { title: 'Plastic Manufacturing', desc: 'Plastic Manufacturing & Packaging Factories' },
                                { title: 'Automotive', desc: 'Automotive & Industrial Parts Manufacturers' },
                                { title: 'Food Industries', desc: 'Food Industries & Packaging Solutions' },
                                { title: 'Construction', desc: 'Construction & Infrastructure Companies' },
                                { title: 'Consumer Goods', desc: 'Consumer Goods & Household Plastics Producers' },
                                { title: 'Electronics', desc: 'Textile, Electrical & Electronics Factories' },
                                { title: 'Packaging', desc: 'Containers, Bags & Plastic Packaging Manufacturers' },
                                { title: 'Other sectors', desc: 'We welcome all other industrial sectors' }
                              ];
                        const industryIcons = [
                            <Factory className="w-6 h-6" />,
                            <Car className="w-6 h-6" />,
                            <UtensilsCrossed className="w-6 h-6" />,
                            <HardHat className="w-6 h-6" />,
                            <ShoppingCart className="w-6 h-6" />,
                            <Cpu className="w-6 h-6" />,
                            <Package className="w-6 h-6" />,
                            <Layers className="w-6 h-6" />
                        ];
                        const customAr = parseIndustries(company.industriesContentAr);
                        const customEn = parseIndustries(company.industriesContentEn);
                        // إذا كان هناك بيانات مدخلة من الداشبورد نستخدمها، وإلا الـ fallback
                        const hasCustom = (customAr && customAr.length > 0) || (customEn && customEn.length > 0);
                        const count = hasCustom
                            ? Math.max(customAr?.length ?? 0, customEn?.length ?? 0)
                            : defaultIndustries.length;
                        const items = Array.from({ length: count }, (_, i) => {
                            if (hasCustom) {
                                const arItem = customAr?.[i];
                                const enItem = customEn?.[i];
                                return {
                                    title: locale === 'ar' ? (arItem?.title || enItem?.title || '') : (enItem?.title || arItem?.title || ''),
                                    desc:  locale === 'ar' ? (arItem?.desc  || enItem?.desc  || '') : (enItem?.desc  || arItem?.desc  || '')
                                };
                            }
                            return defaultIndustries[i] || { title: '', desc: '' };
                        }).filter(it => it.title);

                        return (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
                                {items.map((industry, idx) => (
                                    <div
                                        key={`${industry.title}-${idx}`}
                                        className="group relative bg-white rounded-2xl p-6 border border-slate-100
                                            hover:border-brand-primary/30 hover:shadow-xl hover:shadow-brand-primary/8
                                            transition-all duration-300 hover:-translate-y-1.5 overflow-hidden"
                                    >
                                        {/* top accent */}
                                        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-brand-primary to-transparent 
                                            opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <div className="flex items-start gap-4">
                                            <div className="shrink-0 w-12 h-12 rounded-xl bg-brand-primary/10 text-brand-primary 
                                                flex items-center justify-center
                                                group-hover:bg-brand-primary group-hover:text-white group-hover:scale-105
                                                transition-all duration-300">
                                                {industryIcons[idx % industryIcons.length]}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-brand-primary text-sm mb-1 leading-snug">
                                                    {industry.title}
                                                </h3>
                                                <p className="text-slate-500 text-xs leading-relaxed">
                                                    {industry.desc}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                </div>
            </section>

            {/* Brochure Section - يظهر فقط لو في ملف */}
            {company.brochurePath && (
                <section id="brochure" className="relative py-16 md:py-20 bg-white overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.04)_0%,_transparent_70%)] pointer-events-none" />
                    <div className="container mx-auto px-6 max-w-6xl">
                        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 shadow-2xl">
                            {/* decorative bg shapes */}
                            <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/15 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3 pointer-events-none" />
                            {/* top accent strip */}
                            <div className="h-1.5 w-full bg-gradient-to-r from-brand-primary via-emerald-400 to-brand-primary/50" />

                            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 items-center p-10 md:p-14">
                                {/* Left: text */}
                                <div className="space-y-6">
                                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white/90 rounded-full text-sm font-medium border border-white/15 backdrop-blur-sm">
                                        <BookOpen className="w-4 h-4 text-brand-primary" />
                                        {locale === 'ar' ? 'الكتيّب التعريفي' : 'Company Brochure'}
                                    </span>
                                    <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                                        {locale === 'ar'
                                            ? <>{locale === 'ar' ? 'تعرّف على ' : 'Discover '}<span className="text-brand-primary">{company.companyNameAr}</span></>
                                            : <>Discover <span className="text-brand-primary">{company.companyNameEn || company.companyNameAr}</span></>}
                                    </h2>
                                    <p className="text-white/60 leading-relaxed text-base md:text-lg max-w-md">
                                        {locale === 'ar'
                                            ? 'حمّل كتيّبنا التعريفي للاطلاع على خدماتنا ومنتجاتنا وقيمنا بشكل مفصّل.'
                                            : 'Download our brochure to learn more about our services, products, and values in detail.'}
                                    </p>
                                    <div className="flex flex-wrap gap-4 pt-2">
                                        <a
                                            href={getImageUrl(company.brochurePath)}
                                            target="_blank"
                                            rel="noreferrer"
                                            download
                                            className="group inline-flex items-center gap-3 px-7 py-3.5
                                                bg-brand-primary text-white rounded-2xl font-bold
                                                hover:bg-brand-primary/90 hover:shadow-xl hover:shadow-brand-primary/30
                                                hover:-translate-y-0.5 transition-all duration-300"
                                        >
                                            <Download className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                                            <span>{locale === 'ar' ? 'تحميل الكتيّب' : 'Download Brochure'}</span>
                                        </a>
                                        <a
                                            href={getImageUrl(company.brochurePath)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-3 px-7 py-3.5
                                                bg-white/10 backdrop-blur-md text-white rounded-2xl font-bold
                                                border border-white/20 hover:bg-white/20 hover:-translate-y-0.5
                                                transition-all duration-300"
                                        >
                                            <FileText className="w-5 h-5" />
                                            <span>{locale === 'ar' ? 'معاينة' : 'Preview'}</span>
                                        </a>
                                    </div>
                                </div>

                                {/* Right: PDF card visual */}
                                <div className="flex justify-center lg:justify-end">
                                    <div className="relative w-56 h-72 md:w-64 md:h-80">
                                        {/* shadow layers */}
                                        <div className="absolute inset-0 bg-white/5 rounded-2xl rotate-3 scale-95" />
                                        <div className="absolute inset-0 bg-white/8 rounded-2xl rotate-1 scale-97" />
                                        {/* main card */}
                                        <div className="relative w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                                            {/* top bar */}
                                            <div className="h-2 w-full bg-gradient-to-r from-brand-primary to-brand-primary/60" />
                                            {/* icon area */}
                                            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
                                                <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center">
                                                    <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none">
                                                        <rect x="6" y="2" width="36" height="44" rx="4" fill="#FEE2E2" />
                                                        <path d="M30 2v12h12" stroke="#EF4444" strokeWidth="2" fill="none" strokeLinejoin="round" />
                                                        <rect x="6" y="2" width="24" height="14" rx="2" fill="#FEE2E2" />
                                                        <path d="M30 14h12L30 2v12z" fill="#FCA5A5" />
                                                        <text x="24" y="34" textAnchor="middle" fill="#EF4444" fontSize="10" fontWeight="bold" fontFamily="Arial">PDF</text>
                                                    </svg>
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-bold text-slate-800 text-sm leading-snug">
                                                        {locale === 'ar' ? company.companyNameAr : (company.companyNameEn || company.companyNameAr)}
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        {locale === 'ar' ? 'الكتيّب التعريفي' : 'Company Brochure'}
                                                    </p>
                                                </div>
                                            </div>
                                            {/* bottom download strip */}
                                            <a
                                                href={getImageUrl(company.brochurePath)}
                                                target="_blank"
                                                rel="noreferrer"
                                                download
                                                className="flex items-center justify-center gap-2 py-3.5 bg-brand-primary 
                                                    text-white text-sm font-bold hover:bg-brand-primary/90 transition-colors"
                                            >
                                                <Download className="w-4 h-4" />
                                                {locale === 'ar' ? 'تحميل PDF' : 'Download PDF'}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Contact Section */}
            <section id="contact" className="relative py-20 md:py-28 overflow-hidden">
                {/* gradient background matching hero green sections */}
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/90 via-emerald-50 to-white" />
                {/* decorative circles */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-brand-primary/8 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/3 pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-brand-primary/6 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

                <div className="relative container mx-auto px-6 max-w-6xl">
                    {/* Section Header */}
                    <div className="text-center mb-12 md:mb-16">
                        <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary/10 
                            text-brand-primary rounded-full text-sm font-semibold mb-5">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                            {locale === 'ar' ? 'تواصل معنا' : 'Get in touch'}
                        </span>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4 leading-tight">
                            {locale === 'ar'
                                ? <>يسعدنا <span className="text-brand-primary">تواصلكم</span> في أي وقت</>
                                : <>We're always <span className="text-brand-primary">here</span> for you</>}
                        </h2>
                        <p className="text-slate-600 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
                            {locale === 'ar'
                                ? 'أرسل لنا رسالة أو تواصل بأي طريقة تناسبك وسنرد عليك في أقرب وقت.'
                                : 'Send us a message or reach out through any channel and we will get back to you shortly.'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10 items-stretch">
                        {/* Contact Form — 3 cols */}
                        <form
                            onSubmit={handleContactSubmit}
                            className="lg:col-span-3 relative bg-white rounded-3xl shadow-2xl shadow-slate-200/60 overflow-hidden flex flex-col"
                        >
                            {/* top accent strip */}
                            <div className="h-1.5 w-full bg-gradient-to-r from-brand-primary via-emerald-400 to-brand-primary/60" />

                            <div className="p-7 md:p-10 flex flex-col gap-6 flex-1">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-1">
                                        {locale === 'ar' ? 'أرسل رسالتك' : 'Send us a message'}
                                    </h3>
                                    <p className="text-slate-500 text-sm">
                                        {locale === 'ar' ? 'سيتم فتح تطبيق البريد الإلكتروني عند الإرسال.' : 'Your email client will open on submit.'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Name */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            {locale === 'ar' ? 'الاسم بالكامل' : 'Full Name'}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="name"
                                                value={contactForm.name}
                                                onChange={handleContactChange}
                                                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 
                                                    focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 
                                                    outline-none text-sm text-slate-800 placeholder:text-slate-400 
                                                    transition-all duration-200"
                                                placeholder={locale === 'ar' ? 'اكتب اسمك الكامل' : 'Enter your full name'}
                                            />
                                        </div>
                                    </div>
                                    {/* Email */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            {locale === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={contactForm.email}
                                            onChange={handleContactChange}
                                            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 
                                                focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 
                                                outline-none text-sm text-slate-800 placeholder:text-slate-400 
                                                transition-all duration-200"
                                            placeholder="you@example.com"
                                            dir="ltr"
                                        />
                                    </div>
                                </div>

                                {/* Company */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        {locale === 'ar' ? 'اسم الشركة (اختياري)' : 'Company Name (optional)'}
                                    </label>
                                    <input
                                        type="text"
                                        name="company"
                                        value={contactForm.company}
                                        onChange={handleContactChange}
                                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 
                                            focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 
                                            outline-none text-sm text-slate-800 placeholder:text-slate-400 
                                            transition-all duration-200"
                                        placeholder={locale === 'ar' ? 'اسم شركتك أو مصنعك' : 'Your company or factory name'}
                                    />
                                </div>

                                {/* Message */}
                                <div className="space-y-1.5 flex-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        {locale === 'ar' ? 'رسالتك' : 'Your Message'}
                                    </label>
                                    <textarea
                                        name="message"
                                        value={contactForm.message}
                                        onChange={handleContactChange}
                                        rows={5}
                                        className="w-full h-full min-h-[120px] px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 
                                            focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 
                                            outline-none text-sm text-slate-800 placeholder:text-slate-400 
                                            resize-none transition-all duration-200"
                                        placeholder={locale === 'ar' ? 'اكتب تفاصيل طلبك أو استفسارك...' : 'Tell us about your inquiry or request...'}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="group w-full inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl 
                                        bg-gradient-to-r from-brand-primary to-brand-primary/90
                                        text-white text-sm font-bold shadow-lg shadow-brand-primary/30
                                        hover:shadow-xl hover:shadow-brand-primary/40 hover:-translate-y-0.5
                                        transition-all duration-300 ease-out"
                                >
                                    <Mail className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                                    <span>{locale === 'ar' ? 'إرسال الرسالة' : 'Send Message'}</span>
                                </button>
                            </div>
                        </form>

                        {/* Contact Info — 2 cols */}
                        <div className="lg:col-span-2 flex flex-col gap-4">
                            {/* info card styled consistently */}
                            {[
                                {
                                    icon: <MapPin className="w-5 h-5" />,
                                    label: locale === 'ar' ? 'العنوان' : 'Location',
                                    value: [company.address, company.city, company.country].filter(Boolean).join(', '),
                                    href: undefined as string | undefined,
                                    color: 'from-brand-primary to-brand-primary/80'
                                },
                                {
                                    icon: <Mail className="w-5 h-5" />,
                                    label: locale === 'ar' ? 'البريد الإلكتروني' : 'Email',
                                    value: company.email,
                                    href: company.email ? `mailto:${company.email}` : undefined,
                                    color: 'from-brand-primary to-brand-primary/80'
                                },
                                ...(company.phone ? [{
                                    icon: <Phone className="w-5 h-5" />,
                                    label: locale === 'ar' ? 'الهاتف' : 'Phone',
                                    value: company.phone,
                                    href: `tel:${company.phone}`,
                                    color: 'from-brand-primary to-brand-primary/80'
                                }] : []),
                                ...(company.website ? [{
                                    icon: <Globe className="w-5 h-5" />,
                                    label: locale === 'ar' ? 'الموقع الإلكتروني' : 'Website',
                                    value: company.website,
                                    href: company.website.startsWith('http') ? company.website : `https://${company.website}`,
                                    color: 'from-brand-primary to-brand-primary/80'
                                }] : [])
                            ].map((item, i) => {
                                const inner = (
                                    <div
                                        key={i}
                                        className="group relative flex items-center gap-4 bg-white rounded-2xl p-5 
                                            border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-slate-200/70
                                            hover:border-brand-primary/20 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/3 to-transparent 
                                            opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <div className={`relative shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} 
                                            flex items-center justify-center text-white shadow-md
                                            group-hover:scale-105 transition-transform duration-300`}>
                                            {item.icon}
                                        </div>
                                        <div className="relative min-w-0">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                                {item.label}
                                            </p>
                                            <p className="text-sm font-semibold text-slate-800 truncate" dir="ltr">
                                                {item.value}
                                            </p>
                                        </div>
                                    </div>
                                );
                                return item.href
                                    ? <a key={i} href={item.href} target="_blank" rel="noreferrer" className="block">{inner}</a>
                                    : <div key={i}>{inner}</div>;
                            })}

                            {/* Social / CTA mini card */}
                            <div className="relative flex-1 bg-gradient-to-br from-brand-primary via-brand-primary/95 to-slate-800 
                                rounded-2xl p-6 text-white overflow-hidden flex flex-col justify-between">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                                <div className="relative">
                                    <p className="text-sm font-semibold text-white/80 mb-1">
                                        {locale === 'ar' ? 'وقت الاستجابة' : 'Response time'}
                                    </p>
                                    <p className="text-2xl font-bold mb-3">
                                        {locale === 'ar' ? 'خلال 24 ساعة' : 'Within 24 hours'}
                                    </p>
                                    <p className="text-white/60 text-sm leading-relaxed">
                                        {locale === 'ar'
                                            ? 'فريقنا متاح للرد على جميع استفساراتكم في أقرب وقت ممكن.'
                                            : 'Our team is ready to respond to all your inquiries as quickly as possible.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Partnerships Section */}
            <section id="partners" className="relative py-16 md:py-20 bg-slate-50 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.04)_0%,_transparent_70%)] pointer-events-none" />
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="text-center mb-10 md:mb-12">
                        <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 
                            rounded-full text-sm font-semibold mb-4 shadow-sm border border-slate-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                            {locale === 'ar' ? 'شركاؤنا في النجاح' : 'Our trusted partners'}
                        </span>
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 mb-3 leading-tight">
                            {locale === 'ar'
                                ? <>شبكة <span className="text-brand-primary">واسعة</span> من الشراكات</>
                                : <>A <span className="text-brand-primary">strong</span> network of partnerships</>}
                        </h2>
                        <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto">
                            {locale === 'ar'
                                ? 'نتعاون مع مجموعة من الشركات العالمية والمحلية لتوفير أفضل الحلول والخامات لعملائنا.'
                                : 'We work closely with a selected group of global and local companies to deliver the best materials and solutions.'}
                        </p>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none" />
                        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none" />

                        <div className="overflow-hidden">
                            <div className="flex gap-8 md:gap-12 animate-[logoMarquee_28s_linear_infinite]">
                                {(() => {
                                    const defaults = [
                                        { name: 'SABIC', logo: '/assets/partners/sabic.png', url: 'https://www.sabic.com' },
                                        { name: 'Borouge', logo: '/assets/partners/borouge.png', url: 'https://www.borouge.com' },
                                        { name: 'QAPCO', logo: '/assets/partners/qapco.png', url: 'https://www.qapco.com' },
                                        { name: 'Tasnee', logo: '/assets/partners/tasnee.png', url: 'https://www.tasnee.com.sa' },
                                        { name: 'TotalEnergies', logo: '/assets/partners/totalenergies.png', url: 'https://totalenergies.com' },
                                        { name: 'Local Partner', logo: '/assets/partners/local1.png', url: '' }
                                    ];
                                    const customPartners = parsePartners(company.partnersContent);
                                    const baseList = customPartners ?? defaults;
                                    // لو في بيانات من لوحة التحكم نعرض كل شريك مرة واحدة فقط
                                    const listForMarquee = customPartners ? baseList : baseList.concat(baseList);
                                    return listForMarquee;
                                })().map((partner, idx) => (
                                    <div
                                        key={`${partner.name}-${idx}`}
                                        className="group relative flex-shrink-0 w-32 h-16 md:w-40 md:h-20 lg:w-48 lg:h-24 
                                            rounded-2xl bg-slate-50 border border-slate-100 shadow-sm
                                            flex items-center justify-center overflow-hidden"
                                    >
                                        {partner.url ? (
                                            <a href={partner.url} target="_blank" rel="noreferrer" className="w-full h-full flex items-center justify-center">
                                                <img
                                                    src={partner.logo}
                                                    alt={partner.name}
                                                    className="w-full h-full object-contain transition-all duration-300 
                                                        group-hover:grayscale group-hover:opacity-80"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            </a>
                                        ) : (
                                            <img
                                                src={partner.logo}
                                                alt={partner.name}
                                                className="w-full h-full object-contain transition-all duration-300 
                                                    group-hover:grayscale group-hover:opacity-80"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* CTA + Footer Section - بارتفاع كامل الشاشة */}
            <section className="relative min-h-screen bg-gradient-to-b from-slate-800 via-slate-900 to-slate-900 overflow-hidden flex flex-col">
                <FloatingParticles />
                <div className="absolute top-0 left-0 w-[32rem] h-[32rem] bg-brand-primary/15 rounded-full 
                    blur-3xl -translate-x-1/2 -translate-y-1/2 transition-opacity duration-700" />
                <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-brand-primary/10 rounded-full 
                    blur-3xl translate-x-1/2 translate-y-1/2 transition-opacity duration-700" />

                <div className="relative flex-1 flex flex-col justify-between">
                    {/* CTA Block */}
                    <div className="container mx-auto px-6 max-w-4xl text-center pt-20 pb-10">
                        <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 
                            backdrop-blur-md rounded-full text-white/90 text-sm font-medium mb-8 border border-white/10">
                            <Clock className="w-4 h-4" />
                            <span>{locale === 'ar' ? 'نحن متاحون على مدار الساعة' : 'We are available around the clock'}</span>
                        </span>

                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
                            {locale === 'ar' ? 'هل أنت مستعد للبدء؟' : 'Ready to get started?'}
                        </h2>
                        <p className="text-lg md:text-xl text-white/60 mb-10 leading-relaxed max-w-2xl mx-auto">
                            {locale === 'ar'
                                ? 'تواصل معنا اليوم واكتشف كيف يمكننا مساعدتك في تحقيق أهدافك'
                                : 'Contact us today and discover how we can help you achieve your goals.'}
                        </p>

                        <div className="flex flex-wrap justify-center gap-4">
                            <a
                                href={`mailto:${company.email}`}
                                className="inline-flex items-center gap-3 px-8 py-4 bg-brand-primary 
                                    text-white rounded-2xl font-bold hover:bg-brand-primary/90 
                                    hover:shadow-xl hover:shadow-brand-primary/25 
                                    transition-all duration-300 ease-out hover:-translate-y-0.5"
                            >
                                <Mail className="w-5 h-5" />
                                <span>{locale === 'ar' ? 'أرسل رسالة' : 'Send a message'}</span>
                            </a>
                            {company.phone && (
                                <a
                                    href={`tel:${company.phone}`}
                                    className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 
                                        backdrop-blur-md text-white rounded-2xl font-bold 
                                        border border-white/20 hover:bg-white/20 
                                        transition-all duration-300 ease-out hover:-translate-y-0.5"
                                >
                                    <Phone className="w-5 h-5" />
                                    <span>{locale === 'ar' ? 'اتصل الآن' : 'Call now'}</span>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Footer Content */}
                    <div className="relative text-white pt-8 pb-8">
                        <div className="container mx-auto px-6 max-w-6xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-8">
                                {/* Company Info */}
                                <div className="lg:col-span-2">
                                    <div className="flex items-center gap-4 mb-6">
                                        {company.logoPath && (
                                            <div className="w-14 h-14 bg-white/10 rounded-xl p-2">
                                                <img
                                                    src={getImageUrl(company.logoPath)}
                                                    alt="Logo"
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="text-xl font-bold">{company.companyNameAr}</h3>
                                            <p className="text-white/60 text-sm" dir="ltr">{company.companyNameEn}</p>
                                        </div>
                                    </div>
                                    <p className="text-white/60 leading-relaxed max-w-md mb-6">
                                        {locale === 'ar'
                                            ? (company.footerText || 'نسعى دائماً لتقديم أفضل الخدمات والحلول لعملائنا الكرام.')
                                            : (company.footerTextEn || 'We always strive to offer the best services and solutions to our valued customers.')}
                                    </p>
                                </div>

                                {/* Quick Links */}
                                <div>
                                    <h4 className="font-bold mb-6 text-lg">
                                        {locale === 'ar' ? 'روابط سريعة' : 'Quick links'}
                                    </h4>
                                    <ul className="space-y-3">
                                        {(locale === 'ar'
                                            ? [
                                                { label: 'الرئيسية', href: '#' },
                                                { label: 'من نحن', href: '#about' },
                                                { label: 'خدماتنا', href: '#services' },
                                                { label: 'منتجاتنا', href: '#products' },
                                                { label: 'القطاعات', href: '#industries' },
                                                { label: 'تواصل معنا', href: '#contact' }
                                              ]
                                            : [
                                                { label: 'Home', href: '#' },
                                                { label: 'About', href: '#about' },
                                                { label: 'Services', href: '#services' },
                                                { label: 'Products', href: '#products' },
                                                { label: 'Industries', href: '#industries' },
                                                { label: 'Contact', href: '#contact' }
                                              ]
                                        ).map(link => (
                                            <li key={link.label}>
                                                <a href={link.href} className="text-white/60 hover:text-white 
                                                    transition-colors duration-300 inline-flex items-center gap-2 group">
                                                    <span className="w-1.5 h-1.5 bg-brand-primary rounded-full group-hover:scale-125 transition-transform duration-200" />
                                                    {link.label}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Contact */}
                                <div>
                                    <h4 className="font-bold mb-6 text-lg">
                                        {locale === 'ar' ? 'تواصل معنا' : 'Contact'}
                                    </h4>
                                    <ul className="space-y-4">
                                        <li className="flex items-start gap-3 text-white/60">
                                            <MapPin className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                                            <span>{company.city}, {company.country}</span>
                                        </li>
                                        {company.phone && (
                                            <li className="flex items-center gap-3 text-white/60">
                                                <Phone className="w-5 h-5 text-brand-primary shrink-0" />
                                                <span dir="ltr">{company.phone}</span>
                                            </li>
                                        )}
                                        {company.email && (
                                            <li className="flex items-center gap-3 text-white/60">
                                                <Mail className="w-5 h-5 text-brand-primary shrink-0" />
                                                <span>{company.email}</span>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-white/10 pt-6">
                                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                    <p className="text-white/40 text-sm">
                                        © {new Date().getFullYear()} {company.companyNameEn}. All rights reserved.
                                    </p>
                                    <div className="flex items-center gap-6 text-white/40 text-sm">
                                        <a href="#" className="hover:text-white transition-colors">
                                            {locale === 'ar' ? 'سياسة الخصوصية' : 'Privacy policy'}
                                        </a>
                                        <a href="#" className="hover:text-white transition-colors">
                                            {locale === 'ar' ? 'الشروط والأحكام' : 'Terms & conditions'}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* زر العودة للأعلى - انسياب */}
            <button
                type="button"
                onClick={scrollToTop}
                className={`fixed bottom-6 left-6 md:bottom-8 md:left-8 w-12 h-12 md:w-14 md:h-14 
                    bg-brand-primary text-white rounded-2xl shadow-lg shadow-brand-primary/25 
                    flex items-center justify-center hover:bg-brand-primary/90 hover:scale-105 
                    transition-all duration-400 ease-out z-50
                    ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}
            >
                <ArrowUp className="w-5 h-5 md:w-6 md:h-6" />
            </button>
        </div>
    );
};

export default PublicCompanyPage;