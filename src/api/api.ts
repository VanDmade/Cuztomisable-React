import axios, { AxiosInstance } from 'axios';
import { Platform } from 'react-native';
import { getConfig } from '../providers/ConfigProvider'; // 👈 add this
import { attachInterceptors } from './interceptors';

export function getApi(): AxiosInstance {
    const config = getConfig();

    const DEVICE_TYPE =
        Platform.OS === 'android'
            ? 'Android'
            : Platform.OS === 'ios'
            ? 'iOS'
            : 'Other';
    const api = axios.create({
        baseURL: config.baseUrl,
        timeout: config.requestTimeoutMs,
        headers: {
            'X-App-Platform': 'mobile',
            'User-Agent': `${config.appName}/${config.version} (${DEVICE_TYPE})`,
            Accept: 'application/json',
        },
    });
    attachInterceptors(api);
    return api;
}