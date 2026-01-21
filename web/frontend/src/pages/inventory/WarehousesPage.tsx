import React, { useState, useEffect, useMemo } from 'react';
import {
    Building2, MapPin, Plus, Search, CheckCircle2, XCircle,
    Warehouse as WarehouseIcon, Phone, User, RefreshCw,
    Package, Layers, Grid3X3, Box, Save
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Services & Types
import type { WarehouseDto, WarehouseLocationDto } from '../../services/warehouseService';
import type { Employee } from '../../services/employeeService';
import warehouseService from '../../services/warehouseService';
import employeeService from '../../services/employeeService';

// Imported Components
import { Modal, FormInput, FormSelect, FormTextarea, ToggleSwitch } from './WarehouseForm';
import { StatCard, WarehouseCard, LocationRow } from './WarehouseList';

const WarehousesPage: React.FC = () => {
    // --- State ---
    const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseDto | null>(null);
    const [warehouseManagers, setWarehouseManagers] = useState<Employee[]>([]);
    
    // Modal States
    const [showWarehouseModal, setShowWarehouseModal] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Forms
    const [warehouseForm, setWarehouseForm] = useState<WarehouseDto>({
        warehouseCode: '',
        warehouseNameAr: '',
        warehouseNameEn: '',
        warehouseType: 'MAIN',
        address: '',
        phone: '',
        isActive: true
    });

    const [locationForm, setLocationForm] = useState<WarehouseLocationDto>({
        warehouseId: 0,
        locationCode: '',
        locationName: '',
        row: '',
        shelf: '',
        bin: '',
        isActive: true
    });

    // --- Effects & Data Fetching ---
    useEffect(() => {
        fetchWarehouses();
        fetchManagers();
    }, []);

    const fetchManagers = async () => {
        try {
            const data = await employeeService.getAllActiveList();
            setWarehouseManagers(data);
        } catch (error) {
            console.error('Failed to fetch managers', error);
        }
    };

    const fetchWarehouses = async () => {
        try {
            setIsLoading(true);
            const response = await warehouseService.getAll();
            if (response.success) {
                setWarehouses(response.data);
            }
        } catch (error) {
            toast.error('فشل في تحميل المستودعات');
        } finally {
            setIsLoading(false);
        }
    };

    // --- Handlers ---
    const handleWarehouseSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            let response;
            if (warehouseForm.id) {
                response = await warehouseService.update(warehouseForm.id, warehouseForm);
            } else {
                response = await warehouseService.create(warehouseForm);
            }

            if (response.success) {
                toast.success(
                    warehouseForm.id ? 'تم تحديث المستودع بنجاح' : 'تم إنشاء المستودع بنجاح',
                    { icon: '🎉' }
                );
                setShowWarehouseModal(false);
                fetchWarehouses();
            }
        } catch (error) {
            toast.error('حدث خطأ أثناء حفظ المستودع');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLocationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            let response;
            if (locationForm.id) {
                response = await warehouseService.updateLocation(locationForm.id, locationForm);
            } else {
                response = await warehouseService.addLocation(locationForm);
            }

            if (response.success) {
                toast.success(
                    locationForm.id ? 'تم تحديث الموقع بنجاح' : 'تم إنشاء الموقع بنجاح',
                    { icon: '🎉' }
                );
                setShowLocationModal(false);
                if (selectedWarehouse) {
                    const updatedWarehouse = await warehouseService.getById(selectedWarehouse.id!);
                    setSelectedWarehouse(updatedWarehouse.data);
                }
            }
        } catch (error) {
            toast.error('حدث خطأ أثناء حفظ الموقع');
        } finally {
            setIsSaving(false);
        }
    };

    const openWarehouseModal = (warehouse?: WarehouseDto) => {
        if (warehouse) {
            setWarehouseForm(warehouse);
        } else {
            setWarehouseForm({
                warehouseCode: '',
                warehouseNameAr: '',
                warehouseNameEn: '',
                warehouseType: 'MAIN',
                address: '',
                phone: '',
                isActive: true
            });
        }
        setShowWarehouseModal(true);
    };

    const openLocationModal = (location?: WarehouseLocationDto) => {
        if (location) {
            setLocationForm(location);
        } else {
            setLocationForm({
                warehouseId: selectedWarehouse?.id || 0,
                locationCode: '',
                locationName: '',
                row: '',
                shelf: '',
                bin: '',
                isActive: true
            });
        }
        setShowLocationModal(true);
    };

    const handleSelectWarehouse = async (warehouse: WarehouseDto) => {
        try {
            const resp = await warehouseService.getById(warehouse.id!);
            setSelectedWarehouse(resp.data);
        } catch (error) {
            toast.error('فشل في تحميل تفاصيل المستودع');
        }
    };

    // --- Computed ---
    const filteredWarehouses = useMemo(() => {
        return warehouses.filter(w =>
            w.warehouseNameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
            w.warehouseCode.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [warehouses, searchTerm]);

    const stats = useMemo(() => ({
        total: warehouses.length,
        active: warehouses.filter(w => w.isActive).length,
        main: warehouses.filter(w => w.warehouseType === 'MAIN').length,
        locations: selectedWarehouse?.locations?.length || 0
    }), [warehouses, selectedWarehouse]);

    // --- Render ---
    return (
        <div className="space-y-6">
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {/* Header Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 rounded-3xl p-8 text-white">
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
                <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-white/20 rounded-full animate-pulse" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                            <WarehouseIcon className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">إدارة المستودعات</h1>
                            <p className="text-white/70 text-lg">إدارة المستودعات ومواقع التخزين</p>
                        </div>
                    </div>

                    <button
                        onClick={() => openWarehouseModal()}
                        className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-brand-primary 
                            rounded-xl font-bold hover:bg-white/90 transition-all duration-300
                            shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5"
                    >
                        <Plus className="w-5 h-5" />
                        <span>إضافة مستودع</span>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={WarehouseIcon} value={stats.total} label="إجمالي المستودعات" color="primary" />
                <StatCard icon={CheckCircle2} value={stats.active} label="مستودع نشط" color="success" />
                <StatCard icon={Building2} value={stats.main} label="مستودع رئيسي" color="purple" />
                <StatCard icon={MapPin} value={stats.locations} label="موقع تخزين" color="warning" />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Warehouse List */}
                <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {/* Search Header */}
                    <div className="p-4 border-b border-slate-100">
                        <div className="relative">
                            <Search className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200
                                ${isSearchFocused ? 'text-brand-primary' : 'text-slate-400'}`} />
                            <input
                                type="text"
                                placeholder="بحث في المستودعات..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                                className={`w-full pr-12 pl-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none bg-slate-50
                                    ${isSearchFocused
                                        ? 'border-brand-primary bg-white shadow-lg shadow-brand-primary/10'
                                        : 'border-transparent hover:border-slate-200'}`}
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <XCircle className="w-4 h-4 text-slate-400" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Warehouse Items */}
                    <div className="overflow-y-auto max-h-[calc(100vh-400px)]">
                        {isLoading ? (
                            [...Array(5)].map((_, i) => (
                                <div key={i} className="p-4 border-b border-slate-100 animate-pulse">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-slate-200" />
                                        <div className="flex-1">
                                            <div className="h-4 w-32 bg-slate-200 rounded mb-2" />
                                            <div className="h-3 w-24 bg-slate-100 rounded" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : filteredWarehouses.length > 0 ? (
                            filteredWarehouses.map((warehouse) => (
                                <WarehouseCard
                                    key={warehouse.id}
                                    warehouse={warehouse}
                                    isSelected={selectedWarehouse?.id === warehouse.id}
                                    onSelect={() => handleSelectWarehouse(warehouse)}
                                    onEdit={() => openWarehouseModal(warehouse)}
                                />
                            ))
                        ) : (
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                                    <Search className="w-8 h-8 text-slate-400" />
                                </div>
                                <p className="text-slate-500">لا توجد مستودعات</p>
                            </div>
                        )}
                    </div>

                    {/* Refresh Button */}
                    <div className="p-4 border-t border-slate-100">
                        <button
                            onClick={fetchWarehouses}
                            disabled={isLoading}
                            className="w-full py-2.5 text-brand-primary font-medium hover:bg-brand-primary/5 
                                rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            تحديث القائمة
                        </button>
                    </div>
                </div>

                {/* Selected Warehouse Details */}
                <div className="lg:col-span-2 space-y-6">
                    {selectedWarehouse ? (
                        <>
                            {/* Warehouse Header Card */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-primary/80 
                                            rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-primary/30">
                                            <WarehouseIcon className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-900 mb-1">{selectedWarehouse.warehouseNameAr}</h2>
                                            <p className="text-slate-500 mb-2" dir="ltr">{selectedWarehouse.warehouseNameEn}</p>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 
                                                    bg-brand-primary/10 text-brand-primary text-sm font-semibold rounded-full">
                                                    <Building2 className="w-3.5 h-3.5" />
                                                    {selectedWarehouse.warehouseType === 'MAIN' ? 'رئيسي' :
                                                        selectedWarehouse.warehouseType === 'SCRAP' ? 'خردة' : 'عابر'}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 
                                                    bg-slate-100 text-slate-600 text-sm font-mono rounded-full">
                                                    {selectedWarehouse.warehouseCode}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold
                                        ${selectedWarehouse.isActive
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                                        {selectedWarehouse.isActive ? (
                                            <><CheckCircle2 className="w-4 h-4" /> نشط</>
                                        ) : (
                                            <><XCircle className="w-4 h-4" /> غير نشط</>
                                        )}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                        <div className="p-2 bg-white rounded-lg shadow-sm"><MapPin className="w-5 h-5 text-brand-primary" /></div>
                                        <div><p className="text-xs text-slate-500">العنوان</p><p className="font-medium text-slate-800">{selectedWarehouse.address || 'غير محدد'}</p></div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                        <div className="p-2 bg-white rounded-lg shadow-sm"><Phone className="w-5 h-5 text-brand-primary" /></div>
                                        <div><p className="text-xs text-slate-500">الهاتف</p><p className="font-medium text-slate-800" dir="ltr">{selectedWarehouse.phone || 'غير محدد'}</p></div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                        <div className="p-2 bg-white rounded-lg shadow-sm"><User className="w-5 h-5 text-brand-primary" /></div>
                                        <div>
                                            <p className="text-xs text-slate-500">المدير</p>
                                            <div className="flex flex-col">
                                                <p className="font-medium text-slate-800">{selectedWarehouse.managerName || 'غير محدد'}</p>
                                                {selectedWarehouse.managerDepartmentName && <p className="text-xs text-slate-500 font-readex">{selectedWarehouse.managerDepartmentName}</p>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                        <div className="p-2 bg-white rounded-lg shadow-sm"><Layers className="w-5 h-5 text-brand-primary" /></div>
                                        <div><p className="text-xs text-slate-500">عدد المواقع</p><p className="font-medium text-slate-800">{selectedWarehouse.locations?.length || 0} موقع</p></div>
                                    </div>
                                </div>
                            </div>

                            {/* Locations Section */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-brand-primary/10 rounded-lg"><MapPin className="w-5 h-5 text-brand-primary" /></div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">مواقع التخزين</h3>
                                            <p className="text-sm text-slate-500">{selectedWarehouse.locations?.length || 0} موقع</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => openLocationModal()}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white 
                                            rounded-xl font-medium hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/20"
                                    >
                                        <Plus className="w-4 h-4" /> إضافة موقع
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-100">
                                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">الكود</th>
                                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">الاسم</th>
                                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">المكان (صف/رف/وعاء)</th>
                                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">الحالة</th>
                                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">الإجراءات</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedWarehouse.locations && selectedWarehouse.locations.length > 0 ? (
                                                selectedWarehouse.locations.map((location, index) => (
                                                    <LocationRow
                                                        key={location.id}
                                                        location={location}
                                                        onEdit={() => openLocationModal(location)}
                                                        index={index}
                                                    />
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-16 text-center">
                                                        <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                                                            <MapPin className="w-8 h-8 text-slate-400" />
                                                        </div>
                                                        <p className="text-slate-500 mb-4">لا توجد مواقع تخزين</p>
                                                        <button onClick={() => openLocationModal()} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-xl font-medium hover:bg-brand-primary/90 transition-colors">
                                                            <Plus className="w-4 h-4" /> إضافة موقع جديد
                                                        </button>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-white rounded-2xl border-2 border-dashed border-slate-200 p-16">
                            <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
                                <WarehouseIcon className="w-12 h-12 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-700 mb-2">اختر مستودعاً</h3>
                            <p className="text-slate-500 text-center max-w-md">اختر مستودعاً من القائمة لعرض التفاصيل ومواقع التخزين</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Warehouse Modal */}
            <Modal
                isOpen={showWarehouseModal}
                onClose={() => setShowWarehouseModal(false)}
                title={warehouseForm.id ? 'تعديل مستودع' : 'إضافة مستودع جديد'}
                size="lg"
            >
                <form onSubmit={handleWarehouseSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="كود المستودع"
                            value={warehouseForm.warehouseCode}
                            onChange={(value) => setWarehouseForm({ ...warehouseForm, warehouseCode: value })}
                            icon={Package}
                            placeholder="WH-001"
                            required
                        />
                        <FormSelect
                            label="نوع المستودع"
                            value={warehouseForm.warehouseType}
                            onChange={(value) => setWarehouseForm({ ...warehouseForm, warehouseType: value })}
                            icon={Building2}
                            options={[
                                { value: 'MAIN', label: 'رئيسي (Main)' },
                                { value: 'SCRAP', label: 'خردة (Scrap)' },
                                { value: 'TRANSIT', label: 'عابر (Transit)' }
                            ]}
                        />
                    </div>

                    <FormInput
                        label="الاسم (عربي)"
                        value={warehouseForm.warehouseNameAr}
                        onChange={(value) => setWarehouseForm({ ...warehouseForm, warehouseNameAr: value })}
                        icon={WarehouseIcon}
                        placeholder="المستودع الرئيسي"
                        required
                    />

                    <FormInput
                        label="الاسم (إنجليزي)"
                        value={warehouseForm.warehouseNameEn || ''}
                        onChange={(value) => setWarehouseForm({ ...warehouseForm, warehouseNameEn: value })}
                        icon={WarehouseIcon}
                        placeholder="Main Warehouse"
                        dir="ltr"
                    />

                    <FormSelect
                        label="مدير المستودع"
                        value={warehouseForm.managerId?.toString() || ''}
                        onChange={(value) => setWarehouseForm({ ...warehouseForm, managerId: value ? parseInt(value) : undefined })}
                        icon={User}
                        options={[
                            { value: '', label: 'اختر مديراً...' },
                            ...warehouseManagers.map(m => ({
                                value: m.employeeId.toString(),
                                label: `${m.fullNameAr} - ${m.departmentNameAr} (${m.employeeCode})`
                            }))
                        ]}
                    />

                    <FormTextarea
                        label="العنوان"
                        value={warehouseForm.address || ''}
                        onChange={(value) => setWarehouseForm({ ...warehouseForm, address: value })}
                        icon={MapPin}
                        placeholder="عنوان المستودع"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="الهاتف"
                            value={warehouseForm.phone || ''}
                            onChange={(value) => setWarehouseForm({ ...warehouseForm, phone: value })}
                            icon={Phone}
                            placeholder="+20 xxx xxx xxxx"
                            dir="ltr"
                        />
                        <div className="flex items-end">
                            <ToggleSwitch
                                label="مستودع نشط"
                                checked={warehouseForm.isActive}
                                onChange={(checked) => setWarehouseForm({ ...warehouseForm, isActive: checked })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 py-3 bg-brand-primary text-white rounded-xl font-bold 
                                hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20
                                disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            حفظ المستودع
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowWarehouseModal(false)}
                            className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl 
                                font-medium hover:bg-slate-50 transition-colors"
                        >
                            إلغاء
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Location Modal */}
            <Modal
                isOpen={showLocationModal}
                onClose={() => setShowLocationModal(false)}
                title={locationForm.id ? 'تعديل موقع تخزين' : 'إضافة موقع تخزين جديد'}
                size="md"
            >
                <form onSubmit={handleLocationSubmit} className="space-y-6">
                    <FormInput
                        label="كود الموقع"
                        value={locationForm.locationCode}
                        onChange={(value) => setLocationForm({ ...locationForm, locationCode: value })}
                        icon={Package}
                        placeholder="A-01-01"
                        required
                    />
                    <FormInput
                        label="اسم الموقع"
                        value={locationForm.locationName || ''}
                        onChange={(value) => setLocationForm({ ...locationForm, locationName: value })}
                        icon={MapPin}
                        placeholder="الموقع الأول"
                    />
                    <div className="grid grid-cols-3 gap-4">
                        <FormInput
                            label="الصف (Row)"
                            value={locationForm.row || ''}
                            onChange={(value) => setLocationForm({ ...locationForm, row: value })}
                            icon={Grid3X3}
                            placeholder="A"
                        />
                        <FormInput
                            label="الرف (Shelf)"
                            value={locationForm.shelf || ''}
                            onChange={(value) => setLocationForm({ ...locationForm, shelf: value })}
                            icon={Layers}
                            placeholder="01"
                        />
                        <FormInput
                            label="الوعاء (Bin)"
                            value={locationForm.bin || ''}
                            onChange={(value) => setLocationForm({ ...locationForm, bin: value })}
                            icon={Box}
                            placeholder="01"
                        />
                    </div>
                    <ToggleSwitch
                        label="موقع نشط"
                        checked={locationForm.isActive}
                        onChange={(checked) => setLocationForm({ ...locationForm, isActive: checked })}
                    />
                    <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 py-3 bg-brand-primary text-white rounded-xl font-bold 
                                hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20
                                disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            حفظ الموقع
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowLocationModal(false)}
                            className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl 
                                font-medium hover:bg-slate-50 transition-colors"
                        >
                            إلغاء
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default WarehousesPage;