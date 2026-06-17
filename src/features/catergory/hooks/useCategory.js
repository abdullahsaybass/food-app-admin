// // features/category/hooks/useCategory.js
// import { useState, useEffect, useCallback } from "react";
// import {
//   fetchCategories,
//   fetchCategoryById,
//   createCategory,
//   updateCategory,
//   deleteCategory,
//   uploadCategoryImage,
// } from "../api/category.api";

// const useCategory = () => {
//   const [categories, setCategories]   = useState([]);
//   const [loading, setLoading]         = useState(false);
//   const [submitting, setSubmitting]   = useState(false);
//   const [uploading, setUploading]     = useState(false);
//   const [error, setError]             = useState(null);

//   /* ── Fetch all (admin view — includes inactive) ── */
//   const loadCategories = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await fetchCategories(false);
//       const raw = res.data?.data ?? [];
//       // Normalize _id → id so both MongoDB (_id) and REST (id) backends work
//       setCategories(raw.map((c) => ({ ...c, id: c.id ?? c._id })));
//     } catch (err) {
//       setError(err?.response?.data?.message ?? "Failed to load categories.");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     loadCategories();
//   }, [loadCategories]);

//   /* ── Upload image ── */
//   const uploadImage = useCallback(async (file) => {
//     setUploading(true);
//     try {
//       const result = await uploadCategoryImage(file);
//       return result;
//     } catch (err) {
//       throw new Error(err?.response?.data?.message ?? "Image upload failed.");
//     } finally {
//       setUploading(false);
//     }
//   }, []);

//   /* ── Fetch single category by id (for the Edit page) ── */
//   const getCategoryById = useCallback(async (id) => {
//     try {
//       const res = await fetchCategoryById(id);
//       return res.data?.data;
//     } catch (err) {
//       throw new Error(err?.response?.data?.message ?? "Failed to load category.");
//     }
//   }, []);

//   /* ── Create ── */
//   const addCategory = useCallback(async (data) => {
//     setSubmitting(true);
//     try {
//       const res = await createCategory(data);
//       await loadCategories();
//       return res.data?.data;
//     } catch (err) {
//       throw new Error(err?.response?.data?.message ?? "Failed to create category.");
//     } finally {
//       setSubmitting(false);
//     }
//   }, [loadCategories]);

//   /* ── Update ── */
//   const editCategory = useCallback(async (id, data) => {
//     setSubmitting(true);
//     try {
//       const res = await updateCategory(id, data);
//       await loadCategories();
//       return res.data?.data;
//     } catch (err) {
//       throw new Error(err?.response?.data?.message ?? "Failed to update category.");
//     } finally {
//       setSubmitting(false);
//     }
//   }, [loadCategories]);

//   /* ── Delete ── */
//   const removeCategory = useCallback(async (id) => {
//     setSubmitting(true);
//     try {
//       await deleteCategory(id);
//       setCategories((prev) => prev.filter((c) => (c.id ?? c._id) !== id));
//     } catch (err) {
//       throw new Error(err?.response?.data?.message ?? "Failed to delete category.");
//     } finally {
//       setSubmitting(false);
//     }
//   }, []);

//   return {
//     categories,
//     loading,
//     submitting,
//     uploading,
//     error,
//     loadCategories,
//     uploadImage,
//     getCategoryById,
//     addCategory,
//     editCategory,
//     removeCategory,
//   };
// };

// export default useCategory;

// features/category/hooks/useCategory.js
import { useState, useEffect, useCallback } from "react";
import {
  fetchCategories,
  fetchCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
} from "../api/category.api";

const useCategory = ({ autoLoad = true } = {}) => {
  const [categories, setCategories]   = useState([]);
  const [loading, setLoading]         = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [uploading, setUploading]     = useState(false);
  const [error, setError]             = useState(null);

  /* ── Fetch all (admin view — includes inactive) ── */
  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCategories(false);
      const raw = res.data?.data ?? [];
      // Normalize _id → id so both MongoDB (_id) and REST (id) backends work
      setCategories(raw.map((c) => ({ ...c, id: c.id ?? c._id })));
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Pages that only create/edit a single category (AddCategoryPage) don't
    // need the full list — fetching it there was pure wasted work, and it
    // happened again on every save (see addCategory/editCategory below),
    // and a third time when AllCategoriesPage mounted after navigating away.
    if (autoLoad) loadCategories();
  }, [autoLoad, loadCategories]);

  /* ── Upload image ── */
  const uploadImage = useCallback(async (file) => {
    setUploading(true);
    try {
      const result = await uploadCategoryImage(file);
      return result;
    } catch (err) {
      throw new Error(err?.response?.data?.message ?? "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }, []);

  /* ── Fetch single category by id (for the Edit page) ── */
  const getCategoryById = useCallback(async (id) => {
    try {
      const res = await fetchCategoryById(id);
      return res.data?.data;
    } catch (err) {
      throw new Error(err?.response?.data?.message ?? "Failed to load category.");
    }
  }, []);

  /* ── Create ── */
  const addCategory = useCallback(async (data) => {
    setSubmitting(true);
    try {
      const res = await createCategory(data);
      // No re-fetch here — AddCategoryPage navigates straight to
      // /categories afterward, and AllCategoriesPage fetches its own
      // fresh list on mount. Re-fetching here was a wasted extra round trip.
      return res.data?.data;
    } catch (err) {
      throw new Error(err?.response?.data?.message ?? "Failed to create category.");
    } finally {
      setSubmitting(false);
    }
  }, []);

  /* ── Update ── */
  const editCategory = useCallback(async (id, data) => {
    setSubmitting(true);
    try {
      const res = await updateCategory(id, data);
      // Same reasoning as addCategory above — no redundant re-fetch.
      return res.data?.data;
    } catch (err) {
      throw new Error(err?.response?.data?.message ?? "Failed to update category.");
    } finally {
      setSubmitting(false);
    }
  }, []);

  /* ── Delete ── */
  const removeCategory = useCallback(async (id) => {
    setSubmitting(true);
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => (c.id ?? c._id) !== id));
    } catch (err) {
      throw new Error(err?.response?.data?.message ?? "Failed to delete category.");
    } finally {
      setSubmitting(false);
    }
  }, []);

  return {
    categories,
    loading,
    submitting,
    uploading,
    error,
    loadCategories,
    uploadImage,
    getCategoryById,
    addCategory,
    editCategory,
    removeCategory,
  };
};

export default useCategory;