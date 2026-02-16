import React, { useEffect, useState, useRef } from 'react';
import {
    MapPin, Phone, Mail, Globe, Printer,
    ChevronDown, ExternalLink,
    Target, Eye, Award, Users, TrendingUp,
    ArrowUp, Sparkles, MessageCircle, Clock,
    CheckCircle2, Star
} from 'lucide-react';
import apiClient from '../../services/apiClient';

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

// Contact Card - انسياب وظهور تدريجي
const ContactCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string;
    href?: string;
    delay: number;
}> = ({ icon, label, value, href, delay }) => {
    const { ref, isVisible } = useIntersectionObserver();

    const content = (
        <div
            ref={ref}
            className={`group relative bg-white p-6 rounded-2xl border border-slate-100 
                hover:border-brand-primary/25 hover:shadow-lg hover:shadow-brand-primary/5 
                transition-all duration-400 ease-out overflow-hidden
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ transitionDelay: `${delay}ms`, transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent 
                opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

            <div className="relative w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-primary/90 
                rounded-xl flex items-center justify-center mb-4 
                group-hover:scale-105 transition-transform duration-300 ease-out">
                <div className="text-white">{icon}</div>
            </div>

            <p className="text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">{label}</p>
            <p className="font-semibold text-slate-800 group-hover:text-brand-primary 
                transition-colors duration-300 text-[15px]" dir="ltr">
                {value}
            </p>

            {href && (
                <ExternalLink className="absolute top-4 left-4 w-4 h-4 text-slate-300 
                    group-hover:text-brand-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 
                    transition-all duration-300" />
            )}
        </div>
    );

    return href ? (
        <a href={href} target="_blank" rel="noreferrer" className="block">{content}</a>
    ) : content;
};

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
            className={`text-center p-5 md:p-6 transition-all duration-700 ease-out
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ transitionDelay: `${delay}ms`, transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
        >
            <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 bg-white/15 backdrop-blur-md rounded-2xl 
                flex items-center justify-center text-white border border-white/10">
                {icon}
            </div>
            <div className="text-3xl md:text-4xl font-bold text-white mb-1.5">
                <AnimatedCounter end={value} suffix={suffix} />
            </div>
            <p className="text-white/75 text-sm md:text-base font-medium">{label}</p>
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
            className={`group relative bg-white/95 backdrop-blur-sm p-7 md:p-8 rounded-3xl border border-slate-100 
                hover:border-brand-primary/20 hover:shadow-xl hover:shadow-brand-primary/5 
                transition-all duration-500 ease-out
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: `${delay}ms`, transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
        >
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-brand-primary/5 to-transparent 
                rounded-bl-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 
                    rounded-2xl flex items-center justify-center mb-5 
                    group-hover:scale-105 transition-transform duration-300 ease-out">
                    <div className="text-brand-primary">{icon}</div>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-2">{title}</h3>
                <p className="text-slate-600 leading-relaxed text-[15px] md:text-base">{description}</p>
            </div>
        </div>
    );
};

const PublicCompanyPage: React.FC = () => {
    const [company, setCompany] = useState<CompanyInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                const response = await apiClient.get('/company');
                if (response.data.data) {
                    setCompany(response.data.data);
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
        const handleScroll = () => setShowScrollTop(window.scrollY > 500);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

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

    return (
        <div className="min-h-screen bg-slate-50 font-readex antialiased scroll-smooth" dir="rtl">
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
            `}</style>

            {/* Hero Section - انسياب من الأعلى */}
            <section className="relative min-h-[90vh] flex items-center overflow-hidden">
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
                                <span>مرحباً بكم في</span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.15] tracking-tight animate-fade-up" style={{ animationDelay: '0.25s' }}>
                                {company.companyNameAr}
                            </h1>

                            <p className="text-xl md:text-2xl text-white/75 font-light leading-relaxed animate-fade-up" dir="ltr" style={{ animationDelay: '0.3s' }}>
                                {company.companyNameEn}
                            </p>

                            <p className="text-lg md:text-xl text-white/60 max-w-xl leading-relaxed animate-fade-up" style={{ animationDelay: '0.35s' }}>
                                نحن ملتزمون بتقديم أعلى معايير الجودة والتميز في خدماتنا،
                                ونسعى دائماً لتحقيق رضا عملائنا.
                            </p>

                            <div className="flex flex-wrap gap-4 pt-4 animate-fade-up" style={{ animationDelay: '0.45s' }}>
                                <a
                                    href={`mailto:${company.email}`}
                                    className="group inline-flex items-center gap-3 px-7 py-3.5 
                                        bg-white text-brand-primary rounded-2xl font-bold 
                                        hover:bg-white/95 hover:shadow-2xl hover:shadow-white/25 hover:-translate-y-0.5
                                        transition-all duration-300 ease-out"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    <span>تواصل معنا</span>
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
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/60 hover:text-white 
                        transition-colors duration-300 cursor-pointer flex flex-col items-center gap-1"
                >
                    <span className="text-xs font-medium">اكتشف المزيد</span>
                    <ChevronDown className="w-8 h-8 animate-bounce" />
                </button>

                {/* موجة انسيابية ناعمة */}
                <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none">
                    <svg viewBox="0 0 1440 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                        <path d="M0 120C360 80 720 40 1080 70C1260 85 1380 95 1440 100V120H0Z" fill="#f8fafc" className="transition-all duration-700" />
                        <path d="M0 120C300 90 600 60 900 75C1200 90 1320 100 1440 105V120H0Z" fill="#f1f5f9" className="transition-all duration-700" opacity="0.8" />
                    </svg>
                </div>
            </section>

            {/* Stats Section - تدفق مع الخلفية */}
            <section className="relative -mt-1 py-16 md:py-24 bg-gradient-to-b from-slate-100 to-white overflow-hidden section-flow">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/90 via-brand-primary to-slate-800 opacity-95" />
                <FloatingParticles />

                <div className="relative container mx-auto px-6 max-w-6xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                        <StatItem
                            icon={<Users className="w-8 h-8" />}
                            value={500}
                            suffix="+"
                            label="عميل سعيد"
                            delay={0}
                        />
                        <StatItem
                            icon={<Award className="w-8 h-8" />}
                            value={15}
                            suffix="+"
                            label="سنة خبرة"
                            delay={100}
                        />
                        <StatItem
                            icon={<CheckCircle2 className="w-8 h-8" />}
                            value={1000}
                            suffix="+"
                            label="مشروع منجز"
                            delay={200}
                        />
                        <StatItem
                            icon={<Star className="w-8 h-8" />}
                            value={98}
                            suffix="%"
                            label="رضا العملاء"
                            delay={300}
                        />
                    </div>
                </div>
            </section>

            {/* About Section - انسياب ناعم */}
            <section className="relative py-20 md:py-28 bg-gradient-to-b from-white to-slate-50/80 overflow-hidden">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
                        {/* Text Content */}
                        <div className="space-y-8">
                            <div className="space-y-5">
                                <span className="inline-block px-5 py-2.5 bg-brand-primary/10 text-brand-primary 
                                    rounded-full text-sm font-semibold tracking-wide">
                                    من نحن
                                </span>
                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 leading-[1.2] tracking-tight">
                                    نبني المستقبل مع
                                    <span className="text-brand-primary"> شركائنا</span>
                                </h2>
                                <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-xl">
                                    {company.companyNameAr} هي مؤسسة رائدة في مجالها، نسعى لتقديم
                                    أفضل الخدمات والحلول المبتكرة لعملائنا في {company.city} وجميع
                                    أنحاء {company.country}.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {[
                                    'فريق متخصص من الخبراء',
                                    'حلول مبتكرة ومتكاملة',
                                    'دعم فني على مدار الساعة',
                                    'التزام بأعلى معايير الجودة'
                                ].map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-3 group">
                                        <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center 
                                            group-hover:scale-110 transition-transform duration-300">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <span className="text-slate-700 font-medium">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Vision & Mission Cards */}
                        <div className="space-y-5 lg:space-y-6">
                            <FeatureCard
                                icon={<Eye className="w-8 h-8" />}
                                title="رؤيتنا"
                                description="أن نكون الخيار الأول والشريك الموثوق في تقديم الحلول المتكاملة، 
                                    ونسعى للريادة والتميز في كل ما نقدمه."
                                delay={0}
                            />
                            <FeatureCard
                                icon={<Target className="w-8 h-8" />}
                                title="مهمتنا"
                                description="تقديم خدمات عالية الجودة تفوق توقعات عملائنا، مع الحفاظ على 
                                    القيم والمبادئ التي تميزنا في السوق."
                                delay={100}
                            />
                            <FeatureCard
                                icon={<TrendingUp className="w-8 h-8" />}
                                title="أهدافنا"
                                description="التطوير المستمر والابتكار في خدماتنا، وبناء علاقات طويلة الأمد 
                                    مع عملائنا وشركائنا."
                                delay={200}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section - تدفق بصري */}
            <section className="relative py-20 md:py-28 bg-gradient-to-b from-slate-50/50 to-white overflow-hidden">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="text-center mb-14 md:mb-16">
                        <span className="inline-block px-5 py-2.5 bg-brand-primary/10 text-brand-primary 
                            rounded-full text-sm font-semibold mb-5">
                            تواصل معنا
                        </span>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4 leading-tight">
                            نحن هنا لمساعدتك
                        </h2>
                        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                            يسعدنا تواصلك معنا في أي وقت، فريقنا جاهز للإجابة على جميع استفساراتك
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
                        <ContactCard
                            icon={<MapPin className="w-6 h-6" />}
                            label="العنوان"
                            value={`${company.address}, ${company.city}`}
                            delay={0}
                        />
                        {company.phone && (
                            <ContactCard
                                icon={<Phone className="w-6 h-6" />}
                                label="الهاتف"
                                value={company.phone}
                                href={`tel:${company.phone}`}
                                delay={100}
                            />
                        )}
                        {company.email && (
                            <ContactCard
                                icon={<Mail className="w-6 h-6" />}
                                label="البريد الإلكتروني"
                                value={company.email}
                                href={`mailto:${company.email}`}
                                delay={200}
                            />
                        )}
                        {company.website && (
                            <ContactCard
                                icon={<Globe className="w-6 h-6" />}
                                label="الموقع الإلكتروني"
                                value={company.website}
                                href={`https://${company.website}`}
                                delay={300}
                            />
                        )}
                    </div>

                    {/* Additional Contact Info */}
                    {company.fax && (
                        <div className="mt-8 flex justify-center">
                            <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-100 
                                rounded-full text-slate-600">
                                <Printer className="w-5 h-5" />
                                <span>فاكس: </span>
                                <span dir="ltr">{company.fax}</span>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section - انسياب مع الخلفية */}
            <section className="relative py-20 md:py-28 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-900 overflow-hidden">
                <FloatingParticles />
                <div className="absolute top-0 left-0 w-[32rem] h-[32rem] bg-brand-primary/15 rounded-full 
                    blur-3xl -translate-x-1/2 -translate-y-1/2 transition-opacity duration-700" />
                <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-brand-primary/10 rounded-full 
                    blur-3xl translate-x-1/2 translate-y-1/2 transition-opacity duration-700" />

                <div className="relative container mx-auto px-6 max-w-4xl text-center">
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 
                        backdrop-blur-md rounded-full text-white/90 text-sm font-medium mb-8 border border-white/10">
                        <Clock className="w-4 h-4" />
                        <span>نحن متاحون على مدار الساعة</span>
                    </span>

                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
                        هل أنت مستعد للبدء؟
                    </h2>
                    <p className="text-lg md:text-xl text-white/60 mb-10 leading-relaxed max-w-2xl mx-auto">
                        تواصل معنا اليوم واكتشف كيف يمكننا مساعدتك في تحقيق أهدافك
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
                            <span>أرسل رسالة</span>
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
                                <span>اتصل الآن</span>
                            </a>
                        )}
                    </div>
                </div>
            </section>

            {/* Footer - تدفق مع CTA */}
            <footer className="relative bg-slate-900 text-white pt-16 pb-10 overflow-hidden">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12">
                        {/* Company Info */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-4 mb-6">
                                {company.logoPath && (
                                    <div className="w-14 h-14 bg-white/10 rounded-xl p-2">
                                        <img
                                            src={company.logoPath}
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
                                {company.footerText || 'نسعى دائماً لتقديم أفضل الخدمات والحلول لعملائنا الكرام.'}
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="font-bold mb-6 text-lg">روابط سريعة</h4>
                            <ul className="space-y-3">
                                {['الرئيسية', 'من نحن', 'خدماتنا', 'تواصل معنا'].map(link => (
                                    <li key={link}>
                                        <a href="#" className="text-white/60 hover:text-white 
                                            transition-colors duration-300 inline-flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-brand-primary rounded-full" />
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h4 className="font-bold mb-6 text-lg">تواصل معنا</h4>
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
                    <div className="border-t border-white/10 pt-8">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-white/40 text-sm">
                                © {new Date().getFullYear()} {company.companyNameEn}. All rights reserved.
                            </p>
                            <div className="flex items-center gap-6 text-white/40 text-sm">
                                <a href="#" className="hover:text-white transition-colors">سياسة الخصوصية</a>
                                <a href="#" className="hover:text-white transition-colors">الشروط والأحكام</a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

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