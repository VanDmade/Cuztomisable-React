import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import { createTheme, Theme, ThemeOverrides } from '../theme/theme';

type AppearanceMode = 'default' | 'light' | 'dark';

type ThemeProviderProps = {
    overrides?: ThemeOverrides;
    children: React.ReactNode;
};

type ThemeContextValue = Theme & {
    appearance: AppearanceMode;
    setAppearance: (mode: AppearanceMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const APPEARANCE_KEY = 'app_appearance';

export const ThemeProvider = ({
    overrides = {},
    children,
}: ThemeProviderProps) => {
    const systemTheme = Appearance.getColorScheme();

    const [appearance, setAppearanceState] = useState<AppearanceMode>('default');
    const [loaded, setLoaded] = useState(false);

    // 🔥 Load persisted value
    useEffect(() => {
        (async () => {
            try {
                const stored = await SecureStore.getItemAsync(APPEARANCE_KEY);
                if (stored === 'light' || stored === 'dark' || stored === 'default') {
                    setAppearanceState(stored);
                }
            } catch {}
            setLoaded(true);
        })();
    }, []);

    // 🔥 Persist on change
    const setAppearance = async (mode: AppearanceMode) => {
        setAppearanceState(mode);
        try {
            await SecureStore.setItemAsync(APPEARANCE_KEY, mode);
        } catch {}
    };

    const mode = useMemo<'light' | 'dark'>(() => {
        if (appearance === 'light' || appearance === 'dark') {
            return appearance;
        }
        return (systemTheme as 'light' | 'dark') || 'light';
    }, [appearance, systemTheme]);

    const theme = useMemo(() => {
        return createTheme(mode, overrides);
    }, [mode, overrides]);

    // 🔥 Prevent flicker before loading stored preference
    if (!loaded) {
        return null;
    }

    return (
        <ThemeContext.Provider
            value={{
                ...theme,
                appearance,
                setAppearance,
            }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextValue => {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return ctx;
};