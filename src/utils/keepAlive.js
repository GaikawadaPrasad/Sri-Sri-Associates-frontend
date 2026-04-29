/**
 * keepAlive.js
 * Pings the backend every 14 minutes to prevent Render free-tier cold starts.
 * Call startKeepAlive() once when your app mounts.
 */
const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://sri-sri-associates-backend.onrender.com';
const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes

let intervalId = null;

const ping = async () => {
    try {
        await fetch(`${BACKEND_URL}/`, { method: 'GET', mode: 'no-cors' });
        console.log('[KeepAlive] Server pinged at', new Date().toLocaleTimeString());
    } catch {
        // Silent fail — network might be offline
    }
};

export const startKeepAlive = () => {
    if (intervalId) return; // already running
    ping(); // ping immediately on startup
    intervalId = setInterval(ping, PING_INTERVAL);
};

export const stopKeepAlive = () => {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
};
