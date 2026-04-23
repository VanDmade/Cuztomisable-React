// providers/AppProvider.tsx
import { ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ConfigProvider } from './ConfigProvider';
import { ThemeWrapper } from './ThemeWrapper';

type AppProviderProps = {
    config: any; // Replace 'any' with a more specific type if available
    children: ReactNode;
};

export const AppProvider = ({ config, children }: AppProviderProps) => {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ConfigProvider config={config}>
                <ThemeWrapper>{children}</ThemeWrapper>
            </ConfigProvider>
        </GestureHandlerRootView>
    );
};