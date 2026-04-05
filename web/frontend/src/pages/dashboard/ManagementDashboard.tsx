import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import {
    Package, TrendingUp, ArrowUpRight, ArrowDownRight, User,
    FileText, DollarSign, Calendar, Clock,
    CheckCircle2, XCircle, BarChart3,
    Activity, Zap, RefreshCw, Download, Bell,
    ChevronLeft, PieChart, UserPlus, ShoppingCart,
    AlertTriangle, Wallet, Landmark
} from 'lucide-react';
import usePageTitle from '../../hooks/usePageTitle';
import { formatDate as formatDateEn, formatNumber } from '../../utils/format';
import { useSystemSettings } from '../../hooks/useSystemSettings';
import { stockBalanceService } from '../../services/stockBalanceService';
import warehouseService from '../../services/warehouseService';
import { hrService } from '../../services/hrService';
import customerService from '../../services/customerService';
import { supplierService } from '../../services/supplierService';
import { stockMovementService } from '../../services/stockMovementService';
import { salesInvoiceService } from '../../services/salesInvoiceService';
import { supplierInvoiceService } from '../../services/supplierInvoiceService';
import { purchaseOrderService } from '../../services/purchaseOrderService';
import purchaseService from '../../services/purchaseService';
import { grnService } from '../../services/grnService';
import { transferNoteService } from '../../services/transferNoteService';
import { paymentVoucherService } from '../../services/paymentVoucherService';
import { customerRequestService } from '../../services/customerRequestService';
import { saleOrderService } from '../../services/saleOrderService';
import toast from 'react-hot-toast';
import ExchangeRateCompact from '../../components/ExchangeRate/ExchangeRateCompact';
import ExchangeRateWidget from '../../components/ExchangeRate/ExchangeRateWidget';

// Helper to normalize Java LocalDate array `[2024, 3, 7]` into ISO `2024-03-07` or `[2024,3,7,12,30]` -> `2024-03-07`
export const parseBackendDateStr = (rawDate: any): string => {
    if (!rawDate) return '';
    if (Array.isArray(rawDate)) {
        const [y, m, d] = rawDate;
        return `${y}-${String(m).padStart(2, '0')}-${String(d || 1).padStart(2, '0')}`;
    }
    if (typeof rawDate === 'string') return rawDate.split('T')[0];
    try {
        return new Date(rawDate).toISOString().split('T')[0];
    } catch (e) {
        return '';
    }
};

// Movement Type Labels
const getMovementTypeLabel = (type: string | undefined): string => {
    if (!type) return '-';
    const typeMap: Record<string, string> = {
        'GRN': 'دخول مخزن',
        'RETURN': 'مرتجع شراء',
        'ADJUSTMENT': 'تعديل جرد',
        'TRANSFER_IN': 'نقل (دخول)',
        'TRANSFER_OUT': 'نقل (خروج)',
        'ISSUE': 'صرف',
    };
    return typeMap[type] || type;
};

// Animation variants
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: 'easeOut' }
    }
};

// Animated Number Component for a "Live" feel
const AnimatedNumber = ({ value, duration = 1 }: { value: number; duration?: number }) => {
    const [displayValue, setDisplayValue] = useState(value);

    useEffect(() => {
        let start: number | null = null;
        const startValue = displayValue;
        const endValue = value;

        const animate = (timestamp: number) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / (duration * 1000), 1);
            const current = Math.floor(progress * (endValue - startValue) + startValue);
            setDisplayValue(current);
            if (progress < 1) {
                window.requestAnimationFrame(animate);
            }
        };

        window.requestAnimationFrame(animate);
    }, [value, duration]);

    return <span>{displayValue.toLocaleString('ar-EG')}</span>;
};

// Analytical Donut Chart Component
const AnalyticalDonut = ({
    data,
    title,
    subtitle
}: {
    data: { label: string; value: number; color: string }[];
    title: string;
    subtitle?: string;
}) => {
    // ... existing implementation ...
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercent = 0;

    const getCoordinatesForPercent = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h4 className="font-bold text-slate-800">{title}</h4>
                    {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
                </div>
            </div>
            <div className="flex flex-1 items-center gap-6">
                <div className="relative w-32 h-32">
                    <svg viewBox="-1 -1 2 2" className="transform -rotate-90 w-full h-full">
                        {data.map((item, i) => {
                            const startPercent = cumulativePercent;
                            const slicePercent = item.value / (total || 1);
                            cumulativePercent += slicePercent;

                            const [startX, startY] = getCoordinatesForPercent(startPercent);
                            const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
                            const largeArcFlag = slicePercent > 0.5 ? 1 : 0;
                            const pathData = [
                                `M ${startX} ${startY}`,
                                `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                                `L 0 0`,
                            ].join(' ');

                            return (
                                <motion.path
                                    key={i}
                                    d={pathData}
                                    fill={item.color}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="hover:opacity-80 transition-opacity cursor-pointer"
                                />
                            );
                        })}
                        <circle cx="0" cy="0" r="0.65" fill="white" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[10px] text-slate-400 font-medium">الإجمالي</span>
                        <span className="text-xs font-bold text-slate-800">
                            {total > 1000000 ? `${(total / 1000000).toFixed(1)}M` : total.toLocaleString('ar-EG')}
                        </span>
                    </div>
                </div>
                <div className="flex-1 space-y-2">
                    {data.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-slate-600 truncate max-w-[80px]">{item.label}</span>
                            </div>
                            <span className="font-bold text-slate-800">
                                {((item.value / (total || 1)) * 100).toFixed(0)}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Monthly Profit Area Chart
const MonthlyProfitChart = ({ data = [] }: { data: { date: string; profit: number }[] }) => {
    const width = 1000;
    const height = 520;

    // 1. CALCULATE SCALING & BUFFERS
    const paddingX = 40;
    const paddingY = 50;

    const rawMin = data.length > 0 ? Math.min(...data.map(d => d.profit)) : 0;
    const rawMax = data.length > 0 ? Math.max(...data.map(d => d.profit)) : 1000;
    const range = rawMax - rawMin || 1;

    const bufferedMax = rawMax + (range * 0.2); 
    const bufferedMin = rawMin - (range * 0.2);
    const bufferedRange = bufferedMax - bufferedMin || 1;

    const getY = (value: number) => {
        const percentage = (value - bufferedMin) / bufferedRange;
        return height - paddingY - (percentage * (height - (paddingY * 2)));
    };

    const getX = (index: number) => {
        return (index / (data.length - 1 || 1)) * (width - (paddingX * 2)) + paddingX;
    };

    // Calculate all coordinates first
    const points = data.map((d, i) => ({ x: getX(i), y: getY(d.profit) }));

    // Generate Smoothed Path (Bezier)
    const generateSmoothPath = (pts: { x: number, y: number }[]) => {
        if (pts.length < 2) return "";
        let path = `M ${pts[0].x} ${pts[0].y}`;
        
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[i];
            const p1 = pts[i + 1];
            // Control points at mid-x to create a smooth 'S' curve between points
            const cp1x = p0.x + (p1.x - p0.x) / 2;
            path += ` C ${cp1x} ${p0.y}, ${cp1x} ${p1.y}, ${p1.x} ${p1.y}`;
        }
        return path;
    };

    const linePath = generateSmoothPath(points);
    const areaPath = points.length > 0 
        ? `${linePath} L ${getX(data.length - 1)} ${height - paddingY} L ${getX(0)} ${height - paddingY} Z`
        : "";

    const totalProfit = data.reduce((a, b) => a + b.profit, 0);
    const avgProfit = totalProfit / (data.length || 1);
    const maxProfit = rawMax;

    if (data.length === 0) return <div className="h-full min-h-[300px] flex items-center justify-center text-slate-400 text-sm">لا توجد بيانات متاحة لهذا الشهر</div>;

    return (
        <div className="flex flex-col w-full h-full bg-slate-50/10 rounded-2xl p-2 select-none">
            
            {/* Header with Summary Summary */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 px-2">
                <div>
                    <h4 className="font-bold text-slate-800 text-xl font-arabic">تحليل الربح اليومي</h4>
                    <p className="text-sm text-slate-500 mt-1">مراقبة الأداء المالي للشهر الحالي (EGP)</p>
                </div>
                
                <div className="flex gap-3">
                    <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 text-center shadow-sm">
                        <span className="block text-[10px] text-emerald-600 font-bold mb-0.5">أعلى ربح</span>
                        <span className="text-sm font-bold text-emerald-700 font-mono">
                            {formatNumber(maxProfit)}
                        </span>
                    </div>
                    <div className="bg-amber-50 px-4 py-2 rounded-xl border border-amber-100 text-center shadow-sm">
                        <span className="block text-[10px] text-amber-600 font-bold mb-0.5">إجمالي الشهر</span>
                        <span className={`text-sm font-bold font-mono ${totalProfit >= 0 ? 'text-amber-700' : 'text-red-600'}`}>
                            {formatNumber(totalProfit)}
                        </span>
                    </div>
                </div>
            </div>

            {/* CHART CONTAINER */}
            <div className="relative w-full h-[520px] pb-6">
                
                {/* SVG CHART */}
                <svg 
                    viewBox={`0 0 ${width} ${height}`} 
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                >
                    <defs>
                        <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0"/>
                        </linearGradient>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Background Grid Lines & Y-Axis Labels */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                        const val = bufferedMin + (bufferedRange * ratio);
                        const y = getY(val);
                        return (
                            <g key={i}>
                                <line 
                                    x1={paddingX} y1={y} 
                                    x2={width - paddingX} y2={y} 
                                    stroke="#e2e8f0" 
                                    strokeWidth="0.5" 
                                    strokeDasharray="4 4" 
                                    opacity="0.5"
                                />
                                <text 
                                    x={paddingX - 10} y={y} 
                                    textAnchor="end" 
                                    alignmentBaseline="middle" 
                                    fontSize="10" 
                                    fill="#94a3b8" 
                                    className="font-mono"
                                >
                                    {val > 1000 || val < -1000 ? `${(val/1000).toFixed(1)}k` : Math.round(val)}
                                </text>
                            </g>
                        );
                    })}

                    {/* Zero Line */}
                    {rawMin < 0 && rawMax > 0 && (
                        <line 
                            x1={paddingX} y1={getY(0)} 
                            x2={width - paddingX} y2={getY(0)} 
                            stroke="#ef4444" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" 
                        />
                    )}

                    {/* Average Line */}
                    <line 
                        x1={paddingX} y1={getY(avgProfit)} 
                        x2={width - paddingX} y2={getY(avgProfit)} 
                        stroke="#f59e0b" strokeWidth="1" strokeDasharray="6 4" opacity="0.4" 
                    />

                    {/* The Filled Area */}
                    <motion.path
                        d={areaPath}
                        fill="url(#profitGradient)"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                    />

                    {/* The Main Line */}
                    <motion.path
                        d={linePath}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#glow)"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    />

                    {/* Data Points and Tooltips */}
                    {data.map((d, i) => {
                        const cx = getX(i);
                        const cy = getY(d.profit);
                        const isLoss = d.profit < 0;

                        return (
                            <g key={i} className="group">
                                <circle cx={cx} cy={cy} r="20" fill="transparent" className="cursor-pointer" />
                                
                                <motion.circle
                                    cx={cx}
                                    cy={cy}
                                    r="4"
                                    fill={isLoss ? "#ef4444" : "#10b981"}
                                    stroke="white"
                                    strokeWidth="2.5"
                                    className="pointer-events-none shadow-sm"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: i * 0.05 + 0.5 }}
                                />

                                <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                    <rect 
                                        x={cx - 60} y={cy - 45} 
                                        width="120" height="35" rx="8" 
                                        fill="#1e293b" 
                                        className="shadow-xl"
                                    />
                                    <text 
                                        x={cx} y={cy - 23} 
                                        textAnchor="middle" 
                                        fill="white" 
                                        fontSize="12" 
                                        fontWeight="bold"
                                        className="font-mono font-bold"
                                    >
                                        {formatNumber(d.profit)}
                                    </text>
                                    <path d={`M${cx-5},${cy-10} L${cx+5},${cy-10} L${cx},${cy-5} Z`} fill="#1e293b" />
                                </g>
                            </g>
                        );
                    })}
                </svg>

                {/* X-AXIS LABELS */}
                <div className="absolute bottom-0 left-0 w-full px-[40px] flex justify-between">
                    {data.map((d, i) => (
                        (data.length < 15 || i % Math.ceil(data.length/10) === 0 || i === data.length-1) && (
                            <span 
                                key={i} 
                                className="text-[10px] text-slate-400 font-bold transform -translate-x-1/2 mt-2"
                                style={{ position: 'absolute', left: `${(i / (data.length - 1 || 1)) * 100}%` }}
                            >
                                {d.date ? parseInt(d.date.split('-')[2]) : i + 1}
                            </span>
                        )
                    ))}
                </div>
            </div>
        </div>
    );
};

// Latest Activity Highlight Card
const LatestActivityCard = ({ 
    type, 
    data, 
    onClick 
}: { 
    type: 'SO' | 'PO'; 
    data: any; 
    onClick?: () => void 
}) => {
    if (!data) return null;
    return (
        <motion.div
            whileHover={{ y: -4 }}
            onClick={onClick}
            className="flex-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
            <div className="flex items-center justify-between mb-3">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                    type === 'SO' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                }`}>
                    {type === 'SO' ? 'أخر أمر بيع' : 'أخر أمر شراء'}
                </span>
                <span className="text-[11px] text-slate-400">{new Date(data.soDate || data.poDate || 0).toLocaleDateString('ar-EG')}</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-brand-primary transition-colors">
                {data.customerNameAr || data.supplierNameAr || '---'}
            </h4>
            <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">#{data.soNumber || data.poNumber || '---'}</span>
                <span className="text-sm font-bold text-slate-900">
                    {new Intl.NumberFormat('ar-EG').format(data.totalAmount || 0)} {data.currency || 'EGP'}
                </span>
            </div>
        </motion.div>
    );
};

// Stat Card Component
const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    color = 'primary',
    subtitle,
    onClick
}: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    color?: 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'blue' | 'rose' | 'amber';
    subtitle?: string;
    onClick?: () => void;
    isNumeric?: boolean;
}) => {
    const colorClasses = {
        primary: {
            bg: 'bg-brand-primary/10',
            border: 'border-brand-primary/20',
            text: 'text-brand-primary',
            gradient: 'from-brand-primary/20 to-brand-primary/5'
        },
        success: {
            bg: 'bg-emerald-100',
            border: 'border-emerald-200',
            text: 'text-emerald-600',
            gradient: 'from-emerald-100 to-emerald-50'
        },
        warning: {
            bg: 'bg-amber-100',
            border: 'border-amber-200',
            text: 'text-amber-600',
            gradient: 'from-amber-100 to-amber-50'
        },
        danger: {
            bg: 'bg-rose-100',
            border: 'border-rose-200',
            text: 'text-rose-600',
            gradient: 'from-rose-100 to-rose-50'
        },
        purple: {
            bg: 'bg-purple-100',
            border: 'border-purple-200',
            text: 'text-purple-600',
            gradient: 'from-purple-100 to-purple-50'
        },
        blue: {
            bg: 'bg-blue-100',
            border: 'border-blue-200',
            text: 'text-blue-600',
            gradient: 'from-blue-100 to-blue-50'
        },
        rose: {
            bg: 'bg-rose-100',
            border: 'border-rose-200',
            text: 'text-rose-600',
            gradient: 'from-rose-100 to-rose-50'
        },
        amber: {
            bg: 'bg-amber-100',
            border: 'border-amber-200',
            text: 'text-amber-600',
            gradient: 'from-amber-100 to-amber-50'
        }
    };

    const colors = colorClasses[color];

    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            onClick={onClick}
            className={`relative bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden
                hover:shadow-xl hover:shadow-slate-100 hover:border-slate-200 transition-all duration-300 group ${onClick ? 'cursor-pointer' : ''}`}
        >
            <div className={`absolute -top-10 -left-10 w-32 h-32 rounded-full bg-gradient-to-br ${colors.gradient} 
                opacity-50 group-hover:opacity-100 transition-opacity duration-300`} />

            <div className="relative">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl ${colors.bg} border ${colors.border}
                        group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    {trend && trendValue && (
                        <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full
                            ${trend === 'up'
                                ? 'bg-emerald-50 text-emerald-600'
                                : trend === 'down'
                                    ? 'bg-rose-50 text-rose-600'
                                    : 'bg-slate-100 text-slate-600'
                            }`}>
                            {trend === 'up' ? (
                                <ArrowUpRight className="w-3 h-3" />
                            ) : trend === 'down' ? (
                                <ArrowDownRight className="w-3 h-3" />
                            ) : (
                                <Activity className="w-3 h-3" />
                            )}
                            {trendValue}
                        </div>
                    )}
                </div>

                <h3 className="text-slate-500 text-sm mb-1">{title}</h3>
                <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
                {subtitle && (
                    <p className="text-xs text-slate-400">{subtitle}</p>
                )}
            </div>
        </motion.div>
    );
};

// Quick Action Button
const QuickAction = ({
    icon: Icon,
    label,
    onClick,
}: {
    icon: React.ElementType;
    label: string;
    onClick?: () => void;
}) => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 
            hover:border-brand-primary/30 hover:shadow-lg hover:shadow-brand-primary/5 
            transition-all duration-300 text-right w-full group"
    >
        <div className="p-2.5 bg-brand-primary/10 rounded-xl group-hover:bg-brand-primary 
            group-hover:scale-110 transition-all duration-300">
            <Icon className="w-5 h-5 text-brand-primary group-hover:text-white transition-colors" />
        </div>
        <span className="font-medium text-slate-700 group-hover:text-brand-primary transition-colors">
            {label}
        </span>
        <ChevronLeft className="w-4 h-4 text-slate-300 mr-auto group-hover:text-brand-primary 
            group-hover:-translate-x-1 transition-all" />
    </motion.button>
);

// Activity Item Component
const ActivityItem = ({
    title,
    subtitle,
    time,
    status,
    icon: Icon = FileText,
    amount,
    currency
}: {
    title: string;
    subtitle?: string;
    time: string;
    status: 'success' | 'pending' | 'failed' | 'info';
    icon?: React.ElementType;
    amount?: number;
    currency?: string;
}) => {
    const statusConfig = {
        success: {
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            label: 'مكتمل',
            icon: CheckCircle2
        },
        pending: {
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            label: 'قيد التنفيذ',
            icon: Clock
        },
        failed: {
            color: 'text-rose-600',
            bg: 'bg-rose-50',
            label: 'ملغي',
            icon: XCircle
        },
        info: {
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            label: 'حركة',
            icon: FileText
        }
    };

    const config = statusConfig[status];
    const StatusIcon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 
                transition-colors duration-200 group cursor-pointer"
        >
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center
                    group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div>
                    <p className="font-semibold text-slate-900 group-hover:text-brand-primary transition-colors">
                        {title}
                    </p>
                    {subtitle && (
                        <p className="text-sm text-slate-400">{subtitle}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-slate-300" />
                        <span className="text-xs text-slate-400">{time}</span>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-end gap-2">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                    ${config.bg} ${config.color}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {config.label}
                </div>
                {amount !== undefined && (
                    <div className="text-sm font-bold text-slate-900 bg-slate-100/50 px-2 py-1 rounded-md">
                        {new Intl.NumberFormat('ar-EG').format(amount)} <span className="text-[10px] text-slate-500 font-medium">{currency || 'EGP'}</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// Progress Bar Component
const ProgressBar = ({
    label,
    value,
    max,
    color = 'primary'
}: {
    label: string;
    value: number;
    max: number;
    color?: 'primary' | 'success' | 'warning' | 'danger';
}) => {
    const percentage = Math.round((value / max) * 100);
    const colorClasses = {
        primary: 'bg-brand-primary',
        success: 'bg-emerald-500',
        warning: 'bg-amber-500',
        danger: 'bg-rose-500'
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">{label}</span>
                <span className="text-sm font-bold text-slate-800">{percentage}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full ${colorClasses[color]}`}
                />
            </div>
        </div>
    );
};

// Circular Progress Component
const CircularProgress = ({
    value,
    label,
    color = 'primary'
}: {
    value: number;
    label: string;
    color?: 'primary' | 'success' | 'warning';
}) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    const colorClasses = {
        primary: 'text-brand-primary',
        success: 'text-emerald-500',
        warning: 'text-amber-500'
    };

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-24 h-24">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="48"
                        cy="48"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-slate-100"
                    />
                    <motion.circle
                        cx="48"
                        cy="48"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        className={colorClasses[color]}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                        style={{ strokeDasharray: circumference }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-slate-800">{value}%</span>
                </div>
            </div>
            <span className="text-sm text-slate-500 mt-2">{label}</span>
        </div>
    );
};

const ManagementDashboard: React.FC = () => {
    usePageTitle('لوحة التحكم - الإدارة');
    const navigate = useNavigate();
    const { defaultCurrency, getCurrencyLabel, convertAmount } = useSystemSettings();
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [currentTime, setCurrentTime] = useState(new Date());

    // Analytical States
    const [topCustomers, setTopCustomers] = useState<{ label: string; value: number; color: string }[]>([]);
    const [warehouseValueDist, setWarehouseValueDist] = useState<{ label: string; value: number; color: string }[]>([]);
    const [latestSaleOrders, setLatestSaleOrders] = useState<any[]>([]);
    const [latestPurchaseOrders, setLatestPurchaseOrders] = useState<any[]>([]);
    const [monthlyProfitStats, setMonthlyProfitStats] = useState<{ date: string; profit: number }[]>([]);

    // Dashboard Data States
    const [stockStats, setStockStats] = useState({ totalValue: 0, totalItems: 0, lowStock: 0, totalQuantity: 0 });
    const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0, onLeave: 0, total: 1 });
    const [customerOutstanding, setCustomerOutstanding] = useState(0);
    const [supplierOutstanding, setSupplierOutstanding] = useState(0);
    const [recentMovements, setRecentMovements] = useState<any[]>([]);

    // Functional Area Stats
    const [procurementStats, setProcurementStats] = useState({ waitingImports: 0, pendingPRs: 0, suppliersCount: 0 });
    const [salesStats, setSalesStats] = useState({ customersCount: 0, pendingRequests: 0, totalOrders: 0 });
    const [warehouseStats, setWarehouseStats] = useState({ pendingInspections: 0, pendingTransfers: 0, warehousesCount: 0 });
    const [financeStats, setFinanceStats] = useState({ unpaidInvoices: 0, vouchersCount: 0, pendingVouchers: 0 });

    // Chart Data States
    interface ChartDataPoint { label: string; sales: number; expenses: number; profit: number; }
    const [chartTimeframe, setChartTimeframe] = useState<'monthly' | 'weekly' | 'daily'>('monthly');
    const [allChartData, setAllChartData] = useState<{ monthly: ChartDataPoint[], weekly: ChartDataPoint[], daily: ChartDataPoint[] }>({
        monthly: [], weekly: [], daily: []
    });

    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    useEffect(() => {
        const fetchAllData = async (silent = false) => {
            try {
                if (!silent) setIsLoading(true);
                else setIsRefreshing(true);
                const todayCurrent = new Date().toISOString().split('T')[0];

                const results: any[] = await Promise.all([
                    stockBalanceService.getAllBalances(), // 0
                    warehouseService.getActive(), // 1
                    hrService.getAttendance(todayCurrent, todayCurrent), // 2
                    customerService.getOutstandingSummary(), // 3
                    supplierService.getOutstandingSummary(), // 4
                    stockMovementService.getPaged({ page: 0, size: 10 }), // 5
                    salesInvoiceService.getAll(), // 6
                    supplierInvoiceService.getAllInvoices().then((res: any) => res?.data ?? []), // 7
                    // Finance
                    paymentVoucherService.getUnpaidInvoices().catch(() => []), // 8
                    paymentVoucherService.getAllVouchers().catch(() => []), // 9
                    // Procurement
                    purchaseOrderService.getWaitingForArrivalPOs().catch(() => []), // 10
                    purchaseService.getAllPRs().catch(() => []), // 11
                    purchaseService.getAllSuppliers().catch(() => []), // 12
                    // Sales
                    customerRequestService.getAllRequests().then((r: any) => r.data || []).catch(() => []), // 13
                    saleOrderService.getAll().catch(() => []), // 14
                    purchaseOrderService.getAllPOs().catch(() => []), // 15
                    // Warehouse
                    grnService.getAllGRNs().catch(() => []), // 16
                    transferNoteService.getAll().catch(() => []) // 17
                ]);

                const [
                    stockRes, warehouseRes, attendanceRes, customerRes, supplierRes,
                    movementRes, salesRes, supplierInvsRes,
                    unpaidInvsRes, vouchersRes, waitingPOsRes, prsRes, allSuppliersRes,
                    salesRequestsRes, allSalesOrdersRes, allPurchaseOrdersRes, grnsRes, transfersRes
                ] = results;

                // 1. Process Stock Data
                const stocks = stockRes.data || [];
                const totalValue = stocks.reduce((acc: any, s: any) => acc + ((s.quantityOnHand || 0) * (s.averageCost || 0)), 0);
                const lowStockCount = stocks.filter((s: any) => (s.quantityOnHand || 0) < 10).length;
                const totalQuantity = stocks.reduce((acc: any, s: any) => acc + (s.quantityOnHand || 0), 0);
                setStockStats({ totalValue, totalItems: stocks.length, lowStock: lowStockCount, totalQuantity });

                // 2. Warehouse Stats
                const warehouses = warehouseRes?.data || warehouseRes || [];
                const grnsArr = Array.isArray(grnsRes) ? grnsRes : [];
                const transfersArr = Array.isArray(transfersRes) ? transfersRes : [];
                setWarehouseStats({
                    pendingInspections: grnsArr.filter((g: any) => g.status === 'Pending Inspection').length,
                    pendingTransfers: transfersArr.filter((t: any) => t.status === 'Draft' || t.status === 'Pending').length,
                    warehousesCount: Array.isArray(warehouses) ? warehouses.length : 0
                });

                // 3. Attendance
                const attendance = attendanceRes.data || [];
                setAttendanceStats({
                    present: attendance.filter((a: any) => a.status === 'PRESENT').length,
                    absent: attendance.filter((a: any) => a.status === 'ABSENT').length,
                    onLeave: attendance.filter((a: any) => a.status === 'LEAVE').length,
                    total: attendance.length || 1
                });

                // 4. Procurement
                setProcurementStats({
                    waitingImports: Array.isArray(waitingPOsRes) ? waitingPOsRes.length : 0,
                    pendingPRs: Array.isArray(prsRes) ? prsRes.filter((p: any) => p.status === 'Pending' || p.status === 'Draft').length : 0,
                    suppliersCount: Array.isArray(allSuppliersRes) ? allSuppliersRes.length : 0
                });

                // 5. Sales
                const salesOrdersArr = Array.isArray(allSalesOrdersRes) ? allSalesOrdersRes : [];
                setSalesStats({
                    customersCount: (customerRes || []).length,
                    pendingRequests: Array.isArray(salesRequestsRes) ? salesRequestsRes.filter((r: any) => r.status === 'Pending' || r.status === 'Draft').length : 0,
                    totalOrders: salesOrdersArr.length
                });

                // 6. Finance
                const vouchersArr = Array.isArray(vouchersRes) ? vouchersRes : [];
                setFinanceStats({
                    unpaidInvoices: Array.isArray(unpaidInvsRes) ? unpaidInvsRes.length : 0,
                    vouchersCount: vouchersArr.length,
                    pendingVouchers: vouchersArr.filter((v: any) => v.status === 'Draft' || v.approvalStatus === 'Pending').length
                });

                // 7. Outstanding
                const customersArr = Array.isArray(customerRes) ? customerRes : [];
                const salesInvoicesArr = Array.isArray(salesRes) ? salesRes : [];
                let totalCustOutstanding = 0;
                customersArr.forEach((s: any) => {
                    const customerInvoices = salesInvoicesArr.filter(inv => inv.customerId === s.id && (inv.status === 'Approved' || !inv.status));
                    const totalInvoiced = customerInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
                    const totalPaid = customerInvoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
                    totalCustOutstanding += (totalInvoiced - (s.totalReturned || 0) - totalPaid);
                });
                setCustomerOutstanding(totalCustOutstanding);
                setSupplierOutstanding((supplierRes.data || supplierRes || []).reduce((acc: any, s: any) => acc + (s.currentBalance || 0), 0));

                setRecentMovements(movementRes.content || []);

                // --- Analytics ---
                const customerRevenue: Record<string, number> = {};
                salesInvoicesArr.forEach((inv: any) => {
                    const name = inv.customerNameAr || inv.customerName || 'غير معروف';
                    customerRevenue[name] = (customerRevenue[name] || 0) + (inv.totalAmount || 0);
                });
                setTopCustomers(Object.entries(customerRevenue)
                    .sort(([, a], [, b]) => b - a).slice(0, 5).map(([label, value], i) => ({
                        label, value, color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][i]
                    })));

                // Warehouse Stock Value Distribution
                const warehouseRevenue: Record<string, number> = {};
                stocks.forEach((s: any) => {
                    const name = s.warehouseNameAr || 'مستودع غير معروف';
                    const value = (s.quantityOnHand || 0) * (s.averageCost || 0);
                    warehouseRevenue[name] = (warehouseRevenue[name] || 0) + value;
                });
                setWarehouseValueDist(Object.entries(warehouseRevenue)
                    .sort(([, a], [, b]) => b - a).map(([label, value], i) => ({
                        label, value, color: ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16'][i % 7]
                    })));

                const sortedSOs = [...salesOrdersArr].sort((a,b) => new Date(b.soDate || 0).getTime() - new Date(a.soDate || 0).getTime());
                setLatestSaleOrders(sortedSOs.slice(0, 5));

                const sortedPOs = [...(Array.isArray(allPurchaseOrdersRes) ? allPurchaseOrdersRes : [])]
                    .sort((a,b) => new Date(b.poDate || 0).getTime() - new Date(a.poDate || 0).getTime());
                setLatestPurchaseOrders(sortedPOs.slice(0, 5));

                // --- Monthly Profit Analysis ---
                const currentMonth = todayCurrent.substring(0, 7);
                const profitByDay: Record<string, number> = {};
                salesInvoicesArr.forEach(inv => {
                    if (inv.invoiceDate?.startsWith(currentMonth)) {
                        const day = inv.invoiceDate.split('T')[0];
                        profitByDay[day] = (profitByDay[day] || 0) + (inv.totalAmount || 0);
                    }
                });
                const supplierInvoicesArr = Array.isArray(supplierInvsRes) ? supplierInvsRes : [];
                supplierInvoicesArr.forEach(inv => {
                    if (inv.invoiceDate?.startsWith(currentMonth)) {
                        const day = inv.invoiceDate.split('T')[0];
                        profitByDay[day] = (profitByDay[day] || 0) - (inv.totalAmount || 0);
                    }
                });

                setMonthlyProfitStats(Object.entries(profitByDay)
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .map(([date, profit]) => ({ date, profit })));

                // --- Chart Metrics ---
                const now = new Date();
                const monthly: ChartDataPoint[] = [];
                for (let i = 5; i >= 0; i--) {
                    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    const mStr = d.toISOString().substring(0, 7);
                    const mSales = salesInvoicesArr.filter(v => parseBackendDateStr(v.invoiceDate).startsWith(mStr)).reduce((s,v) => s + (v.totalAmount || 0), 0);
                    const mExp = supplierInvoicesArr.filter(v => parseBackendDateStr(v.invoiceDate).startsWith(mStr)).reduce((s,v) => s + (v.totalAmount || 0), 0);
                    monthly.push({ label: d.toLocaleDateString('ar-EG', { month: 'short' }), sales: mSales, expenses: mExp, profit: mSales - mExp });
                }

                const daily: ChartDataPoint[] = [];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date(now); d.setDate(d.getDate() - i);
                    const dStr = d.toISOString().split('T')[0];
                    const dSales = salesInvoicesArr.filter(v => parseBackendDateStr(v.invoiceDate).startsWith(dStr)).reduce((s,v) => s + (v.totalAmount || 0), 0);
                    const dExp = supplierInvoicesArr.filter(v => parseBackendDateStr(v.invoiceDate).startsWith(dStr)).reduce((s,v) => s + (v.totalAmount || 0), 0);
                    daily.push({ label: d.toLocaleDateString('ar-EG', { weekday: 'short' }), sales: dSales, expenses: dExp, profit: dSales - dExp });
                }

                const weekly: ChartDataPoint[] = [];
                for (let i = 3; i >= 0; i--) {
                    const dEnd = new Date(now); dEnd.setDate(now.getDate() - (i * 7));
                    const dStart = new Date(dEnd); dStart.setDate(dEnd.getDate() - 6);
                    const wSales = salesInvoicesArr.filter(inv => {
                        const ide = parseBackendDateStr(inv.invoiceDate);
                        return ide && new Date(ide) >= dStart && new Date(ide) <= dEnd;
                    }).reduce((s,v) => s + (v.totalAmount || 0), 0);
                    const wExp = supplierInvoicesArr.filter(inv => {
                        const ide = parseBackendDateStr(inv.invoiceDate);
                        return ide && new Date(ide) >= dStart && new Date(ide) <= dEnd;
                    }).reduce((s,v) => s + (v.totalAmount || 0), 0);
                    weekly.push({ label: `الأسبوع ${4 - i}`, sales: wSales, expenses: wExp, profit: wSales - wExp });
                }

                setAllChartData({ monthly, weekly, daily });
                setLastUpdated(new Date());

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                toast.error('فشل تحميل بعض بيانات لوحة التحكم');
            } finally {
                setIsLoading(false);
                setIsRefreshing(false);
            }
        };

        fetchAllData();
        const handleRefresh = () => fetchAllData(true);
        window.addEventListener('refresh-dashboard', handleRefresh);
        const refreshInterval = setInterval(() => fetchAllData(true), 60000);
        return () => {
            clearInterval(refreshInterval);
            window.removeEventListener('refresh-dashboard', handleRefresh);
        };
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const employeeDisplayName = user?.fullNameAr || user?.username || 'المستخدم';

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'صباح الخير';
        return 'مساء الخير';
    };

    const formatDate = () => {
        return formatDateEn(currentTime, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Header Section */}
            <motion.div
                variants={itemVariants}
                className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 
                    rounded-3xl p-8 text-white"
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
                <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-white/20 rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />

                {/* Floating Icons */}
                <div className="absolute top-10 left-20 opacity-10">
                    <BarChart3 className="w-16 h-16" />
                </div>
                <div className="absolute bottom-10 right-40 opacity-10">
                    <TrendingUp className="w-20 h-20" />
                </div>

                <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6">
                    <div>
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm flex items-center gap-2 relative z-10">
                                <Calendar className="w-4 h-4" />
                                {formatDate()}
                            </span>
                            <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm flex items-center gap-2 relative z-10">
                                <Clock className="w-4 h-4" />
                                {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <div className="relative z-10 w-full sm:w-auto">
                                <ExchangeRateCompact />
                            </div>
                        </div>

                        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3 relative z-10">
                            {getGreeting()}، {employeeDisplayName}
                            <motion.span
                                animate={{ rotate: [0, 20, 0] }}
                                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                            >
                                👋
                            </motion.span>
                        </h1>
                        <div className="flex items-center gap-4 relative z-10">
                            <p className="text-white/70 text-lg">إليك ملخص ما يحدث في نظامك اليوم</p>
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 backdrop-blur-sm">
                                <motion.div 
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                                />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Live</span>
                                <span className="text-[10px] text-white/50 border-r border-white/10 pr-2">
                                    تحديث: {lastUpdated.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 relative z-10">
                        <button className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all">
                            <Bell className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => {
                                // Direct call to inner fetch via a reload-like behavior but silent
                                window.dispatchEvent(new CustomEvent('refresh-dashboard'));
                            }}
                            disabled={isRefreshing}
                            className={`p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all ${isRefreshing ? 'animate-spin opacity-50' : ''}`}
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                        <button className="inline-flex items-center gap-2 px-5 py-3 bg-white text-brand-primary 
                            rounded-xl font-bold hover:bg-white/90 transition-all duration-300 shadow-lg">
                            <Download className="w-5 h-5" />
                            تصدير التقارير
                        </button>
                    </div>
                </div>

                {/* Quick Indicators in Header */}
                <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-6 border-t border-white/10">
                    {[
                        { label: 'مديونية العملاء', value: convertAmount(customerOutstanding, 'EGP'), icon: Wallet, isCurrency: true },
                        { label: 'مستحقات الموردين', value: convertAmount(supplierOutstanding, 'EGP'), icon: Landmark, isCurrency: true },
                        { label: 'نواقص المخزون', value: stockStats.lowStock, icon: AlertTriangle, isNumeric: true },
                        { label: 'حضور الموظفين', value: attendanceStats.present, icon: User, isNumeric: true },
                    ].map((stat, i) => (
                        <div key={i} className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                            <stat.icon className="w-6 h-6 mx-auto mb-2 opacity-70" />
                            <p className="text-xl font-bold">
                                {stat.isCurrency ? (
                                    <>{formatNumber(stat.value)} {getCurrencyLabel(defaultCurrency)}</>
                                ) : stat.isNumeric ? (
                                    <AnimatedNumber value={stat.value as number} />
                                ) : (
                                    stat.value
                                )}
                            </p>
                            <p className="text-xs text-white/60">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Dashboard Sections Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-48 bg-white rounded-2xl border border-slate-100 animate-pulse" />
                    ))}
                </div>
            ) : (
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8"
                >
                    {/* Sales Section */}
                    <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-r-4 border-r-blue-500">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <ShoppingCart className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">إدارة المبيعات</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">العملاء النشطون</span>
                                <span className="font-bold text-slate-900"><AnimatedNumber value={salesStats.customersCount} /></span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">طلبات العملاء المعلقة</span>
                                <span className={`font-bold ${salesStats.pendingRequests > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                                    <AnimatedNumber value={salesStats.pendingRequests} />
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm pb-2 border-b border-slate-50">
                                <span className="text-slate-500">إجمالي أوامر البيع</span>
                                <span className="font-bold text-slate-900"><AnimatedNumber value={salesStats.totalOrders} /></span>
                            </div>
                            <button 
                                onClick={() => navigate('/dashboard/customer-request')}
                                className="w-full py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                            >
                                انتقال للبيانات <ChevronLeft className="w-3 h-3" />
                            </button>
                        </div>
                    </motion.div>

                    {/* Procurement Section */}
                    <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-r-4 border-r-indigo-500">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <FileText className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">المشتريات</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">بضاعة في الطريق (Imports)</span>
                                <span className="font-bold text-slate-900"><AnimatedNumber value={procurementStats.waitingImports} /></span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">طلبات شراء معلقة</span>
                                <span className={`font-bold ${procurementStats.pendingPRs > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                                    <AnimatedNumber value={procurementStats.pendingPRs} />
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm pb-2 border-b border-slate-50">
                                <span className="text-slate-500">إجمالي الموردين</span>
                                <span className="font-bold text-slate-900"><AnimatedNumber value={procurementStats.suppliersCount} /></span>
                            </div>
                            <button 
                                onClick={() => navigate('/dashboard/procurement')}
                                className="w-full py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                            >
                                إدارة المشتريات <ChevronLeft className="w-3 h-3" />
                            </button>
                        </div>
                    </motion.div>

                    {/* Warehouse Section */}
                    <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-r-4 border-r-purple-500">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <Package className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">المخازن والمستودعات</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">فحص استلام معلق (GRN)</span>
                                <span className={`font-bold ${warehouseStats.pendingInspections > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                                    <AnimatedNumber value={warehouseStats.pendingInspections} />
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">تحويلات بين المخازن</span>
                                <span className="font-bold text-slate-900"><AnimatedNumber value={warehouseStats.pendingTransfers} /></span>
                            </div>
                            <div className="flex justify-between items-center text-sm pb-2 border-b border-slate-50">
                                <span className="text-slate-500">عدد المستودعات</span>
                                <span className="font-bold text-slate-900"><AnimatedNumber value={warehouseStats.warehousesCount} /></span>
                            </div>
                            <button 
                                onClick={() => navigate('/dashboard/inventory')}
                                className="w-full py-2 text-xs font-semibold text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                            >
                                تصفح المخزون <ChevronLeft className="w-3 h-3" />
                            </button>
                        </div>
                    </motion.div>

                    {/* Finance Section */}
                    <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-r-4 border-r-emerald-500">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-emerald-50 rounded-lg">
                                <Wallet className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">المالية والخزينة</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">فواتير غير مدفوعة</span>
                                <span className={`font-bold ${financeStats.unpaidInvoices > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                                    <AnimatedNumber value={financeStats.unpaidInvoices} />
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">سندات صرف معلقة</span>
                                <span className="font-bold text-slate-900"><AnimatedNumber value={financeStats.pendingVouchers} /></span>
                            </div>
                            <div className="flex justify-between items-center text-sm pb-2 border-b border-slate-50">
                                <span className="text-slate-500">إجمالي السندات</span>
                                <span className="font-bold text-slate-900"><AnimatedNumber value={financeStats.vouchersCount} /></span>
                            </div>
                            <button 
                                onClick={() => navigate('/dashboard/finance')}
                                className="w-full py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                            >
                                البيانات المالية <ChevronLeft className="w-3 h-3" />
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Supervision & Analysis Row */}
            {!isLoading && (
                <>
                    {/* Full Width Profit Chart */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="mb-8"
                    >
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[650px] overflow-hidden">
                            <MonthlyProfitChart data={monthlyProfitStats} />
                        </div>
                    </motion.div>

                    {/* Latest Activities Grid */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8"
                    >
                        {/* Latest Sale Orders (5 items) */}
                        <div className="lg:col-span-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <TrendingUp className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">أخر ٥ أوامر بيع</h3>
                                </div>
                                <button
                                    onClick={() => navigate('/dashboard/sales/orders')}
                                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 underline"
                                >
                                    عرض الكل
                                </button>
                            </div>
                            <div className="space-y-3">
                                {latestSaleOrders.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400 text-sm">لا توجد أوامر بيع مؤخراً</div>
                                ) : (
                                    latestSaleOrders.map((so, i) => (
                                        <ActivityItem
                                            key={i}
                                            title={so.customerNameAr || so.customerName || 'عميل نقدي'}
                                            subtitle={`${so.soNumber} - ${so.status || 'نشط'}`}
                                            time={new Date(so.soDate || 0).toLocaleDateString('ar-EG')}
                                            status="success"
                                            icon={ShoppingCart}
                                            amount={so.totalAmount}
                                            currency={so.currency}
                                        />
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Latest Purchase Orders (5 items) */}
                        <div className="lg:col-span-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-purple-50 rounded-lg">
                                        <Package className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">أخر ٥ أوامر شراء</h3>
                                </div>
                                <button
                                    onClick={() => navigate('/dashboard/procurement/po')}
                                    className="text-[11px] font-bold text-purple-600 hover:text-purple-700 underline"
                                >
                                    عرض الكل
                                </button>
                            </div>
                            <div className="space-y-3">
                                {latestPurchaseOrders.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400 text-sm">لا توجد أوامر شراء مؤخراً</div>
                                ) : (
                                    latestPurchaseOrders.map((po, i) => (
                                        <ActivityItem
                                            key={i}
                                            title={po.supplierNameAr || po.supplierName || 'مورد عام'}
                                            subtitle={`${po.poNumber} - ${po.status || 'بإنتظار الاستلام'}`}
                                            time={new Date(po.poDate || 0).toLocaleDateString('ar-EG')}
                                            status="info"
                                            icon={FileText}
                                            amount={po.totalAmount}
                                            currency={po.currency}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Inventory Movements (Full Width) */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="mb-8"
                    >
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-slate-50 rounded-lg">
                                        <Activity className="w-5 h-5 text-slate-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">أخر عشر حركات</h3>
                                </div>
                                <button
                                    onClick={() => navigate('/dashboard/inventory/item-movement')}
                                    className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                                >
                                    سجل الحركة التفصيلي <ChevronLeft className="w-3 h-3" />
                                </button>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-right">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="pb-4 pt-2 text-sm font-semibold text-slate-500">التاريخ</th>
                                            <th className="pb-4 pt-2 text-sm font-semibold text-slate-500">الصنف</th>
                                            <th className="pb-4 pt-2 text-sm font-semibold text-slate-500">النوع</th>
                                            <th className="pb-4 pt-2 text-sm font-semibold text-slate-500 text-center">الكمية</th>
                                            <th className="pb-4 pt-2 text-sm font-semibold text-slate-500 text-center">الرصيد</th>
                                            <th className="pb-4 pt-2 text-sm font-semibold text-slate-500">المستودع</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {recentMovements.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">لا توجد حركات مخزنية مؤخراً</td>
                                            </tr>
                                        ) : (
                                            recentMovements.map((m, i) => (
                                                <motion.tr 
                                                    key={i}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    className="group hover:bg-slate-50 transition-colors"
                                                >
                                                    <td className="py-4 text-sm text-slate-600">
                                                        {new Date(m.date || 0).toLocaleDateString('ar-EG')}
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-slate-900 group-hover:text-brand-primary transition-colors">{m.itemNameAr || 'صنف غير معروف'}</span>
                                                            <span className="text-[10px] font-mono text-slate-400">{m.itemCode}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4">
                                                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold inline-block
                                                            ${m.type === 'ISSUE' || m.type === 'TRANSFER_OUT' || m.type === 'RETURN' 
                                                                ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                            {getMovementTypeLabel(m.type)}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 text-center">
                                                        <span className={`font-bold ${m.qty < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                            {m.qty > 0 ? '+' : ''}{m.qty}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 text-center">
                                                        <span className="font-bold text-slate-900">{m.balance}</span>
                                                    </td>
                                                    <td className="py-4 text-sm text-slate-500 font-medium">
                                                        {m.warehouseNameAr || 'المخزن الرئيسي'}
                                                    </td>
                                                </motion.tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}

            {/* Business Intelligence & Stats Row */}
            {!isLoading && (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                >
                    <div className="md:col-span-1 lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[280px]">
                        <AnalyticalDonut 
                            data={topCustomers} 
                            title="أهم العملاء" 
                            subtitle="توزيع الإيرادات حسب كبار العملاء" 
                        />
                    </div>
                    <div className="md:col-span-1 lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[280px]">
                        <AnalyticalDonut 
                            data={warehouseValueDist} 
                            title="توزيع المخزون" 
                            subtitle="قيمة البضاعة حسب المستودعات" 
                        />
                    </div>
                    <StatCard
                        title="حضور اليوم"
                        value={attendanceStats.present}
                        icon={Activity}
                        color="success"
                        isNumeric
                        subtitle={`${attendanceStats.absent} غياب، ${attendanceStats.onLeave} إجازة`}
                        onClick={() => navigate('/dashboard/hr/attendance')}
                    />
                    <StatCard
                        title="قيمة المخزون"
                        value={`${formatNumber(convertAmount(stockStats.totalValue, 'EGP'))} ${getCurrencyLabel(defaultCurrency)}`}
                        icon={DollarSign}
                        color="primary"
                        subtitle={`إجمالي ${formatNumber(stockStats.totalQuantity)} قطعة`}
                        onClick={() => navigate('/dashboard/inventory/stock-levels')}
                    />
                </motion.div>
            )}

            {/* Main Content Grid */}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
                {/* Chart Section */}
                <motion.div
                    variants={itemVariants}
                    className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">إحصائيات الأداء</h3>
                            <p className="text-sm text-slate-500">تحليل البيانات خلال الأشهر الماضية</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setChartTimeframe('monthly')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${chartTimeframe === 'monthly' ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' : 'text-slate-500 hover:bg-slate-100 bg-transparent'}`}
                            >
                                شهري
                            </button>
                            <button
                                onClick={() => setChartTimeframe('weekly')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${chartTimeframe === 'weekly' ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' : 'text-slate-500 hover:bg-slate-100 bg-transparent'}`}
                            >
                                أسبوعي
                            </button>
                            <button
                                onClick={() => setChartTimeframe('daily')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${chartTimeframe === 'daily' ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' : 'text-slate-500 hover:bg-slate-100 bg-transparent'}`}
                            >
                                يومي
                            </button>
                        </div>
                    </div>

                    {/* Dynamic Chart */}
                    <div className="relative h-[300px] mt-6 bg-gradient-to-br from-slate-50 to-white rounded-xl 
                        border border-slate-100 flex items-center justify-center overflow-hidden px-4 sm:px-8">

                        {/* Background Lines */}
                        <div className="absolute inset-0 opacity-30 pointer-events-none">
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute left-0 right-0 border-b border-slate-200"
                                    style={{ top: `${(i + 1) * 16.66}%` }}
                                />
                            ))}
                        </div>

                        {/* Bars Group */}
                        <div className="absolute inset-x-2 sm:inset-x-8 bottom-0 top-6 flex items-end justify-around w-full z-10 px-4 sm:px-8">
                            {(() => {
                                const currentData = allChartData[chartTimeframe] || [];
                                const maxVal = Math.max(...currentData.map(d => Math.max(d.sales, d.expenses)), 100);
                                const scaleFactor = 90 / maxVal;

                                return currentData.map((d, i) => (
                                    <div key={i} className="flex flex-col items-center justify-end h-full group w-full px-0.5 sm:px-1">
                                        <div className="flex items-end justify-center w-full h-full gap-0.5 sm:gap-1 mb-2">
                                            {/* Sales Bar */}
                                            <div className="relative flex flex-col items-center justify-end h-full w-full max-w-4 sm:max-w-8">
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${Math.max((d.sales * scaleFactor), 1)}%` }}
                                                    transition={{ duration: 0.5, delay: i * 0.05 }}
                                                    className="w-full bg-brand-primary rounded-t bg-opacity-90 hover:bg-opacity-100 transition-opacity relative group/bar cursor-pointer"
                                                >
                                                    <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-bold py-1 px-3 rounded pointer-events-none whitespace-nowrap z-20 shadow-lg transition-opacity">
                                                        المبيعات: {formatNumber(convertAmount(d.sales, 'EGP'))}
                                                    </div>
                                                </motion.div>
                                            </div>

                                            {/* Expenses Bar */}
                                            <div className="relative flex flex-col items-center justify-end h-full w-full max-w-4 sm:max-w-8">
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${Math.max((d.expenses * scaleFactor), 1)}%` }}
                                                    transition={{ duration: 0.5, delay: i * 0.05 + 0.1 }}
                                                    className="w-full bg-amber-500 rounded-t bg-opacity-90 hover:bg-opacity-100 transition-opacity relative group/bar cursor-pointer"
                                                >
                                                    <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-bold py-1 px-3 rounded pointer-events-none whitespace-nowrap z-20 shadow-lg transition-opacity">
                                                        المصروفات: {formatNumber(convertAmount(d.expenses, 'EGP'))}
                                                    </div>
                                                </motion.div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 whitespace-nowrap overflow-hidden text-clip max-w-[40px] sm:max-w-full text-center hover:text-slate-800 transition-colors">
                                            {d.label}
                                        </span>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-8 mt-6 pt-6 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-brand-primary" />
                            <span className="text-sm text-slate-600 font-bold">المبيعات</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500" />
                            <span className="text-sm text-slate-600 font-bold">المصروفات والموردين</span>
                        </div>
                    </div>
                </motion.div>

                {/* Latest Activity Highlights */}
                <motion.div
                    variants={itemVariants}
                    className="lg:col-span-1 space-y-6 flex flex-col"
                >
                    <LatestActivityCard 
                        type="SO"
                        data={latestSaleOrders[0]}
                        onClick={() => navigate('/dashboard/sales/orders')}
                    />
                    <LatestActivityCard 
                        type="PO"
                        data={latestPurchaseOrders[0]}
                        onClick={() => navigate('/dashboard/procurement/po')}
                    />
                </motion.div>
            </motion.div>



            {/* Bottom Section */}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
                {/* Quick Actions */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-brand-primary/10 rounded-lg">
                            <Zap className="w-5 h-5 text-brand-primary" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">إجراءات سريعة</h3>
                    </div>

                    <div className="space-y-3">
                        <QuickAction
                            icon={UserPlus}
                            label="إضافة موظف جديد"
                            onClick={() => navigate('/dashboard/employees')}
                        />
                        <QuickAction
                            icon={FileText}
                            label="إنشاء فاتورة"
                            onClick={() => navigate('/dashboard/procurement/invoices/new')}
                        />
                        <QuickAction
                            icon={ShoppingCart}
                            label="أمر بيع جديد"
                            onClick={() => navigate('/dashboard/sales/sale-orders/new')}
                        />
                        <QuickAction
                            icon={Package}
                            label="إضافة منتج"
                            onClick={() => navigate('/dashboard/inventory')}
                        />
                    </div>
                </motion.div>


                {/* Performance & Capacity Section */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <PieChart className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">مؤشرات الأداء</h3>
                    </div>

                    <div className="flex items-center justify-around mb-8">
                        <CircularProgress
                            value={(attendanceStats.present / (attendanceStats.total || 1)) * 100}
                            label="الحضور"
                            color="success"
                        />
                        <CircularProgress
                            value={((stockStats.totalItems - stockStats.lowStock) / (stockStats.totalItems || 1)) * 100}
                            label="كفاية المخزون"
                            color="primary"
                        />
                    </div>

                    <div className="space-y-6 pt-6 border-t border-slate-100">
                        <ProgressBar
                            label="تغطية طلبات العملاء"
                            value={salesStats.totalOrders > 0 ? 100 - Math.round((salesStats.pendingRequests / (salesStats.totalOrders + salesStats.pendingRequests)) * 100) : 100}
                            max={100}
                            color="primary"
                        />
                        <ProgressBar
                            label="دقة استلام المشتريات"
                            value={procurementStats.waitingImports === 0 ? 100 : 85}
                            max={100}
                            color="success"
                        />
                    </div>

                    <div className="mt-8 space-y-3">
                        <QuickAction
                            icon={Package}
                            label="جرد مخزني"
                            onClick={() => navigate('/dashboard/inventory/stock-adjustment')}
                        />
                    </div>
                </motion.div>

                {/* Exchange Rate Widget Section */}
                <motion.div
                    variants={itemVariants}
                    className="h-full"
                >
                    <ExchangeRateWidget />
                </motion.div>
            </motion.div>

            {/* Bottom Alert Section */}
            {stockStats.lowStock > 0 && (
                <motion.div
                    variants={itemVariants}
                    className="bg-gradient-to-l from-rose-500 to-rose-600 p-6 rounded-2xl text-white shadow-lg shadow-rose-200"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-xl">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">تنبيه مستويات المخزون</h3>
                                <p className="text-white/80">هناك {stockStats.lowStock} أصناف وصلت للحد الأدنى، يرجى مراجعة طلبات الشراء.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard/inventory/stock-levels')}
                            className="px-6 py-3 bg-white text-rose-600 rounded-xl font-bold hover:bg-rose-50 transition-colors"
                        >
                            معالجة النواقص
                        </button>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default ManagementDashboard;