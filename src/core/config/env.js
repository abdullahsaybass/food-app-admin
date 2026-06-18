// src/core/config/env.js

export const ENV = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
};

// The backend's origin (no trailing /api), used to resolve relative upload paths.
// e.g. API_URL = "http://localhost:5000/api" → SERVER_ORIGIN = "http://localhost:5000"
export const SERVER_ORIGIN = ENV.API_URL.replace(/\/api\/?$/, '');

/**
 * Resolves an image url returned by the backend into a fully-qualified URL
 * the browser can load directly.
 *
 * - Local-storage uploads return relative paths like "/uploads/categories/abc.webp"
 *   → prefixed with SERVER_ORIGIN.
 * - Any already-absolute URL (e.g. a legacy Cloudinary URL, or http(s)://...)
 *   → returned as-is.
 * - null/undefined → returned as-is, so callers can keep using `?.` / fallback chains.
 */
export const resolveImageUrl = (url) => {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return `${SERVER_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
};