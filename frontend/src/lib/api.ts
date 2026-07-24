const rawApiBaseUrl = import.meta.env.VITE_API_URL;

export const API_BASE_URL = (rawApiBaseUrl ?? "http://localhost:8000").replace(/\/$/, "");

export const apiUrl = (path: string) => `${API_BASE_URL}${path}`;
