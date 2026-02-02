// Backend (NestJS) runs on port 3000 by default. Use VITE_API_URL to override.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
