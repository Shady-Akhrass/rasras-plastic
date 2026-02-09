/**
 * توحيد عرض الأرقام في النظام بالإنجليزي (0-9)
 * Use these helpers so all numbers display in Western numerals across the app.
 */

const EN_LOCALE = 'en-US';

/**
 * Format number with English numerals (0-9). Use instead of toLocaleString('ar-EG') or toLocaleString().
 */
export function formatNumber(
    value: number | null | undefined,
    options?: Intl.NumberFormatOptions
): string {
    if (value == null || Number.isNaN(value)) return '—';
    return new Intl.NumberFormat(EN_LOCALE, options).format(value);
}

/**
 * Format date: Arabic text (e.g. شهر) but English numerals (0-9) via numberingSystem: 'latn'.
 * Use instead of toLocaleDateString('ar-EG') when you want Arabic locale with English digits.
 */
export function formatDate(
    value: Date | string | null | undefined,
    options?: Intl.DateTimeFormatOptions
): string {
    if (value == null) return '—';
    const date = typeof value === 'string' ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('ar-EG', {
        numberingSystem: 'latn',
        ...options,
    }).format(date);
}

/**
 * Format time with English numerals (0-9).
 */
export function formatTime(
    value: Date | string | null | undefined,
    options?: Intl.DateTimeFormatOptions
): string {
    if (value == null) return '—';
    const date = typeof value === 'string' ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('ar-EG', {
        numberingSystem: 'latn',
        hour: '2-digit',
        minute: '2-digit',
        ...options,
    }).format(date);
}
