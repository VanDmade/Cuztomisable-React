// cuztomisable/services/user.service.ts
import * as SecureStore from 'expo-secure-store';

import { getApi as api } from '../api/api';
import { fileFromUri } from '../utils/formatters/formatImage';
import { mapUserToUserDTO } from '../utils/formatters/user';

const USER = 'user';

export type ImageChange = 'none' | 'new' | 'clear';

export type SaveProfileArgs = {
    name: string;
    email: string;
    countryCode: string;
    phone: string;
    timezone: string;
    image: string | null;
    imageChange: ImageChange;
};

// Response types
export type GetUserResponse = {
    user: any;
    message?: string;
};

export type UpdateProfileResponse = {
    message: string;
    user: any;
};

export type ChangePasswordResponse = {
    message: string;
};

export type ToggleTwoFactorResponse = {
    message: string;
    enabled: boolean;
};

export async function get(): Promise<GetUserResponse> {
    // The "current authenticated user" route is /me - /user/{id} requires an id and is
    // for looking up a specific other user, not fetching your own profile.
    const { data } = await api().get('/me');
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid response from server');
    }
    if (!data.user) {
        throw new Error('Server did not return user data');
    }
    return {
        user: data.user,
        message: data.message,
    };
}

export async function update({
    name,
    email,
    countryCode,
    phone,
    timezone,
    image,
    imageChange,
}: SaveProfileArgs): Promise<UpdateProfileResponse> {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('timezone', timezone);
    formData.append('country_code', String(countryCode).replace(/\D/g, ''));
    formData.append('phone', String(phone).replace(/\D/g, ''));
    if (imageChange === 'new' && image) {
        const file = fileFromUri(image);
        if (file) {
            formData.append('image', file as any); // RN will treat this as a file
        }
    } else if (imageChange === 'clear') {
        formData.append('clear_image', '1');
    }
    const { data } = await api().post('/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid response from server');
    }
    if (!data.user) {
        throw new Error('Server did not return updated user data');
    }
    // Updates the user's information
    await SecureStore.setItemAsync(USER, JSON.stringify(mapUserToUserDTO(data.user)));
    return {
        message: data.message ?? 'Profile updated successfully',
        user: data.user,
    };
}

export async function changePassword(
    currentPassword: string,
    newPassword: string
): Promise<ChangePasswordResponse> {
    const formData = new FormData();
    formData.append('current', currentPassword);
    formData.append('new', newPassword);
    const { data } = await api().post('/user/change/password', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid response from server');
    }
    return {
        message: data.message ?? 'Password changed successfully',
    };
}

export async function toggleTwoFactor(enabled: boolean): Promise<ToggleTwoFactorResponse> {
    const { data } = await api().patch('/mfa');
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid response from server');
    }
    // Update local user data
    const raw = await SecureStore.getItemAsync(USER);
    if (raw) {
        try {
            const user = JSON.parse(raw);
            user.multi_factor_authentication = data.enabled ?? enabled;
            await SecureStore.setItemAsync(USER, JSON.stringify(user));
        } catch (error) {
            console.warn('Failed to update local user MFA setting:', error);
        }
    }
    return {
        message: data.message ?? `Two-factor authentication ${enabled ? 'enabled' : 'disabled'}`,
        enabled: data.enabled ?? enabled,
    };
}