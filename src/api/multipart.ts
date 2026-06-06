import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { getConfig } from '../providers/ConfigProvider';

export function toFormData(data: Record<string, any>): FormData {
    const fd = new FormData();
    const append = (key: string, val: any) => {
        if (val === null || val === undefined) return;
        if (Array.isArray(val)) {
            val.forEach((item, i) => append(`${key}[${i}]`, item));
        } else if (val && typeof val === 'object' && 'uri' in val) {
            fd.append(key, val as any);
        } else if (val && typeof val === 'object' && !(val instanceof File)) {
            Object.entries(val).forEach(([k, v]) => append(`${key}[${k}]`, v));
        } else if (typeof val === 'boolean') {
            fd.append(key, val ? '1' : '0');
        } else {
            fd.append(key, String(val));
        }
    };
    Object.entries(data).forEach(([key, val]) => append(key, val));
    return fd;
}

export async function postMultipart(path: string, fd: FormData): Promise<any> {
    const { baseUrl, appName, version } = getConfig();
    const token = await SecureStore.getItemAsync('access_token');
    const url = baseUrl.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
    const deviceType = Platform.OS === 'android' ? 'Android' : Platform.OS === 'ios' ? 'iOS' : 'Other';

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.setRequestHeader('X-App-Platform', 'mobile');
        xhr.setRequestHeader('User-Agent', `${appName}/${version} (${deviceType})`);
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

        xhr.onload = () => {
            try {
                const json = JSON.parse(xhr.responseText);
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(json);
                } else if (xhr.status === 422) {
                    reject({ code: 'VALIDATION', status: 422, message: 'Validation failed', details: json?.errors });
                } else {
                    reject({ code: 'HTTP_ERROR', status: xhr.status, message: json?.message ?? `HTTP ${xhr.status}`, details: json });
                }
            } catch {
                reject({ code: 'HTTP_ERROR', status: xhr.status, message: `HTTP ${xhr.status}` });
            }
        };
        xhr.onerror = () => reject({ code: 'NETWORK', message: 'Network Error' });
        xhr.ontimeout = () => reject({ code: 'NETWORK', message: 'Timeout' });
        xhr.send(fd);
    });
}
