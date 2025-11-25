"use client";

import { useCallback, useState, useEffect } from "react";
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
            theme={
