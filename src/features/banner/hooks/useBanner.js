// features/banner/hooks/useBanner.js
import { useState, useEffect, useCallback } from "react";
import {
  fetchBanners,
  fetchBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  uploadBannerImage,
} from "../api/banner.api";

const useBanner = ({ autoLoad = true } = {}) => {
  const [banners, setBanners]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [error, setError]           = useState(null);

  /* ── Fetch all (admin view) ── */
  const loadBanners = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchBanners({ limit: 100 });
      const raw = res.data?.data?.banners ?? res.data?.data ?? [];
      // Normalize _id → id so both MongoDB (_id) and REST (id) shapes work
      setBanners(raw.map((b) => ({ ...b, id: b.id ?? b._id })));
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to load banners.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad) loadBanners();
  }, [autoLoad, loadBanners]);

  /* ── Upload image ── */
  const uploadImage = useCallback(async (file) => {
    setUploading(true);
    try {
      return await uploadBannerImage(file);
    } catch (err) {
      throw new Error(err?.response?.data?.message ?? "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }, []);

  /* ── Fetch single banner by id (for Edit) ── */
  const getBannerById = useCallback(async (id) => {
    try {
      const res = await fetchBannerById(id);
      return res.data?.data;
    } catch (err) {
      throw new Error(err?.response?.data?.message ?? "Failed to load banner.");
    }
  }, []);

  /* ── Create ── */
  const addBanner = useCallback(async (data) => {
    setSubmitting(true);
    try {
      const res = await createBanner(data);
      await loadBanners();
      return res.data?.data;
    } catch (err) {
      throw new Error(err?.response?.data?.message ?? "Failed to create banner.");
    } finally {
      setSubmitting(false);
    }
  }, [loadBanners]);

  /* ── Update ── */
  const editBanner = useCallback(async (id, data) => {
    setSubmitting(true);
    try {
      const res = await updateBanner(id, data);
      await loadBanners();
      return res.data?.data;
    } catch (err) {
      throw new Error(err?.response?.data?.message ?? "Failed to update banner.");
    } finally {
      setSubmitting(false);
    }
  }, [loadBanners]);

  /* ── Delete ── */
  const removeBanner = useCallback(async (id) => {
    setSubmitting(true);
    try {
      await deleteBanner(id);
      setBanners((prev) => prev.filter((b) => (b.id ?? b._id) !== id));
    } catch (err) {
      throw new Error(err?.response?.data?.message ?? "Failed to delete banner.");
    } finally {
      setSubmitting(false);
    }
  }, []);

  return {
    banners,
    loading,
    submitting,
    uploading,
    error,
    loadBanners,
    uploadImage,
    getBannerById,
    addBanner,
    editBanner,
    removeBanner,
  };
};

export default useBanner;
