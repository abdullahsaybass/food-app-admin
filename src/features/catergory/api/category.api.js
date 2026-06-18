// features/category/api/category.api.js
import httpClient from "../../../core/api/httpClient";

const BASE = "/categories";

/**
 * GET /categories?activeOnly=false  — admin gets all (including inactive)
 */
export const fetchCategories = (activeOnly = false) =>
  httpClient.get(`${BASE}?activeOnly=${activeOnly}`);

/**
 * GET /categories/:id
 */
export const fetchCategoryById = (id) => httpClient.get(`${BASE}/${id}`);

/**
 * POST /categories
 * Body: { name, key?, description?, image?, banner?, sortOrder?, isActive? }
 */
export const createCategory = (data) => httpClient.post(BASE, data);

/**
 * PATCH /categories/:id
 */
export const updateCategory = (id, data) => httpClient.patch(`${BASE}/${id}`, data);

/**
 * DELETE /categories/:id  (soft-delete)
 */
export const deleteCategory = (id) => httpClient.delete(`${BASE}/${id}`);

/**
 * Upload an image via the backend upload endpoint (saved to local disk on the server).
 * Returns { url, publicId }.
 *
 * NOTE: Adjust the endpoint to whatever your backend exposes for file uploads.
 * e.g.  POST /upload  with multipart/form-data  { file, folder:"categories" }
 */
export const uploadCategoryImage = async (file) => {
  const formData = new FormData();
  formData.append("images", file);

  const res = await httpClient.post("/categories/upload-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data; // { success, url, publicId }
};
