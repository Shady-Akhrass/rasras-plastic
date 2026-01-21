import React from 'react';
import { 
    Warehouse as WarehouseIcon, Edit2, ChevronRight, 
    Grid3X3, Layers, Box, CheckCircle2, XCircle 
} from 'lucide-react';
import type { WarehouseDto, WarehouseLocationDto } from '../../services/warehouseService';

// --- Stat Card ---
export const StatCard: React.FC<{
    icon: React.ElementType;
    value: number;
    label: string;
    color: 'primary' | 'success' | 'warning' | 'purple';
}> = ({ icon: Icon, value, label, color }) => {
    const colorClasses = {
        primary: 'bg-brand-primary/10 text-brand-primary',
        success: 'bg-emerald-100 text-emerald-600',
        warning: 'bg-amber-100 text-amber-600',
        purple: 'bg-purple-100 text-purple-600'
    };

    return (
        <div className="bg-white p-4 rounded-xl border border-slate-100 hover:shadow-lg 
            hover:border-brand-primary/20 transition-all duration-300 group">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${colorClasses[color]} 
                    group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <div className="text-2xl font-bold text-slate-800">{value}</div>
                    <div className="text-sm text-slate-500">{label}</div>
                </div>
            </div>
        </div>
    );
};

// --- Warehouse List Card ---
export const WarehouseCard: React.FC<{
    warehouse: WarehouseDto;
    isSelected: boolean;
    onSelect: () => void;
    onEdit: () => void;
}> = ({ warehouse, isSelected, onSelect, onEdit }) => {
    const getTypeColor = (type: string) => {
        switch (type) {
            case 'MAIN': return 'bg-brand-primary/10 text-brand-primary border-brand-primary/20';
            case 'SCRAP': return 'bg-amber-50 text-amber-600 border-amber-200';
            case 'TRANSIT': return 'bg-purple-50 text-purple-600 border-purple-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'MAIN': return 'رئيسي';
            case 'SCRAP': return 'خردة';
            case 'TRANSIT': return 'عابر';
            default: return type;
        }
    };

    return (
        <div
            onClick={onSelect}
            className={`group p-4 border-b border-slate-100 cursor-pointer transition-all duration-200
                hover:bg-brand-primary/5 relative
                ${isSelected
                    ? 'bg-brand-primary/5 border-r-4 border-r-brand-primary'
                    : 'hover:border-r-4 hover:border-r-brand-primary/30'}`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center
                        transition-all duration-300 group-hover:scale-110
                        ${isSelected
                            ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30'
                            : 'bg-brand-primary/10 text-brand-primary'}`}>
                        <WarehouseIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className={`font-semibold transition-colors
                            ${isSelected ? 'text-brand-primary' : 'text-slate-800 group-hover:text-brand-primary'}`}>
                            {warehouse.warehouseNameAr}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-400 font-mono">{warehouse.warehouseCode}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getTypeColor(warehouse.warehouseType)}`}>
                                {getTypeLabel(warehouse.warehouseType)}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${warehouse.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit();
                        }}
                        className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 
                            rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className={`w-4 h-4 text-slate-300 transition-transform duration-200
                        ${isSelected ? 'rotate-90 text-brand-primary' : 'group-hover:translate-x-1'}`} />
                </div>
            </div>
        </div>
    );
};

// --- Location Row ---
export const LocationRow: React.FC<{
    location: WarehouseLocationDto;
    onEdit: () => void;
    index: number;
}> = ({ location, onEdit, index }) => (
    <tr
        className="group hover:bg-brand-primary/5 transition-colors duration-200 border-b border-slate-100 last:border-0"
        style={{
            animationDelay: `${index * 30}ms`,
            animation: 'fadeInUp 0.3s ease-out forwards'
        }}
    >
        <td className="px-6 py-4">
            <span className="inline-flex items-center px-3 py-1.5 bg-slate-100 text-slate-700 
                text-sm font-mono font-semibold rounded-lg group-hover:bg-brand-primary/10 
                group-hover:text-brand-primary transition-colors">
                {location.locationCode}
            </span>
        </td>
        <td className="px-6 py-4">
            <span className="font-medium text-slate-800">{location.locationName || '-'}</span>
        </td>
        <td className="px-6 py-4">
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg text-sm">
                    <Grid3X3 className="w-3 h-3 text-slate-400" />
                    <span className="font-mono text-slate-600">{location.row || '-'}</span>
                </div>
                <span className="text-slate-300">/</span>
                <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg text-sm">
                    <Layers className="w-3 h-3 text-slate-400" />
                    <span className="font-mono text-slate-600">{location.shelf || '-'}</span>
                </div>
                <span className="text-slate-300">/</span>
                <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg text-sm">
                    <Box className="w-3 h-3 text-slate-400" />
                    <span className="font-mono text-slate-600">{location.bin || '-'}</span>
                </div>
            </div>
        </td>
        <td className="px-6 py-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                ${location.isActive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                {location.isActive ? (
                    <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        نشط
                    </>
                ) : (
                    <>
                        <XCircle className="w-3.5 h-3.5" />
                        غير نشط
                    </>
                )}
            </span>
        </td>
        <td className="px-6 py-4">
            <button
                onClick={onEdit}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-brand-primary 
                    bg-brand-primary/10 hover:bg-brand-primary hover:text-white 
                    rounded-lg transition-all duration-200 text-sm font-medium
                    opacity-0 group-hover:opacity-100"
            >
                <Edit2 className="w-4 h-4" />
                تعديل
            </button>
        </td>
    </tr>
);