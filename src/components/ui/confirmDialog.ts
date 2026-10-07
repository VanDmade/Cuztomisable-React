// The dialog ConfirmHost draws - set by <Confirm visible> or by calling confirmDialog() directly.
//
// Why not a Modal: on Android a React Native Modal is a separate window, and Android's navigation bar
// contrast (which a Modal's window can't turn off from JavaScript) gives it a solid white bar behind the
// system buttons. ConfirmHost draws the dialog in the app's own window instead. It's rendered by
// AppProvider - without it, Confirm falls back to a Modal.

export type ConfirmIntent = 'primary' | 'danger' | 'success';

export type ConfirmOptions = {
    title?: string;
    subtitle?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    confirmIntent?: ConfirmIntent;
    onConfirm: () => void;
    onCancel?: () => void;
};

// controlled: shown by <Confirm>, whose visible prop decides when it closes - confirmDialog() ones close
// themselves when a button is pressed
type Entry = { id: number; options: ConfirmOptions; controlled: boolean };

let current: Entry | null = null;
let nextId = 1;
let hosts = 0;
const listeners = new Set<() => void>();

function setCurrent(entry: Entry | null) {
    current = entry;
    listeners.forEach((listener) => listener());
}

// Shows a dialog - onConfirm or onCancel runs once the user picks (Android Back counts as cancel)
export function confirmDialog(options: ConfirmOptions): void {
    setCurrent({ id: nextId++, options, controlled: false });
}

// A button (or Back) was pressed on the dialog showing now
export function answerConfirmDialog(confirmed: boolean): void {
    const entry = current;
    if (!entry) {
        return;
    }
    if (!entry.controlled) {
        setCurrent(null);
    }
    if (confirmed) {
        entry.options.onConfirm();
    } else {
        entry.options.onCancel?.();
    }
}

// ---- For Confirm and ConfirmHost ----

export function showControlled(id: number | null, options: ConfirmOptions): number {
    const entryId = id ?? nextId++;
    setCurrent({ id: entryId, options, controlled: true });
    return entryId;
}

export function hideControlled(id: number): void {
    if (current?.id === id) {
        setCurrent(null);
    }
}

export function registerHost(): () => void {
    hosts++;
    return () => {
        hosts--;
    };
}

export function hasHost(): boolean {
    return hosts > 0;
}

export function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function getCurrent(): Entry | null {
    return current;
}
