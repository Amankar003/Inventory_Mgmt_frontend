/**
 * api.js - Axios API Client
 *
 * Creates a reusable Axios instance with the backend URL.
 * All API calls in the app will use this instance.
 */

import axios from "axios";

// Read the backend URL from environment variables
// Vite exposes env vars prefixed with VITE_ on import.meta.env
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Create an Axios instance with the base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
