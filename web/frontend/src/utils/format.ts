/**
 * Utility functions for formatting dates, numbers, and times
 * All formatting is done in Arabic locale (ar-SA/ar-EG) for consistency
 */

/**
 * Formats a date value into an Arabic locale string
 * @param date - The date to format (string or Date object)
 * @param options - Intl.DateTimeFormat options for customizing the output
 * @returns Formatted date string in Arabic locale
 */
export function formatDate(
    date: string | Date | null | undefined,
    options?: Intl.DateTimeFormatOptions
): string {
    if (!date) return '—';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
        return '—';
    }

    const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        numberingSystem: 'latn', // Use Western Arabic numerals (0-9) instead of Eastern Arabic (٠-٩)
        ...options
    };

    return new Intl.DateTimeFormat('ar-SA', defaultOptions).format(dateObj);
}

/**
 * Formats a time value into an Arabic locale string
 * @param date - The date/time to format (string or Date object)
 * @param options - Intl.DateTimeFormat options for customizing the output
 * @returns Formatted time string in Arabic locale
 */
export function formatTime(
    date: string | Date | null | undefined,
    options?: Intl.DateTimeFormatOptions
): string {
    if (!date) return '—';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
        return '—';
    }

    const defaultOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        numberingSystem: 'latn', // Use Western Arabic numerals (0-9) instead of Eastern Arabic (٠-٩)
        ...options
    };

    return new Intl.DateTimeFormat('ar-SA', defaultOptions).format(dateObj);
}

/**
 * Formats a number value into an Arabic locale string
 * @param value - The number to format
 * @param options - Intl.NumberFormat options for customizing the output
 * @returns Formatted number string in Arabic locale
 */
export function formatNumber(
    value: number | null | undefined,
    options?: Intl.NumberFormatOptions
): string {
    if (value === null || value === undefined) return '0';

    const defaultOptions: Intl.NumberFormatOptions = {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
        numberingSystem: 'latn', // Use Western Arabic numerals (0-9) instead of Eastern Arabic (٠-٩)
        ...options
    };

    return new Intl.NumberFormat('ar-SA', defaultOptions).format(value);
}