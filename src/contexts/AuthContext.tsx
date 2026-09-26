// src/contexts/AuthContext.tsx
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

import {
    finalizeMfa as finalizeMfaService,
    getAccessToken,
    getUser,
    login as loginService,
    logout as logoutService,
    register as registerService,
    sendMfaCode as sendMfaService,
    verifyMfaToken as verifyMfaService,
    type FinalizeMfaResponse,
    type RegisterResponse,
    type SendMfaCodeResponse,
    type VerifyMfaTokenResponse
} from '../services/auth.service';
import { get as getUserFromServer } from '../services/user.service';
import { mapUserToUserDTO } from '../utils/formatters/user';

// Matches the storage key used by auth.service.ts / user.service.ts.
const USER_STORAGE_KEY = 'user';

type LoginResult = {
    message: string;
    requiresMfa: boolean;
    token?: string;
};

type AuthCtx = {
    loading: boolean;
    signedIn: boolean;
    user: any | null;
    refreshUser: () => Promise<void>;
    login: (username: string, password: string) => Promise<LoginResult>;
    register: (name: string, email: string, phone: string, password: string) => Promise<RegisterResponse>;
    verifyMfaToken: (token: string) => Promise<VerifyMfaTokenResponse>;
    sendMfaCode: (token: string, type: string) => Promise<SendMfaCodeResponse>;
    finalizeMfa: (token: string, code: string) => Promise<FinalizeMfaResponse>;
    logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [signedIn, setSignedIn] = useState(false);
    const [user, setUser] = useState<any | null>(null);

    const refreshUser = useCallback(async () => {
        // Fetches fresh data from the server (not just whatever's cached locally
        // from the last login/save) - otherwise anything changed server-side,
        // like a profile photo uploaded elsewhere, would never show up here.
        try {
            const { user: freshUser } = await getUserFromServer();
            const mapped = mapUserToUserDTO(freshUser);
            await SecureStore.setItemAsync(USER_STORAGE_KEY, JSON.stringify(mapped));
            setUser(mapped);
            return;
        } catch {
            // Offline or request failed - fall back to whatever's cached locally.
        }
        const storedUser = await getUser();
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                setUser(null);
            }
        } else {
            setUser(null);
        }
    }, []);

    // Restore tokens on app start
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const storedAccess = await getAccessToken();
                if (!alive) {
                    return;
                }
                if (storedAccess) {
                    setSignedIn(true);
                    await refreshUser();
                } else {
                    setSignedIn(false);
                    setUser(null);
                }
            } finally {
                if (alive) {
                    setLoading(false);
                }
            }
        })();
        return () => {
            alive = false;
        };
    }, [refreshUser]);

    const login = async (username: string, password: string): Promise<LoginResult> => {
        setLoading(true);
        try {
            const data = await loginService(username, password);
            // If MFA is required, we do NOT have access/refresh tokens yet
            if (data.multi_factor_authentication) {
                return {
                    message: data.message,
                    requiresMfa: true,
                    token: data.token,
                };
            }
            setSignedIn(true);
            await refreshUser();
            return {
                message: data.message,
                requiresMfa: false,
            };
        } finally {
            setLoading(false);
        }
    };

    const register = async (
        name: string,
        email: string,
        phone: string,
        password: string
    ): Promise<RegisterResponse> => {
        setLoading(true);
        try {
            return await registerService({ name, email, phone, password });
        } finally {
            setLoading(false);
        }
    };

    const logout = async (): Promise<void> => {
        setLoading(true);
        try {
            await logoutService();
            setSignedIn(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const verifyMfaToken = async (token: string): Promise<VerifyMfaTokenResponse> => {
        setLoading(true);
        try {
            return await verifyMfaService(token);
        } finally {
            setLoading(false);
        }
    };

    const sendMfaCode = async (token: string, type: string): Promise<SendMfaCodeResponse> => {
        setLoading(true);
        try {
            return await sendMfaService(token, type);
        } finally {
            setLoading(false);
        }
    };

    const finalizeMfa = async (token: string, code: string): Promise<FinalizeMfaResponse> => {
        setLoading(true);
        try {
            const data = await finalizeMfaService(token, code);
            setSignedIn(true);
            await refreshUser();
            return data;
        } finally {
            setLoading(false);
        }
    };

    const value = useMemo(
        () => ({
            loading,
            signedIn,
            user,
            refreshUser,
            login,
            register,
            logout,
            verifyMfaToken,
            sendMfaCode,
            finalizeMfa,
        }),
        [loading, signedIn, user],
    );

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
    const ctx = useContext(Ctx);
    if (!ctx) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return ctx;
}
