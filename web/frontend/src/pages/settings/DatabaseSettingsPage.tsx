import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Database, Upload, FileText,
    RefreshCw, ArrowRight, Download,
    Activity, HardDrive, Layers, Server,
    Search, Eye, EyeOff, AlertTriangle,
    CheckCircle2, Terminal, X, Shield, XCircle,
    Trash2, Play, AlertOctagon,
    LayoutDashboard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL;

interface TableStatus {
    name: string;
    rows: number;
    dataSize: number;
    indexSize: number;
    comment: string;
}

const LogList = React.memo(({ logs }: { logs: string[] }) => {
    return (
        <div className="space-y-0.5">
            {logs.map((log, index) => {
                let colorClass = "text-slate-300";
                if (log.includes("INFO")) colorClass = "text-blue-400";
                if (log.includes("WARN")) colorClass = "text-amber-400";
                if (log.includes("ERROR")) colorClass = "text-red-400";
                if (log.includes("DEBUG")) colorClass = "text-slate-500";

                return (
                    <div key={index} className={`${colorClass} hover:bg-slate-900 px-1 rounded flex items-start`}>
                        <span className="opacity-50 select-none mr-2 w-6 text-right flex-shrink-0 text-[10px] mt-0.5">
                            {String(index + 1).padStart(3, '0')}
                        </span>
                        <span className="break-all text-[11px] font-mono">{log}</span>
                    </div>
                );
            })}
        </div>
    );
});

const DatabaseSettingsPage: React.FC = () => {
    const navigate = useNavigate();

    // UI Tabs
    const [activeTab, setActiveTab] = useState<'dashboard' | 'sql' | 'logs'>('dashboard');

    // General State
    const [file, setFile] = useState<File | null>(null);
    const [restoring, setRestoring] = useState(false);
    const [backingUp, setBackingUp] = useState(false);
    const [restoreOutput, setRestoreOutput] = useState<string>('');
    const [confirmText, setConfirmText] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

    // Clear Data State
    const [selectedTables, setSelectedTables] = useState<string[]>([]);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [disableFkChecks, setDisableFkChecks] = useState(false);
    const [clearingData, setClearingData] = useState(false);

    // SQL Console State
    const [sqlScript, setSqlScript] = useState('');
    const [executingSql, setExecutingSql] = useState(false);
    const [sqlResult, setSqlResult] = useState<string>('');

    // Error Logs State
    const [errorLogs, setErrorLogs] = useState<string[]>([]);
    const [loadingErrorLogs, setLoadingErrorLogs] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [tableSearch, setTableSearch] = useState('');
    const [activeLogFilter, setActiveLogFilter] = useState<string>('all');
    const [autoRefresh, setAutoRefresh] = useState(false);

    // Notification state
    const [notification, setNotification] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);

    const [dbUser, setDbUser] = useState('');
    const [dbPassword, setDbPassword] = useState('');

    // Table Data Viewer State
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [tableData, setTableData] = useState<any[]>([]);
    const [loadingTableData, setLoadingTableData] = useState(false); // Fixed typo
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [overview, setOverview] = useState<TableStatus[]>([]);
    const [loadingStats, setLoadingStats] = useState(false);

    const [logs, setLogs] = useState<string[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const logsEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const showNotification = useCallback((type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 6000);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.name.endsWith('.sql')) {
            setFile(droppedFile);
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleRestore = async () => {
        if (!file) return;
        setRestoring(true);
        setRestoreOutput('Starting restore process...\nUploading file...\n');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('dbUser', dbUser);
        formData.append('dbPassword', dbPassword);

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/api/settings/database/restore`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await response.json();
            if (data.success) {
                setRestoreOutput(prev => prev + '\nSUCCESS:\n' + data.data);
                showNotification('success', 'تمت استعادة قاعدة البيانات بنجاح');
                fetchOverview();
            } else {
                setRestoreOutput(prev => prev + '\nFAILED:\n' + data.message);
                showNotification('error', 'فشلت عملية الاستعادة: ' + data.message);
            }
        } catch (error: any) {
            setRestoreOutput(prev => prev + '\nERROR:\n' + error.message);
            showNotification('error', 'حدث خطأ: ' + error.message);
        } finally {
            setRestoring(false);
            setShowConfirm(false);
            setConfirmText('');
        }
    };

    const handleBackup = async () => {
        if (!dbUser) {
            showNotification('error', 'اسم مستخدم قاعدة البيانات مطلوب للنسخ الاحتياطي');
            return;
        }
        setBackingUp(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(
                `${API_BASE_URL}/api/settings/database/backup?dbUser=${encodeURIComponent(dbUser)}&dbPassword=${encodeURIComponent(dbPassword)}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `backup_${new Date().toISOString().split('T')[0]}.sql`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                showNotification('success', 'تم تحميل النسخة الاحتياطية بنجاح');
            } else {
                showNotification('error', 'فشل إنشاء النسخة الاحتياطية');
            }
        } catch (error: any) {
            showNotification('error', 'حدث خطأ: ' + error.message);
        } finally {
            setBackingUp(false);
        }
    };

    const handleClearTables = async () => {
        if (selectedTables.length === 0) return;
        setClearingData(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/api/settings/database/clear-tables`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tables: selectedTables,
                    disableFkChecks: disableFkChecks
                })
            });
            const data = await response.json();
            if (data.success) {
                showNotification('success', data.message);
                fetchOverview();
                setSelectedTables([]);
                setShowClearConfirm(false);
            } else {
                showNotification('error', data.message);
            }
        } catch (error: any) {
            showNotification('error', error.message);
        } finally {
            setClearingData(false);
        }
    };

    const handleExecuteSql = async () => {
        if (!sqlScript.trim()) return;
        setExecutingSql(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/api/settings/database/execute-sql`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sql: sqlScript })
            });
            const data = await response.json();
            setSqlResult(data.success ? `SUCCESS:\n${data.data}` : `ERROR:\n${data.message}`);
        } catch (error: any) {
            setSqlResult(`FATAL ERROR:\n${error.message}`);
        } finally {
            setExecutingSql(false);
        }
    };

    const fetchErrorLogs = async () => {
        setLoadingErrorLogs(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/api/settings/database/error-logs`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) setErrorLogs(data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingErrorLogs(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'logs') fetchErrorLogs();
    }, [activeTab]);

    const fetchTableData = async (tableName: string) => {
        setLoadingTableData(true);
        setSelectedTable(tableName);
        setIsModalOpen(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/api/settings/database/table/${tableName}/data?limit=50`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setTableData(data.data);
            } else {
                showNotification('error', 'فشل في جلب بيانات الجدول');
            }
        } catch (error: any) {
            showNotification('error', error.message);
        } finally {
            setLoadingTableData(false);
        }
    };

    // ─── SECTIONS MAPPING ───
    const SECTIONS = {
        'المشتريات': ['supplier', 'rfq', 'quotation', 'purchase', 'grn', 'bill'],
        'المبيعات': ['customer', 'sales', 'delivery', 'issue', 'invoice', 'receipt'],
        'المخزون': ['item', 'unit', 'warehouse', 'stock', 'category', 'adjustment', 'transfer'],
        'الموارد البشرية': ['employee', 'attendance', 'leave', 'shift', 'holiday', 'payroll', 'salary'],
        'النظام': ['user', 'role', 'permission', 'log', 'notification', 'setting']
    };

    const selectSection = (sectionName: keyof typeof SECTIONS) => {
        const keywords = SECTIONS[sectionName];
        const matchedTables = overview
            .map(t => t.name)
            .filter(name => keywords.some(k => name.toLowerCase().includes(k.toLowerCase())));

        // Toggle: if all matched are already selected, deselect them. Otherwise, select them.
        const allSelected = matchedTables.every(t => selectedTables.includes(t));

        if (allSelected) {
            setSelectedTables(prev => prev.filter(t => !matchedTables.includes(t)));
        } else {
            setSelectedTables(prev => [...new Set([...prev, ...matchedTables])]);
        }
    };

    // ─── FETCHEERS ───
    const fetchOverview = async () => {
        setLoadingStats(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/api/settings/database/overview`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) setOverview(data.data);
        } catch (error) {
            console.error('Failed to fetch overview', error);
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchLogs = async (silent = false) => {
        if (!silent) setLoadingLogs(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/api/settings/database/logs?lines=500`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                // Only update if data actually changed to avoid unnecessary re-renders
                setLogs(prev => {
                    if (JSON.stringify(prev) === JSON.stringify(data.data)) return prev;
                    return data.data;
                });
            }
        } catch (error) {
            console.error('Failed to fetch logs', error);
        } finally {
            if (!silent) setLoadingLogs(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        fetchOverview();
    }, []);

    useEffect(() => {
        let interval: any;
        if (autoRefresh) {
            interval = setInterval(() => {
                fetchLogs(true);
            }, 3000); // refresh every 3 seconds
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh]);

    useEffect(() => {
        if (logsEndRef.current && (autoRefresh || loadingLogs)) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs, autoRefresh, loadingLogs]);

    const totalSize = overview.reduce((acc, t) => acc + t.dataSize + t.indexSize, 0);
    const totalRows = overview.reduce((acc, t) => acc + t.rows, 0);
    const maxTableSize = Math.max(...overview.map(t => t.dataSize + t.indexSize), 1);

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const filteredTables = overview.filter(t =>
        t.name.toLowerCase().includes(tableSearch.toLowerCase())
    );

    const filteredLogs = activeLogFilter === 'all'
        ? logs
        : logs.filter(l => l.includes(activeLogFilter.toUpperCase()));

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-6 animate-fadeIn">

            {/* ═══ Success / Error Notification ═══ */}
            {notification && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-slideDown">
                    <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border
                        ${notification.type === 'success'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-red-50 border-red-200 text-red-800'
                        }`}
                    >
                        {notification.type === 'success'
                            ? <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                            : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        }
                        <span className="font-bold text-sm">{notification.message}</span>
                        <button
                            onClick={() => setNotification(null)}
                            className="mr-2 opacity-50 hover:opacity-100 transition-opacity"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* ═══ Header ═══ */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard/settings')}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ArrowRight className="w-6 h-6 text-slate-500" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                            <Server className="w-8 h-8 text-brand-primary" />
                            إدارة خادم قاعدة البيانات
                        </h1>
                        <p className="text-slate-500">حالة الجداول، النسخ الاحتياطي، وسجلات النظام</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Tabs */}
                    <div className="flex bg-slate-100 rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2
                            ${activeTab === 'dashboard' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            لوحة التحكم
                        </button>
                        <button
                            onClick={() => setActiveTab('sql')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2
                            ${activeTab === 'sql' ? 'bg-white shadow text-brand-primary' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Terminal className="w-4 h-4" />
                            SQL Console
                        </button>
                        <button
                            onClick={() => setActiveTab('logs')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2
                            ${activeTab === 'logs' ? 'bg-white shadow text-red-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <AlertOctagon className="w-4 h-4" />
                            سجلات الأخطاء
                        </button>
                    </div>

                    <div className="h-8 w-px bg-slate-200 mx-2"></div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => { fetchOverview(); fetchLogs(); }}
                            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600"
                            title="تحديث البيانات"
                        >
                            <RefreshCw className={`w-5 h-5 ${(loadingLogs || loadingStats) ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={handleBackup}
                            disabled={backingUp || !dbUser}
                            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-all font-bold shadow-lg shadow-brand-primary/20 disabled:opacity-50 disabled:grayscale"
                        >
                            {backingUp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            نسخة احتياطية
                        </button>
                    </div>
                </div>
            </div>

            {/* ═══ TAB: SQL CONSOLE ═══ */}
            {activeTab === 'sql' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px] animate-fadeIn" dir="ltr">
                    <div className="lg:col-span-2 flex flex-col gap-4">

                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col">
                            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-brand-primary" />
                                SQL Editor
                            </h3>
                            <textarea
                                value={sqlScript}
                                onChange={(e) => setSqlScript(e.target.value)}
                                className="flex-1 w-full bg-slate-900 text-emerald-400 font-mono text-sm p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                placeholder="SELECT * FROM users WHERE..."
                                spellCheck={false}
                            />
                            <div className="mt-3 flex justify-end">
                                <button
                                    onClick={handleExecuteSql}
                                    disabled={executingSql || !sqlScript.trim()}
                                    className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                                >
                                    {executingSql ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                    تنفيذ الاستعلام
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-950 rounded-xl border border-slate-800 shadow-sm flex flex-col overflow-hidden">
                        <div className="bg-slate-900 px-4 py-3 border-b border-slate-800">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Console Output</span>
                        </div>
                        <pre className="flex-1 p-4 text-xs font-mono text-slate-300 overflow-auto whitespace-pre-wrap">
                            {sqlResult || <span className="text-slate-600 italic">Ready...</span>}
                        </pre>
                    </div>
                </div>
            )}

            {/* ═══ TAB: ERROR LOGS ═══ */}
            {activeTab === 'logs' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[600px] animate-fadeIn">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-red-600 flex items-center gap-2">
                            <AlertOctagon className="w-5 h-5" />
                            سجلات أخطاء النظام
                        </h3>
                        <button onClick={fetchErrorLogs} className="p-2 hover:bg-slate-100 rounded-lg">
                            <RefreshCw className={`w-4 h-4 text-slate-500 ${loadingErrorLogs ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-auto bg-slate-50 p-4">
                        {errorLogs.length > 0 ? (
                            <LogList logs={errorLogs} />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                                <CheckCircle2 className="w-12 h-12 mb-2" />
                                <p>سجل الأخطاء نظيف</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ═══ TAB: DASHBOARD (Existing UI) ═══ */}
            <div className={activeTab === 'dashboard' ? 'block animate-fadeIn' : 'hidden'}>

                {/* ═══ Credentials + Stats Row ═══ */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">

                    {/* Credentials - 2 cols */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-5">
                            <Shield className="w-5 h-5 text-brand-primary" />
                            <h3 className="text-sm font-bold text-slate-800">بيانات الاتصال</h3>
                            <span className="text-[10px] text-slate-400 mr-auto">مطلوب للنسخ والاستعادة</span>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-600 mb-1.5 block">اسم مستخدم قاعدة البيانات</label>
                                <div className="relative">
                                    <Server className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={dbUser}
                                        onChange={(e) => setDbUser(e.target.value)}
                                        placeholder="e.g. root"
                                        className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 transition-all font-mono"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600 mb-1.5 block">كلمة مرور قاعدة البيانات</label>
                                <div className="relative">
                                    <Activity className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={dbPassword}
                                        onChange={(e) => setDbPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats - 3 cols */}
                    <div className="lg:col-span-3 grid grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                                    <Layers className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tables</span>
                            </div>
                            <div className="text-3xl font-black text-slate-900">{overview.length}</div>
                            <div className="text-xs text-slate-500 mt-1">إجمالي جداول النظام</div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Rows</span>
                            </div>
                            <div className="text-3xl font-black text-slate-900">{totalRows.toLocaleString()}</div>
                            <div className="text-xs text-slate-500 mt-1">إجمالي السجلات المخزنة</div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                                    <HardDrive className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Storage</span>
                            </div>
                            <div className="text-3xl font-black text-slate-900">{formatSize(totalSize)}</div>
                            <div className="text-xs text-slate-500 mt-1">حجم البيانات والفهارس</div>
                        </div>
                    </div>
                </div>

                {/* ═══ Main Content ═══ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Tables List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col" style={{ maxHeight: '600px' }}>
                            <div className="p-4 border-b border-slate-100 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <Database className="w-5 h-5 text-brand-primary" />
                                        هيكل قاعدة البيانات
                                    </h2>
                                    <div className="flex items-center gap-3">
                                        {selectedTables.length > 0 && (
                                            <button
                                                onClick={() => setShowClearConfirm(true)}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                إفراغ ({selectedTables.length})
                                            </button>
                                        )}
                                        <input
                                            type="text"
                                            placeholder="بحث..."
                                            value={tableSearch}
                                            onChange={(e) => setTableSearch(e.target.value)}
                                            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-brand-primary/20"
                                        />
                                    </div>
                                </div>
                                {/* Section Selectors */}
                                <div className="flex gap-2 flex-wrap">
                                    {Object.keys(SECTIONS).map(section => (
                                        <button
                                            key={section}
                                            onClick={() => selectSection(section as keyof typeof SECTIONS)}
                                            className="px-3 py-1 text-[10px] font-bold bg-slate-50 border border-slate-200 rounded-full hover:bg-slate-100 hover:border-slate-300 transition-all text-slate-600"
                                        >
                                            {section}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="overflow-y-auto flex-1 custom-scrollbar">
                                <table className="w-full text-right">
                                    <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-4 bg-slate-50">اسم الجدول</th>
                                            <th className="px-6 py-4 bg-slate-50">السجلات</th>
                                            <th className="px-6 py-4 bg-slate-50 min-w-[180px]">الحجم</th>
                                            <th className="px-6 py-4 bg-slate-50">الملاحظات</th>
                                            <th className="px-6 py-4 bg-slate-50 text-left">الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredTables.map((table) => {
                                            const sizePercent = ((table.dataSize + table.indexSize) / maxTableSize) * 100;
                                            return (
                                                <tr key={table.name} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-6 py-4 font-bold text-slate-700 flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedTables.includes(table.name)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) setSelectedTables(p => [...p, table.name]);
                                                                else setSelectedTables(p => p.filter(t => t !== table.name));
                                                            }}
                                                            className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                                                        />
                                                        {table.name}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600 tabular-nums">{table.rows.toLocaleString()}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-brand-primary/60 rounded-full transition-all duration-700"
                                                                    style={{ width: `${Math.max(sizePercent, 2)}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs text-slate-500 font-mono w-16 text-left tabular-nums">
                                                                {formatSize(table.dataSize + table.indexSize)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-400 text-sm">{table.comment || '-'}</td>
                                                    <td className="px-6 py-4 text-left">
                                                        <button
                                                            onClick={() => fetchTableData(table.name)}
                                                            className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-brand-primary transition-all"
                                                            title="عرض البيانات"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {filteredTables.length === 0 && !loadingStats && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-14 text-center">
                                                    <Database className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                                    <p className="text-slate-400 italic text-sm">
                                                        {tableSearch ? 'لا توجد جداول مطابقة' : 'جاري تحميل سكيما قاعدة البيانات...'}
                                                    </p>
                                                </td>
                                            </tr>
                                        )}
                                        {loadingStats && overview.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-14 text-center">
                                                    <RefreshCw className="w-6 h-6 text-slate-300 mx-auto mb-2 animate-spin" />
                                                    <p className="text-slate-400 text-sm">جاري التحميل...</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Logs */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col h-[400px]">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-brand-primary" />
                                    آخر سجلات النظام
                                </h2>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setAutoRefresh(!autoRefresh)}
                                        className={`flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-bold transition-all border
                                        ${autoRefresh
                                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                                                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        <Activity className={`w-3 h-3 ${autoRefresh ? 'animate-pulse' : ''}`} />
                                        {autoRefresh ? 'مراقبة حية: تعمل' : 'مراقبة حية: متوقفة'}
                                    </button>
                                    <button
                                        onClick={() => fetchLogs()}
                                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors border border-slate-100"
                                    >
                                        <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${loadingLogs ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Log Filters */}
                            <div className="flex gap-1.5 mb-3">
                                {[
                                    { key: 'all', label: 'الكل' },
                                    { key: 'INFO', label: 'Info' },
                                    { key: 'WARN', label: 'Warn' },
                                    { key: 'ERROR', label: 'Error' },
                                ].map(f => (
                                    <button
                                        key={f.key}
                                        onClick={() => setActiveLogFilter(f.key)}
                                        className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all
                                        ${activeLogFilter === f.key
                                                ? 'bg-slate-900 text-white'
                                                : 'text-slate-500 hover:bg-slate-100'
                                            }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                                <span className="text-[9px] text-slate-400 mr-auto self-center">
                                    {filteredLogs.length} سجل
                                </span>
                            </div>

                            <div className="flex-1 bg-slate-900 rounded-xl p-3 overflow-y-auto font-mono text-[10px] leading-relaxed custom-scrollbar">
                                {loadingLogs && logs.length === 0 ? (
                                    <div className="flex items-center justify-center h-full">
                                        <RefreshCw className="w-5 h-5 text-slate-600 animate-spin" />
                                    </div>
                                ) : filteredLogs.length > 0 ? (
                                    <LogList logs={filteredLogs} />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-600">
                                        <FileText className="w-6 h-6 mb-2 opacity-50" />
                                        <span className="text-[10px]">لا توجد سجلات</span>
                                    </div>
                                )}
                                <div ref={logsEndRef} />
                            </div>
                        </div>
                    </div>

                    {/* ─── Left Sidebar: Restore + Terminal ─── */}
                    <div className="space-y-6">

                        {/* Restore Section */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Upload className="w-5 h-5 text-brand-primary" />
                                استعادة نسخة
                            </h2>

                            {/* Drop Zone */}
                            <div
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
                                transition-all mb-4 group
                                ${isDragging
                                        ? 'border-brand-primary bg-brand-primary/5 scale-[1.02]'
                                        : file
                                            ? 'border-emerald-300 bg-emerald-50/50'
                                            : 'border-slate-200 hover:border-brand-primary hover:bg-brand-primary/5'
                                    }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".sql"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                {file ? (
                                    <div className="space-y-2">
                                        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                                        <p className="text-sm font-bold text-slate-700">{file.name}</p>
                                        <p className="text-[10px] text-slate-400">{formatSize(file.size)}</p>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                            className="text-[10px] text-red-400 hover:text-red-600 font-bold transition-colors flex items-center gap-1 mx-auto"
                                        >
                                            <X className="w-3 h-3" />
                                            إزالة
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3 group-hover:text-brand-primary transition-colors" />
                                        <p className="text-sm font-medium text-slate-700">
                                            اسحب ملف SQL هنا أو انقر للاختيار
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-1">يدعم ملفات .sql فقط</p>
                                    </>
                                )}
                            </div>

                            {file && !showConfirm && !restoring && (
                                <button
                                    onClick={() => setShowConfirm(true)}
                                    disabled={!dbUser}
                                    className="w-full py-2.5 bg-red-50 text-red-600 rounded-xl font-bold
                                    hover:bg-red-100 transition-colors border border-red-100 disabled:opacity-50 disabled:grayscale
                                    flex items-center justify-center gap-2"
                                >
                                    <AlertTriangle className="w-4 h-4" />
                                    بدء عملية الاستعادة
                                </button>
                            )}

                            {restoring && (
                                <div className="w-full py-2.5 bg-slate-100 text-slate-500 rounded-xl font-bold text-center flex items-center justify-center gap-2">
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    جاري الاستعادة...
                                </div>
                            )}

                            {!dbUser && file && !showConfirm && (
                                <p className="text-[10px] text-amber-500 text-center mt-2 font-medium flex items-center justify-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    أدخل بيانات الاتصال أولاً
                                </p>
                            )}

                            {showConfirm && (
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 animate-slideUp">
                                    <div className="w-10 h-10 mx-auto mb-3 bg-red-50 rounded-xl flex items-center justify-center">
                                        <AlertTriangle className="w-5 h-5 text-red-500" />
                                    </div>
                                    <p className="text-xs text-slate-600 mb-3 text-center leading-relaxed">
                                        سيتم <span className="text-red-600 font-bold">حذف جميع البيانات</span> واستبدالها.
                                        <br />
                                        اكتب <span className="font-black text-red-600">RESTORE</span> للتأكيد
                                    </p>
                                    <input
                                        type="text"
                                        value={confirmText}
                                        onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg mb-3 text-center uppercase font-black tracking-widest focus:ring-2 focus:ring-red-100 focus:border-red-300 outline-none transition-all"
                                        placeholder="• • • • • • •"
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setShowConfirm(false); setConfirmText(''); }}
                                            className="flex-1 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                                        >
                                            تراجع
                                        </button>
                                        <button
                                            onClick={handleRestore}
                                            disabled={confirmText !== 'RESTORE'}
                                            className="flex-1 py-2 bg-red-600 text-white rounded-lg text-xs font-bold
                                            disabled:opacity-30 disabled:grayscale transition-all hover:bg-red-700"
                                        >
                                            تأكيد الاستعادة
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Terminal Output — LTR */}
                        <div
                            dir="ltr"
                            className="bg-slate-950 rounded-2xl shadow-2xl overflow-hidden"
                            style={{ minHeight: '280px' }}
                        >
                            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
                                <div className="flex items-center gap-3 text-slate-400">
                                    <div className="flex gap-1.5">
                                        <button
                                            onClick={() => setRestoreOutput('')}
                                            className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50 hover:bg-red-500/50 transition-colors"
                                            title="Clear"
                                        />
                                        <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Terminal className="w-3.5 h-3.5" />
                                        <span className="text-xs font-bold uppercase tracking-widest">System Console</span>
                                    </div>
                                </div>
                                {restoring && (
                                    <div className="flex items-center gap-2">
                                        <span className="animate-pulse bg-brand-primary w-2 h-4" />
                                        <span className="text-[10px] text-brand-primary font-mono">RUNNING</span>
                                    </div>
                                )}
                            </div>
                            <pre className="whitespace-pre-wrap text-emerald-400 h-56 overflow-y-auto custom-scrollbar p-5 font-mono text-sm leading-relaxed text-left">
                                {restoreOutput ? (
                                    <>
                                        {restoreOutput}
                                        {restoring && <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse ml-0.5" />}
                                    </>
                                ) : (
                                    <span className="text-slate-600">
                                        $ Waiting for command...
                                        {'\n'}$ _
                                    </span>
                                )}
                            </pre>
                        </div>
                    </div>
                </div> {/* End of Dashboard Tab */}

                {/* ═══ Table Data Modal ═══ */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                        <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden animate-zoomIn flex flex-col" style={{ maxHeight: '85vh' }}>
                            {/* Modal Header */}
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
                                        <Layers className="w-6 h-6 text-brand-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                            بيانات الجدول: <span className="text-brand-primary font-mono">{selectedTable}</span>
                                        </h2>
                                        <p className="text-xs text-slate-500">عرض أول 50 سجلاً من الجدول المحدد</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-auto p-0 custom-scrollbar bg-slate-50">
                                {loadingTableData ? (
                                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                                        <RefreshCw className="w-10 h-10 text-brand-primary animate-spin" />
                                        <span className="text-sm font-bold text-slate-500">جاري تحميل البيانات...</span>
                                    </div>
                                ) : tableData.length > 0 ? (
                                    <div className="p-6">
                                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                            <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '500px' }}>
                                                <table className="w-full text-left font-mono text-xs leading-relaxed border-collapse">
                                                    <thead className="bg-slate-950 text-slate-200 sticky top-0 z-10">
                                                        <tr>
                                                            <th className="px-4 py-3 border-b border-slate-800">#</th>
                                                            {Object.keys(tableData[0]).map(key => (
                                                                <th key={key} className="px-4 py-3 border-b border-slate-800 font-bold whitespace-nowrap">
                                                                    {key}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 bg-white">
                                                        {tableData.map((row, idx) => (
                                                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                                <td className="px-4 py-3 text-slate-400 border-r border-slate-100 bg-slate-50/50 sticky left-0 font-bold">
                                                                    {idx + 1}
                                                                </td>
                                                                {Object.values(row).map((val, i) => (
                                                                    <td key={i} className="px-4 py-3 text-slate-700 whitespace-nowrap">
                                                                        {val === null ? (
                                                                            <span className="text-[10px] text-slate-300 italic">NULL</span>
                                                                        ) : typeof val === 'object' ? (
                                                                            JSON.stringify(val)
                                                                        ) : (
                                                                            String(val)
                                                                        )}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                                            <Search className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-500">لا توجد بيانات متاحة في هذا الجدول</span>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 bg-brand-primary text-white rounded-xl font-bold hover:shadow-lg transition-all"
                                >
                                    إغلاق
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══ Clear Confirmation Modal ═══ */}
                {showClearConfirm && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scaleIn">
                            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-center text-slate-900 mb-2">
                                تأكيد إفراغ {selectedTables.length} جداول
                            </h3>
                            <p className="text-center text-slate-500 text-sm mb-6">
                                أنت على وشك حذف جميع البيانات من الجداول المحددة. لا يمكن التراجع عن هذا الإجراء.
                            </p>

                            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={disableFkChecks}
                                        onChange={e => setDisableFkChecks(e.target.checked)}
                                        className="mt-1 rounded border-red-300 text-red-600 focus:ring-red-500"
                                    />
                                    <div>
                                        <span className="font-bold text-red-800 text-sm block">تعطيل فحوصات المفاتيح الخارجية</span>
                                        <span className="text-red-600/80 text-xs">
                                            (SET FOREIGN_KEY_CHECKS = 0)
                                            <br />
                                            اختر هذا الخيار إذا كانت الجداول مرتبطة ببعضها البعض لتجنب أخطاء القيود.
                                        </span>
                                    </div>
                                </label>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowClearConfirm(false)}
                                    className="flex-1 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={handleClearTables}
                                    disabled={clearingData}
                                    className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {clearingData ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    تنفيذ الحذف
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default DatabaseSettingsPage;