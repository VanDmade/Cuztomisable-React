// src/services/storage.service.ts
import * as SecureStore from 'expo-secure-store';

const DEFAULT_TTL_MINUTES = 60 * 24;

type StorageValue<T = any> = {
    value: T;
    forceRefresh: boolean;
    expiresAt: number | null;
};

class StorageService {
    async set<T = any>(
        key: string,
        value: T,
        ttlMinutes: number = DEFAULT_TTL_MINUTES
    ): Promise<void> {
        const payload: StorageValue<T> = {
            value,
            forceRefresh: false,
            expiresAt: ttlMinutes > 0 ? Date.now() + ttlMinutes * 60 * 1000 : null,
        };
        await SecureStore.setItemAsync(key, JSON.stringify(payload));
    }

    async get<T = any>(key: string): Promise<T | null> {
        const raw = await SecureStore.getItemAsync(key);
        if (!raw) {
            return null;
        }
        try {
            const parsed: StorageValue<T> = JSON.parse(raw);
            if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
                await SecureStore.deleteItemAsync(key);
                return null;
            }
            return parsed.value;
        } catch (error) {
            return null;
        }
    }

    async remove(key: string): Promise<void> {
        await SecureStore.deleteItemAsync(key);
    }

    async has(key: string): Promise<boolean> {
        const value = await this.get(key);
        return value !== null;
    }

    async clear(keys: string[]): Promise<void> {
        await Promise.all(
            keys.map((key) => SecureStore.deleteItemAsync(key))
        );
    }
}

export default new StorageService();