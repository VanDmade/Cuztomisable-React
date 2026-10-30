// src/services/auth.service.ts
import * as SecureStore from 'expo-secure-store';
import { getApi as api } from '../api/api';

import { mapUserToUserDTO } from '../utils/formatters/user';

const ACCESS_TOKEN = 'access_token';
const REFRESH_TOKEN = 'refresh_token';
const USER = 'user';

// Response types
export type LoginResponse = {
    message: string;
    multi_factor_authentication: boolean;
    access_token?: string;
    refresh_token?: string;
    user?: any;
    token?: string; // MFA token if MFA is required
};

export type RegisterResponse = {
    message: string;
    user?: any;
};

export type VerifyMfaTokenResponse = {
    message: string;
    email: string | null;
    phone: string | null;
};

export type SendMfaCodeResponse = {
    message: string;
};

export type FinalizeMfaResponse = {
    message: string;
    access_token: string;
    refresh_token: string;
    user: any;
};

export type RefreshResponse = {
    accessToken: string;
    refreshToken: string;
};

export async function login(username: string, password: string): Promise<LoginResponse> {
    const { data } = await api().post('login', { username, password });
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid response from server');
    }
    // If MFA is not required, store tokens
    if (!data.multi_factor_authentication) {
        if (!data.access_token || !data.refresh_token || !data.user) {
            throw new Error('Server did not return required authentication data');
        }
        await SecureStore.setItemAsync(ACCESS_TOKEN, data.access_token);
        await SecureStore.setItemAsync(REFRESH_TOKEN, data.refresh_token);
        await SecureStore.setItemAsync(USER, JSON.stringify(mapUserToUserDTO(data.user)));
    }
    return {
        message: data.message ?? 'Login successful',
        multi_factor_authentication: data.multi_factor_authentication ?? false,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        user: data.user,
        token: data.token, // MFA token if needed
    };
}

export async function register(payload: {
    email: string;
    password: string;
    name?: string;
    phone: string;
    country_code?: string;
}): Promise<RegisterResponse> {
    const { data } = await api().post('/register', payload);
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid response from server');
    }
    return {
        message: data.message ?? 'Registration successful',
        user: data.user,
    };
}

export async function verifyMfaToken(token: string): Promise<VerifyMfaTokenResponse> {
    const { data } = await api().get(`login/mfa/${encodeURIComponent(token)}/verify`);
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid response from server');
    }
    return {
        message: data.message ?? 'Token verified',
        email: data.email ?? null,
        phone: data.phone ?? null,
    };
}

export async function sendMfaCode(token: string, type: string): Promise<SendMfaCodeResponse> {
    const { data } = await api().post(`login/mfa/${encodeURIComponent(token)}/send`, { type });
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid response from server');
    }
    return {
        message: data.message ?? 'Code sent successfully',
    };
}

export async function finalizeMfa(token: string, code: string): Promise<FinalizeMfaResponse> {
    const { data } = await api().post(`login/mfa/${encodeURIComponent(token)}`, {
        code,
        remember: 0,
    });
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid response from server');
    }
    if (!data.access_token || !data.refresh_token || !data.user) {
        throw new Error('Server did not return required authentication data');
    }
    await SecureStore.setItemAsync(ACCESS_TOKEN, data.access_token);
    await SecureStore.setItemAsync(REFRESH_TOKEN, data.refresh_token);
    await SecureStore.setItemAsync(USER, JSON.stringify(mapUserToUserDTO(data.user)));
    return {
        message: data.message ?? 'Authentication complete',
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        user: data.user,
    };
}

export async function refresh(): Promise<RefreshResponse> {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN);
    if (!refreshToken) {
        throw new Error('No refresh token available');
    }
    const { data } = await api().post('/refresh', { refresh_token: refreshToken });
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid response from server');
    }
    if (!data.access_token) {
        throw new Error('Server did not return access token');
    }
    // Update stored access token
    await SecureStore.setItemAsync(ACCESS_TOKEN, data.access_token);
    if (data?.user) {
        await SecureStore.setItemAsync(USER, JSON.stringify(mapUserToUserDTO(data.user)));
    }
    // If your backend sometimes rotates refresh tokens, capture that:
    if (data.refresh_token) {
        await SecureStore.setItemAsync(REFRESH_TOKEN, data.refresh_token);
    }
    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token ?? refreshToken,
    };
}

export async function logout(): Promise<void> {
    try {
        await api().post('/logout');
    } catch (error) {
        // Ignore logout API errors, still clear local storage
        console.warn('Logout API call failed:', error);
    }
    await SecureStore.deleteItemAsync(ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN);
    await SecureStore.deleteItemAsync(USER);
}

export const getAccessToken = (): Promise<string | null> => SecureStore.getItemAsync(ACCESS_TOKEN);
export const getRefreshToken = (): Promise<string | null> => SecureStore.getItemAsync(REFRESH_TOKEN);
export const getUser = (): Promise<string | null> => SecureStore.getItemAsync(USER);