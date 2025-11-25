// app/App.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { ChatKitPanel, type FactAction } from "@/components/ChatKitPanel";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function App() {
  const { scheme, setScheme } = useColorScheme();
  const [ready, setReady] = useState(false);

  const handleWidgetAction = useCallback(async (action: FactAction) => {
    if (process.env.NODE_ENV !== "production") {
      console.info("[ChatKitPanel] widget action", action);
    }
  }, []);

  const handleResponseEnd = useCallback(() => {
    if (process.env.NODE_ENV !== "production") {
      console.debug("[ChatKitPanel] response end");
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    // ✅ App ne crée plus une page, il remplit juste son parent
    <div className="w-full h-full flex flex-col min-h-0">
      {/* CHAT AREA */}
      <div className="flex-1 relative min-h-0">
        {ready ? (
          <ChatKitPanel
            theme={scheme}
            onWidgetAction={handleWidgetAction}
            onResponseEnd={handleResponseEnd}
            onThemeRequest={setScheme}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 rounded-full border-2 border-slate-600 border-t-transparent animate-spin" />
              <p className="text-xs text-slate-400">
                Initialisation de l’assistant…
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
