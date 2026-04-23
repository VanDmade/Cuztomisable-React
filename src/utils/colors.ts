// src/utils/colors.ts

export const getContrastTextColor = (backgroundColor?: string): string => {
    if (!backgroundColor) {
        return '#fff';
    }
    const hex = backgroundColor.replace('#', '');
    const normalizedHex = hex.length === 3 ? hex.split('').map((char) => char + char).join('') : hex;
    const r = parseInt(normalizedHex.substring(0, 2), 16);
    const g = parseInt(normalizedHex.substring(2, 4), 16);
    const b = parseInt(normalizedHex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155 ? '#111' : '#fff';
};