// frontend/src/lib/sessionStore.ts
import { useState, useEffect } from 'react';

// A lightweight pub/sub system to share the active session across components
const listeners = new Set<(id: string | null) => void>();
let currentSessionId: string | null = localStorage.getItem("docans_active_session");

export const setActiveSession = (id: string | null) => {
  currentSessionId = id;
  if (id) {
    localStorage.setItem("docans_active_session", id);
  } else {
    localStorage.removeItem("docans_active_session");
  }
  // Notify all components that the session has changed
  listeners.forEach((listener) => listener(id));
};

export const useSessionStore = () => {
  const [sessionId, setSessionId] = useState<string | null>(currentSessionId);

  useEffect(() => {
    listeners.add(setSessionId);
    return () => {
      listeners.delete(setSessionId);
    };
  }, []);

  return { sessionId, setActiveSession };
};
