import type { UserData, Theme } from '../types';

export interface SharedState {
    userData: UserData;
    theme: Theme;
}

/**
 * Encodes the application state into a Base64 string.
 */
export const encodeState = (userData: UserData, theme: Theme): string => {
    const state: SharedState = { userData, theme };
    const jsonString = JSON.stringify(state);
    // Using btoa with encodeURIComponent for Unicode support
    return btoa(encodeURIComponent(jsonString));
};

/**
 * Decodes a Base64 string back into the application state.
 */
export const decodeState = (encodedData: string): SharedState | null => {
    try {
        const jsonString = decodeURIComponent(atob(encodedData));
        const state = JSON.parse(jsonString) as SharedState;

        // Basic validation
        if (state.userData && typeof state.userData.name === 'string' && Array.isArray(state.userData.entries)) {
            return state;
        }
        return null;
    } catch (error) {
        console.error('Failed to decode shared state:', error);
        return null;
    }
};

/**
 * Generates the full share URL with the encoded data.
 */
export const getShareUrl = (userData: UserData, theme: Theme): string => {
    const encoded = encodeState(userData, theme);
    const url = new URL(window.location.href);
    url.searchParams.set('data', encoded);
    return url.toString();
};
