// src/hooks/useNavigateTo.ts
// Opening a page that's already in the history goes back to it rather than adding a second copy, so Back never
// shows the same page twice (Home -> Settings -> Settings -> Home). Anything not in the history is pushed as usual.
import { useRootNavigationState, useRouter } from 'expo-router';

type NavState = { routes: { name: string; params?: any; state?: NavState }[] } | undefined;

// "/(tabs)/ingredients/index?x=1" and "/(tabs)/ingredients" are the same page
const normalize = (href: string) => {
    const path = href.split('?')[0].replace(/\/index$/, '').replace(/\/+$/, '');
    return path === '' ? '/' : path;
};

// Every screen in the history, oldest first, as its full path (route groups included)
function historyPaths(state: NavState, prefix = ''): string[] {
    if (!state?.routes) {
        return [];
    }
    return state.routes.flatMap((route) => {
        const path = `${prefix}/${route.name}`;
        if (route.state) {
            return historyPaths(route.state, path);
        }
        // A navigator that hasn't rendered yet only knows which screen it's opening
        if (route.params?.screen) {
            return [normalize(`${path}/${route.params.screen}`)];
        }
        return [normalize(path)];
    });
}

export function useNavigateTo() {
    const router = useRouter();
    const rootState = useRootNavigationState() as unknown as NavState;

    return (href: string) => {
        const target = normalize(href);
        const paths = historyPaths(rootState);
        const found = paths.lastIndexOf(target);
        if (found === -1) {
            router.push(href as any);
            return;
        }
        // Already there - nothing to do; otherwise step back to it, one screen at a time
        for (let i = paths.length - 1; i > found; i--) {
            router.back();
        }
    };
}
