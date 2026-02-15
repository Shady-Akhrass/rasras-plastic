import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Database, Upload, FileText,
    RefreshCw, ArrowRight, Download,
    Activity, HardDrive, Layers, Server,
    Search, Eye, EyeOff, AlertTriangle,
    CheckCircle2, Terminal, X, Shield, XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
                        <span className="opacity-50 select-none mr-2 w-6 text-right flex-shrink-0 text-[9px] mt-0.5">
                            {String(index + 1).padStart(3, '0')}
                        </span>
                        <span className="break-all">{log}</span>
                    </div>
                );
            })}
        </div>
    );
});

const DatabaseSettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState<File | null>(null);
    const [restoring, setRestoring] = useState(false);
    const [backingUp, setBackingUp] = useState(false);
    const [restoreOutput, setRestoreOutput] = useState<string>('');
    const [confirmText, setConfirmText] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [tableSearch, setTableSearch] = useState('');
    const [activeLogFilter, setActiveLogFilter] = useState<string>('all');

    // Notification state
    const [notification, setNotification] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);

    const [dbUser, setDbUser] = useState('');
    const [dbPassword, setDbPassword] = useState('');

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
            const response = await fetch('/api/settings/database/restore', {
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
                `/api/settings/database/backup?dbUser=${encodeURIComponent(dbUser)}&dbPassword=${encodeURIComponent(dbPassword)}`,
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

    const fetchOverview = async () => {
        setLoadingStats(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/settings/database/overview', {
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

    const fetchLogs = async () => {
        setLoadingLogs(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/settings/database/logs?lines=200', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) setLogs(data.data);
        } catch (error) {
            console.error('Failed to fetch logs', error);
        } finally {
            setLoadingLogs(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        fetchOverview();
    }, []);

    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

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
            <div className="flex items-center justify-between mb-8">
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
                <div className="flex gap-3">
                    <button
                        onClick={() => { fetchOverview(); fetchLogs(); }}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 font-medium"
                    >
                        <RefreshCw className={`w-4 h-4 ${(loadingLogs || loadingStats) ? 'animate-spin' : ''}`} />
                        تحديث البيانات
                    </button>
                    <button
                        onClick={handleBackup}
                        disabled={backingUp || !dbUser}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90 transition-all font-bold shadow-lg shadow-brand-primary/20 disabled:opacity-50 disabled:grayscale"
                    >
                        {backingUp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        تحميل نسخة احتياطية
                    </button>
                </div>
            </div>

            {/* ═══ Credentials + Stats Row ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

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

                {/* ─── Right: Tables + Logs (2 cols) ─── */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Table Structure — scrollable */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col" style={{ maxHeight: '520px' }}>
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-3 flex-shrink-0">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Database className="w-5 h-5 text-brand-primary" />
                                هيكل قاعدة البيانات
                                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold mr-1">
                                    {filteredTables.length}
                                </span>
                            </h2>
                            <div className="relative">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="بحث في الجداول..."
                                    value={tableSearch}
                                    onChange={(e) => setTableSearch(e.target.value)}
                                    className="pl-4 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none w-44"
                                />
                            </div>
                        </div>

                        {/* Scrollable table body */}
                        <div className="overflow-y-auto overflow-x-auto flex-1 custom-scrollbar">
                            <table className="w-full text-right">
                                <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-4 bg-slate-50">اسم الجدول</th>
                                        <th className="px-6 py-4 bg-slate-50">السجلات</th>
                                        <th className="px-6 py-4 bg-slate-50 min-w-[180px]">الحجم</th>
                                        <th className="px-6 py-4 bg-slate-50">الملاحظات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredTables.map((table) => {
                                        const sizePercent = ((table.dataSize + table.indexSize) / maxTableSize) * 100;
                                        return (
                                            <tr key={table.name} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-slate-700">{table.name}</td>
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
                                            </tr>
                                        );
                                    })}
                                    {filteredTables.length === 0 && !loadingStats && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-14 text-center">
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
                            <button
                                onClick={fetchLogs}
                                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${loadingLogs ? 'animate-spin' : ''}`} />
                            </button>
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
            </div>
        </div>
    );
};

export default DatabaseSettingsPage;