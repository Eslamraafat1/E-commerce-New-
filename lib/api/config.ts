/**
 * API configuration. Nothing in the UI hardcodes URLs — everything goes through here.
 *  - NEXT_PUBLIC_USE_DEMO_API=true  → the app talks to its own demo Route Handlers (/api/*).
 *  - NEXT_PUBLIC_USE_DEMO_API=false → the app talks to NEXT_PUBLIC_API_BASE_URL (your real backend).
 */
export const useDemoApi = (process.env.NEXT_PUBLIC_USE_DEMO_API ?? "true") !== "false";
export const apiBaseUrl = useDemoApi ? "/api" : (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
