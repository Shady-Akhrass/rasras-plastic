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

// Floating Particles Background
const FloatingParticles: React.FC = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
            <div
                key={i}
                className="absolute w-2 h-2 bg-white/10 rounded-full animate-float"
                style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${5 + Math.random() * 10}s`
                }}
            />
        ))}
    </div>
);

// Contact Card Component
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
            className={`group relative bg-white p-6 rounded-2xl border border-slate-200 
                hover:border-brand-primary/30 hover:shadow-xl hover:shadow-brand-primary/5 
                transition-all duration-500 cursor-pointer overflow-hidden
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {/* Gradient Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent 
                opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Icon */}
            <div className="relative w-14 h-14 bg-gradient-to-br from-brand-primary to-brand-primary/80 
                rounded-xl flex items-center justify-center mb-4 
                group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <div className="text-white">{icon}</div>
            </div>

            {/* Content */}
            <p className="text-sm text-slate-500 mb-1">{label}</p>
            <p className="font-semibold text-slate-800 group-hover:text-brand-primary 
                transition-colors duration-300" dir="ltr">
                {value}
            </p>

            {/* Arrow indicator */}
            {href && (
                <ExternalLink className="absolute top-4 left-4 w-4 h-4 text-slate-300 
                    group-hover:text-brand-primary transition-colors duration-300" />
            )}
        </div>
    );

    return href ? (
        <a href={href} target="_blank" rel="noreferrer">{content}</a>
    ) : content;
};

// Stats Item Component
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
            className={`text-center p-6 transition-all duration-700
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            <div className="w-16 h-16 mx-auto mb-4 bg-white/10 backdrop-blur-sm rounded-2xl 
                flex items-center justify-center text-white">
                {icon}
            </div>
            <div className="text-4xl font-bold text-white mb-2">
                <AnimatedCounter end={value} suffix={suffix} />
            </div>
            <p className="text-white/70">{label}</p>
        </div>
    );
};

// Feature Card Component
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
            className={`group relative bg-white p-8 rounded-3xl border border-slate-100 
                hover:shadow-2xl hover:shadow-brand-primary/10 transition-all duration-500
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br 
                from-brand-primary/10 to-transparent rounded-bl-full opacity-0 
                group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 
                    rounded-2xl flex items-center justify-center mb-6 
                    group-hover:scale-110 transition-transform duration-300">
                    <div className="text-brand-primary">{icon}</div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
                <p className="text-slate-600 leading-relaxed">{description}</p>
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
        return `http://localhost:8080${url.startsWith('/') ? '' : '/'}${url}`;
    };

    return (
        <div className="min-h-screen bg-slate-50 font-readex" dir="rtl">
            {/* Custom Styles */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(180deg); }
                }
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                @keyframes gradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .animate-float { animation: float linear infinite; }
                .animate-shimmer { animation: shimmer 2s infinite; }
                .animate-gradient { 
                    background-size: 200% 200%;
                    animation: gradient 15s ease infinite; 
                }
            `}</style>

            {/* Hero Section */}
            <section className="relative min-h-[85vh] flex items-center overflow-hidden">
                {/* Background */}
                {company.headerPath ? (
                    <>
                        <img
                            src={getImageUrl(company.headerPath)}
                            alt="Header"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
                    </>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-primary via-brand-primary/90 to-slate-900 animate-gradient" />
                )}

                <FloatingParticles />

                {/* Content */}
                <div className="relative container mx-auto px-6 py-20">
                    <div className="max-w-4xl">
                        {/* Logo */}
                        {company.logoPath && (
                            <div className="w-28 h-28 bg-white/10 backdrop-blur-md rounded-3xl p-3 
                                mb-8 shadow-2xl border border-white/20 animate-fade-in">
                                <img
                                    src={getImageUrl(company.logoPath)}
                                    alt="Logo"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        )}

                        {/* Text Content */}
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 
                                backdrop-blur-sm rounded-full text-white/80 text-sm">
                                <Sparkles className="w-4 h-4" />
                                <span>مرحباً بكم في</span>
                            </div>

                            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                                {company.companyNameAr}
                            </h1>

                            <p className="text-2xl text-white/70 font-light" dir="ltr">
                                {company.companyNameEn}
                            </p>

                            <p className="text-xl text-white/60 max-w-2xl leading-relaxed">
                                نحن ملتزمون بتقديم أعلى معايير الجودة والتميز في خدماتنا،
                                ونسعى دائماً لتحقيق رضا عملائنا.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-wrap gap-4 pt-6">
                                <a
                                    href={`mailto:${company.email}`}
                                    className="group inline-flex items-center gap-3 px-8 py-4 
                                        bg-white text-brand-primary rounded-2xl font-bold 
                                        hover:bg-white/90 hover:shadow-2xl hover:shadow-white/20 
                                        transition-all duration-300"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    <span>تواصل معنا</span>
                                </a>

                                {company.phone && (
                                    <a
                                        href={`tel:${company.phone}`}
                                        className="group inline-flex items-center gap-3 px-8 py-4 
                                            bg-white/10 backdrop-blur-sm text-white rounded-2xl 
                                            font-bold border border-white/20 hover:bg-white/20 
                                            transition-all duration-300"
                                    >
                                        <Phone className="w-5 h-5" />
                                        <span dir="ltr">{company.phone}</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 
                    animate-bounce cursor-pointer" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
                    <ChevronDown className="w-8 h-8" />
                </div>

                {/* Decorative Bottom Wave */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 85C1248 80 1344 70 1392 65L1440 60V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z"
                            fill="#f8fafc"
                        />
                    </svg>
                </div>
            </section>

            {/* Stats Section */}
            <section className="relative py-20 bg-gradient-to-br from-brand-primary via-brand-primary to-slate-800 overflow-hidden">
                <FloatingParticles />

                <div className="relative container mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
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

            {/* About Section */}
            <section className="py-24 bg-slate-50">
                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Text Content */}
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <span className="inline-block px-4 py-2 bg-brand-primary/10 text-brand-primary 
                                    rounded-full text-sm font-medium">
                                    من نحن
                                </span>
                                <h2 className="text-4xl md:text-5xl font-bold text-slate-800 leading-tight">
                                    نبني المستقبل مع
                                    <span className="text-brand-primary"> شركائنا</span>
                                </h2>
                                <p className="text-xl text-slate-600 leading-relaxed">
                                    {company.companyNameAr} هي مؤسسة رائدة في مجالها، نسعى لتقديم
                                    أفضل الخدمات والحلول المبتكرة لعملائنا في {company.city} وجميع
                                    أنحاء {company.country}.
                                </p>
                            </div>

                            {/* Features List */}
                            <div className="space-y-4">
                                {[
                                    'فريق متخصص من الخبراء',
                                    'حلول مبتكرة ومتكاملة',
                                    'دعم فني على مدار الساعة',
                                    'التزام بأعلى معايير الجودة'
                                ].map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-green-100 rounded-full 
                                            flex items-center justify-center">
                                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                                        </div>
                                        <span className="text-slate-700">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Vision & Mission Cards */}
                        <div className="space-y-6">
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

            {/* Contact Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-2 bg-brand-primary/10 text-brand-primary 
                            rounded-full text-sm font-medium mb-4">
                            تواصل معنا
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
                            نحن هنا لمساعدتك
                        </h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            يسعدنا تواصلك معنا في أي وقت، فريقنا جاهز للإجابة على جميع استفساراتك
                        </p>
                    </div>

                    {/* Contact Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
                <FloatingParticles />

                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-brand-primary/20 rounded-full 
                    blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full 
                    blur-3xl translate-x-1/2 translate-y-1/2" />

                <div className="relative container mx-auto px-6 text-center">
                    <div className="max-w-3xl mx-auto">
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 
                            backdrop-blur-sm rounded-full text-white/80 text-sm mb-8">
                            <Clock className="w-4 h-4" />
                            <span>نحن متاحون على مدار الساعة</span>
                        </span>

                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            هل أنت مستعد للبدء؟
                        </h2>
                        <p className="text-xl text-white/60 mb-10">
                            تواصل معنا اليوم واكتشف كيف يمكننا مساعدتك في تحقيق أهدافك
                        </p>

                        <div className="flex flex-wrap justify-center gap-4">
                            <a
                                href={`mailto:${company.email}`}
                                className="inline-flex items-center gap-3 px-8 py-4 bg-brand-primary 
                                    text-white rounded-2xl font-bold hover:bg-brand-primary/90 
                                    hover:shadow-2xl hover:shadow-brand-primary/30 
                                    transition-all duration-300 hover:-translate-y-1"
                            >
                                <Mail className="w-5 h-5" />
                                <span>أرسل رسالة</span>
                            </a>

                            {company.phone && (
                                <a
                                    href={`tel:${company.phone}`}
                                    className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 
                                        backdrop-blur-sm text-white rounded-2xl font-bold 
                                        border border-white/20 hover:bg-white/20 
                                        transition-all duration-300 hover:-translate-y-1"
                                >
                                    <Phone className="w-5 h-5" />
                                    <span>اتصل الآن</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-white pt-16 pb-8">
                <div className="container mx-auto px-6">
                    {/* Footer Content */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
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

            {/* Scroll to Top Button */}
            <button
                onClick={scrollToTop}
                className={`fixed bottom-8 left-8 w-14 h-14 bg-brand-primary text-white 
                    rounded-2xl shadow-lg shadow-brand-primary/30 flex items-center justify-center
                    hover:bg-brand-primary/90 transition-all duration-300 z-50
                    ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
            >
                <ArrowUp className="w-6 h-6" />
            </button>
        </div>
    );
};

export default PublicCompanyPage;