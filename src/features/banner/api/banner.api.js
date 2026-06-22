// features/banner/api/banner.api.js
import httpClient from "../../../core/api/httpClient";

const BASE = "/banners";

/**
 * GET /banners?page=&limit=&position=&isActive=&sortBy=&sortOrder=
 */
export const fetchBanners = (params = {}) => httpClient.get(BASE, { params });

/**
 * GET /banners/:id
 */
export const fetchBannerById = (id) => httpClient.get(`${BASE}/${id}`);

/**
 * POST /banners
 * Body: { title, subtitle?, description?, type?, image, linkUrl?, linkText?,
 *         position, sortOrder?, startDate?, endDate?, isActive? }
 */
export const createBanner = (data) => httpClient.post(BASE, data);

/**
 * PUT /banners/:id  (also accepts PATCH on the backend)
 */
export const updateBanner = (id, data) => httpClient.put(`${BASE}/${id}`, data);

/**
 * PATCH /banners/:id/deactivate
 */
export const deactivateBanner = (id) => httpClient.patch(`${BASE}/${id}/deactivate`);

/**
 * DELETE /banners/:id  (hard delete)
 */
export const deleteBanner = (id) => httpClient.delete(`${BASE}/${id}`);

/**
 * Upload a banner image via the backend upload endpoint.
 * Returns { url, publicId }.
 */
export const uploadBannerImage = async (file) => {
  const formData = new FormData();
  formData.append("images", file);

  const res = await httpClient.post(`${BASE}/upload-image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data; // { success, url, publicId }
};
