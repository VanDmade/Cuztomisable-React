// src/theme/colors.ts

export type ThemeMode = 'light' | 'dark';

export const color = {
    light: {
        primary: '#F97316',
        secondary: '#9A3412',
        accent: '#FB923C',
        ternary: '#3B82F6',
        danger: '#C62828',
        success: '#4CAF50',
        info: '#0284C7',
        warning: '#DC6A00',
        light: '#FFF8F3',
        background: '#FFFFFF',
        surface: '#FFFFFF',
        text: '#1A1A1A',
        muted: '#141111',
        white: '#FFFFFF',
        border: '#E6E6E6',
        link: '#0A66C2',
        buttonTextColor: '#F1F1F1',
        buttonTextColorInverse: '#1A1A1A',
        buttonText: {
            primary: '#FFFFFF',
            secondary: '#FFFFFF',
            accent: '#1A1A1A',
            ternary: '#FFFFFF',
            danger: '#FFFFFF',
            success: '#FFFFFF',
            info: '#FFFFFF',
            warning: '#1A1A1A',
        },
    },
    dark: {
        primary: '#F97316',
        secondary: '#FB923C',
        accent: '#FFB777',
        ternary: '#4A2A1C',
        danger: '#EF5350',
        success: '#81C784',
        info: '#29B6F6',
        warning: '#FFB74D',
        light: '#2A2A2A',
        background: '#121212',
        surface: '#1E1E1E',
        text: '#F1F1F1',
        muted: '#6B6B6B',
        white: '#FFFFFF',
        border: '#3A3A3A',
        link: '#64B5F6',
        buttonTextColor: '#1A1A1A',
        buttonTextColorInverse: '#F1F1F1',
        buttonText: {
            primary: '#1A1A1A',
            secondary: '#FFFFFF',
            accent: '#1A1A1A',
            ternary: '#FFFFFF',
            danger: '#FFFFFF',
            success: '#1A1A1A',
            info: '#1A1A1A',
            warning: '#1A1A1A',
        },
    },
};

// ✅ Safer type (does NOT depend on getColor)
export type Color = typeof color.light;