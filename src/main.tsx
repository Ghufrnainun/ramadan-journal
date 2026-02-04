import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

declare global {
  interface Window {
    __APP_PUBLIC_CONFIG__?: {
      supabaseUrl?: string;
      supabaseAnonKey?: string;
    };
  }
}

const rootEl = document.getElementById("root")!;
const root = createRoot(rootEl);

const BootError = ({ message }: { message: string }) => (
  <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
    <div className="max-w-md w-full space-y-3">
      <h1 className="text-xl font-semibold">App gagal start</h1>
      <p className="text-sm text-muted-foreground">{message}</p>
      <ol className="list-decimal pl-5 text-sm text-muted-foreground space-y-1">
        <li>Hard refresh (Ctrl/Cmd+Shift+R)</li>
        <li>Jika pernah install PWA: uninstall / clear site data</li>
        <li>Reload lagi</li>
      </ol>
    </div>
  </div>
);

async function ensurePublicConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  // If env is present, nothing to do.
  if (url && key) return;

  // Fallback: fetch public config from backend function.
  try {
    const res = await fetch('/functions/v1/public-config', {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as {
      supabaseUrl?: string;
      supabaseAnonKey?: string;
    };
    window.__APP_PUBLIC_CONFIG__ = data;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Tidak bisa memuat konfigurasi backend (${msg}).`);
  }
}

(async () => {
  try {
    await ensurePublicConfig();
    const { default: App } = await import("./App.tsx");
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    root.render(<BootError message={msg} />);
  }
})();

if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.error('Service worker registration failed:', error);
      });
    });
  } else {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    });

    if ('caches' in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => caches.delete(key));
      });
    }
  }
}
