import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import usePageTitle from '../../hooks/usePageTitle';
import apiClient from '../../services/apiClient';

const LoginPage: React.FC = () => {
    usePageTitle('تسجيل الدخول');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await apiClient.post('/auth/login', {
                username,
                password
            });

            const { accessToken, refreshToken, ...user } = response.data.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));

            navigate('/dashboard');
        } catch (err: any) {
            console.error('Login error:', err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('اسم المستخدم أو كلمة المرور غير صحيحة');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50" dir="rtl">

            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Gradient Orbs */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-brand-primary/30 to-brand-primary/10 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-brand-accent/30 to-brand-accent/10 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.1, 0.3, 0.1],
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-brand-primary/10 to-brand-accent/10 rounded-full blur-3xl"
                />

                {/* Floating Shapes */}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-4 h-4 bg-brand-primary/20 rounded-full"
                        style={{
                            top: `${20 + i * 15}%`,
                            left: `${10 + i * 15}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            x: [0, 10, 0],
                            opacity: [0.2, 0.5, 0.2],
                        }}
                        transition={{
                            duration: 4 + i,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.5,
                        }}
                    />
                ))}

                {/* Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.3) 1px, transparent 0)`,
                        backgroundSize: '32px 32px'
                    }}
                />
            </div>

            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md mx-4"
            >
                {/* Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 border border-white/50 p-8 sm:p-10">

                    {/* Logo & Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", duration: 0.8, delay: 0.2 }}
                            className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-slate-200 overflow-hidden border border-slate-100"
                        >
                            <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2"
                        >
                            رصرص للبلاستيك
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-slate-500"
                        >
                            نظام إدارة الموارد المؤسسية
                        </motion.p>
                    </div>

                    {/* Welcome Text */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mb-6"
                    >
                        <h2 className="text-xl font-semibold text-slate-700 mb-1">مرحباً بعودتك! 👋</h2>
                        <p className="text-sm text-slate-500">قم بتسجيل الدخول للمتابعة</p>
                    </motion.div>

                    {/* Form */}
                    <motion.form
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        onSubmit={handleLogin}
                        className="space-y-5"
                    >
                        {/* Username Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 block">
                                اسم المستخدم
                            </label>
                            <div className="relative">
                                <div className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focusedField === 'username' ? 'text-brand-primary' : 'text-slate-400'
                                    }`}>
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onFocus={() => setFocusedField('username')}
                                    onBlur={() => setFocusedField(null)}
                                    className="w-full pr-12 pl-4 py-3.5 bg-slate-50/50 border-2 border-slate-200 rounded-xl
                                             text-slate-800 placeholder:text-slate-400 
                                             focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10
                                             transition-all duration-200 outline-none"
                                    placeholder="أدخل اسم المستخدم"
                                    required
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-slate-700">
                                    كلمة المرور
                                </label>
                                <button
                                    type="button"
                                    className="text-xs text-brand-primary hover:text-brand-primary/80 font-medium transition-colors"
                                >
                                    نسيت كلمة المرور؟
                                </button>
                            </div>
                            <div className="relative">
                                <div className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focusedField === 'password' ? 'text-brand-primary' : 'text-slate-400'
                                    }`}>
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    className="w-full pr-12 pl-12 py-3.5 bg-slate-50/50 border-2 border-slate-200 rounded-xl
                                             text-slate-800 placeholder:text-slate-400 
                                             focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10
                                             transition-all duration-200 outline-none"
                                    placeholder="أدخل كلمة المرور"
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setRememberMe(!rememberMe)}
                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${rememberMe
                                    ? 'bg-brand-primary border-brand-primary'
                                    : 'border-slate-300 hover:border-slate-400 bg-white'
                                    }`}
                            >
                                {rememberMe && (
                                    <motion.svg
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-3 h-3 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </motion.svg>
                                )}
                            </button>
                            <span className="text-sm text-slate-600">تذكرني على هذا الجهاز</span>
                        </div>

                        {/* Error Message */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                                    exit={{ opacity: 0, y: -10, height: 0 }}
                                    className="bg-red-50 border border-red-200 rounded-xl p-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </div>
                                        <p className="text-sm text-red-600 font-medium">{error}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={{ scale: isLoading ? 1 : 1.02 }}
                            whileTap={{ scale: isLoading ? 1 : 0.98 }}
                            className="w-full py-4 px-6 bg-gradient-to-l from-brand-primary to-brand-primary/90 
                                     hover:from-brand-primary/95 hover:to-brand-primary
                                     text-white font-semibold rounded-xl
                                     shadow-lg shadow-brand-primary/25 hover:shadow-xl hover:shadow-brand-primary/30
                                     transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed
                                     flex items-center justify-center gap-3"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>جاري تسجيل الدخول...</span>
                                </>
                            ) : (
                                <>
                                    <span>تسجيل الدخول</span>
                                    <ArrowLeft className="w-5 h-5" />
                                </>
                            )}
                        </motion.button>
                    </motion.form>

                    {/* Help Link */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="mt-6 text-center"
                    >
                        <p className="text-sm text-slate-500">
                            تواجه مشكلة؟{' '}
                            <a href="#" className="text-brand-primary font-medium hover:underline">
                                تواصل مع الدعم الفني
                            </a>
                        </p>
                    </motion.div>
                </div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-6 text-center"
                >
                    <p className="text-xs text-slate-400">
                        © 2026 رصرص للبلاستيك. جميع الحقوق محفوظة.
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default LoginPage;