// frontend/src/lib/sessionStore.ts
import { useEffect, useState } from "react";

interface SessionState {
  sessionId: string | null;
  isSummaryReady: boolean;
}

const listeners = new Set<(state: SessionState) => void>();
let currentState: SessionState = {
  sessionId: localStorage.getItem("docans_active_session"),
  isSummaryReady: false,
};

const notifyListeners = () => {
  listeners.forEach((listener) => listener(currentState));
};

export const setActiveSession = (id: string | null) => {
  currentState = {
    sessionId: id,
    isSummaryReady: false,
  };

  if (id) {
    localStorage.setItem("docans_active_session", id);
  } else {
    localStorage.removeItem("docans_active_session");
  }

  notifyListeners();
};

export const setSummaryReady = (ready: boolean) => {
  currentState = {
    ...currentState,
    isSummaryReady: ready,
  };
  notifyListeners();
};

export const useSessionStore = () => {
  const [state, setState] = useState<SessionState>(currentState);

  useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  return state;
};
