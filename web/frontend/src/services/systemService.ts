import apiClient from './apiClient';

export interface SystemSettingDto {
    id: number;
    settingKey: string;
    settingValue: string;
    description: string;
    category: string;
    dataType: 'String' | 'Number' | 'Boolean';
}

export const systemService = {
    getAllSettings: async () => {
        const response = await apiClient.get<{ data: SystemSettingDto[] }>('/settings');
        return response.data;
    },

    updateSetting: async (key: string, value: string) => {
        const response = await apiClient.put<{ success: boolean; data: SystemSettingDto }>(`/settings/${key}`, { value });
        return response.data;
    }
};
