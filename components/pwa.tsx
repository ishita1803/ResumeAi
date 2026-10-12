"use client";
import React from "react";

// Registers /sw.js in production (dev HMR + SW caching don't mix).
export function PwaRegister() {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}

// "Install app" button — appears only when the browser fires beforeinstallprompt.
export function PwaInstallButton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  const [deferred, setDeferred] = React.useState<Event | null>(null);
  const [installed, setInstalled] = React.useState(false);

  React.useEffect(() => {
    const onPrompt = (e: Event) => { e.preventDefault(); setDeferred(e); };
    const onInstalled = () => { setInstalled(true); setDeferred(null); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    if (window.matchMedia("(display-mode: standalone)").matches) setInstalled(true);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!deferred || installed) return null;
  return (
    <button
      onClick={async () => {
        const p = deferred as unknown as { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
        await p.prompt();
        const { outcome } = await p.userChoice;
        if (outcome === "accepted") setDeferred(null);
      }}
      className={className}
      style={style}
    >
      Install app
    </button>
  );
}
