import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Ruler, X } from 'lucide-react';
import { unitService, type UnitDto } from '../../services/unitService';
import ConfirmModal from '../../components/common/ConfirmModal';

const UnitsPage: React.FC = () => {
    const [units, setUnits] = useState<UnitDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingUnit, setEditingUnit] = useState<UnitDto | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [unitToDelete, setUnitToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Form Stats
    const [formData, setFormData] = useState<UnitDto>({
        unitCode: '',
        unitNameAr: '',
        unitNameEn: '',
        isBaseUnit: true,
        conversionFactor: 1,
        isActive: true
    });

    useEffect(() => {
        fetchUnits();
    }, []);

    const fetchUnits = async () => {
        try {
            setLoading(true);
            const data = await unitService.getAllUnits();
            if (data.data) {
                setUnits(data.data as any); // Type assertion if needed, or better, unitService returns {data: UnitDto[]}
            } else if (Array.isArray(data)) {
                setUnits(data);
            }
        } catch (error) {
            console.error('Error fetching units:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSuccess = (msg: string) => {
        setSuccessMessage(msg);
        fetchUnits();
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (editingUnit?.id) {
                await unitService.updateUnit(editingUnit.id, formData);
                handleSuccess('تم تحديث الوحدة بنجاح');
            } else {
                await unitService.createUnit(formData);
                handleSuccess('تم إضافة الوحدة بنجاح');
            }
            setShowModal(false);
            resetForm();
        } catch (error: any) {
            console.error('Error saving unit:', error);
            alert(error.response?.data?.message || 'فشل حفظ الوحدة');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (id: number) => {
        setUnitToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!unitToDelete) return;

        setIsDeleting(true);
        try {
            await unitService.deleteUnit(unitToDelete);
            handleSuccess('تم حذف الوحدة بنجاح');
            setIsDeleteModalOpen(false);
            setUnitToDelete(null);
        } catch (error: any) {
            console.error('Error deleting unit:', error);
            alert(error.response?.data?.message || 'فشل حذف الوحدة');
        } finally {
            setIsDeleting(false);
        }
    };

    const openEditModal = (unit: UnitDto) => {
        setEditingUnit(unit);
        setFormData(unit);
        setShowModal(true);
    };

    const resetForm = () => {
        setEditingUnit(null);
        setFormData({
            unitCode: '',
            unitNameAr: '',
            unitNameEn: '',
            isBaseUnit: true,
            conversionFactor: 1,
            isActive: true
        });
    };

    const filteredUnits = units.filter(unit =>
        unit.isActive &&
        (
            unit.unitNameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
            unit.unitCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (unit.unitNameEn && unit.unitNameEn.toLowerCase().includes(searchTerm.toLowerCase()))
        )
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 font-readex">وحدات القياس</h1>
                    <p className="text-slate-500 mt-1 font-readex">إدارة وحدات القياس والتحويلات</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="bg-brand-primary text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/20"
                >
                    <Plus className="w-5 h-5" />
                    <span className="font-readex font-medium">إضافة وحدة</span>
                </button>
            </div>

            {successMessage && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-6 py-4 rounded-xl flex justify-between items-center animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                            <Plus className="w-4 h-4" />
                        </div>
                        <span className="font-bold">{successMessage}</span>
                    </div>
                    <button onClick={() => setSuccessMessage('')} className="text-emerald-400 hover:text-emerald-600 transition-colors">
                        إغلاق
                    </button>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="بحث في الوحدات..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl pr-10 pl-4 py-2 text-sm focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider font-readex">الكود</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider font-readex">الاسم العربي</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider font-readex">الاسم الإنجليزي</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider font-readex">النوع</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider font-readex">معامل التحويل</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider font-readex">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUnits.map((unit) => (
                                <tr key={unit.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{unit.unitCode}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{unit.unitNameAr}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{unit.unitNameEn}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${unit.isBaseUnit ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {unit.isBaseUnit ? 'وحدة أساسية' : 'وحدة فرعية'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-mono">
                                        {unit.isBaseUnit ? '1.000' : unit.conversionFactor}
                                        {!unit.isBaseUnit && unit.baseUnitName && <span className="text-slate-400 text-xs mr-1">({unit.baseUnitName})</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap flex justify-center gap-2">
                                        <button
                                            onClick={() => openEditModal(unit)}
                                            className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => unit.id && handleDeleteClick(unit.id)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredUnits.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <Ruler className="w-12 h-12 text-slate-200 mb-3" />
                                            <p>لا توجد وحدات قياس مطابقة</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 className="text-lg font-bold text-slate-900 font-readex">
                                {editingUnit ? 'تعديل وحدة' : 'إضافة وحدة جديدة'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700">الكود *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.unitCode}
                                        onChange={e => setFormData({ ...formData, unitCode: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none"
                                        placeholder="EX: KG"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700">النوع</label>
                                    <select
                                        value={formData.isBaseUnit ? 'true' : 'false'}
                                        onChange={e => setFormData({ ...formData, isBaseUnit: e.target.value === 'true', conversionFactor: e.target.value === 'true' ? 1 : formData.conversionFactor })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white"
                                    >
                                        <option value="true">وحدة أساسية</option>
                                        <option value="false">وحدة فرعية</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700">الاسم العربي *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.unitNameAr}
                                    onChange={e => setFormData({ ...formData, unitNameAr: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none"
                                    placeholder="مثال: كيلوجرام"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700">الاسم الإنجليزي</label>
                                <input
                                    type="text"
                                    value={formData.unitNameEn}
                                    onChange={e => setFormData({ ...formData, unitNameEn: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none"
                                    placeholder="Ex: Kilogram"
                                    dir="ltr"
                                />
                            </div>

                            {!formData.isBaseUnit && (
                                <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                                    <label className="block text-sm font-medium text-slate-700">معامل التحويل (بالنسبة للوحدة الأساسية)</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            step="0.000001"
                                            value={formData.conversionFactor}
                                            onChange={e => setFormData({ ...formData, conversionFactor: parseFloat(e.target.value) })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none"
                                        />
                                        <select
                                            value={formData.baseUnitId || ''}
                                            onChange={e => setFormData({ ...formData, baseUnitId: parseInt(e.target.value) })}
                                            className="w-1/3 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white"
                                            required={!formData.isBaseUnit}
                                        >
                                            <option value="">اختر الوحدة</option>
                                            {units.filter(u => u.isBaseUnit && u.isActive).map(u => (
                                                <option key={u.id} value={u.id}>{u.unitNameAr}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <p className="text-xs text-slate-500">مثال: الطن = 1000 * كحيلوجرام</p>
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-medium"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-brand-primary text-white hover:bg-brand-primary/90 rounded-xl transition-colors font-medium flex justify-center items-center gap-2 shadow-lg shadow-brand-primary/20"
                                >
                                    {loading ? 'جاري الحفظ...' : (editingUnit ? 'حفظ التعديلات' : 'إضافة الوحدة')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="حذف وحدة قياس"
                message="هل أنت متأكد من حذف هذه الوحدة؟ سيتم حذفها نهائياً ولا يمكن التراجع عن هذا الإجراء."
                confirmText="حذف"
                cancelText="إلغاء"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setIsDeleteModalOpen(false)}
                isLoading={isDeleting}
                variant="danger"
            />
        </div>
    );
};

export default UnitsPage;
