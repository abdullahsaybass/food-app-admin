// features/coupon/hooks/useCoupon.js
import { useState, useEffect, useCallback } from "react";
import {
  fetchCoupons,
  fetchCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../api/coupon.api";

const useCoupon = ({ autoLoad = true } = {}) => {
  const [coupons, setCoupons]       = useState([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState(null);

  const loadCoupons = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCoupons(params);
      const data = res.data?.data ?? res.data ?? [];
      const list = Array.isArray(data) ? data : data.coupons ?? [];
      setCoupons(list.map((c) => ({ ...c, id: c.id ?? c._id })));
      setTotal(res.data?.total ?? list.length);
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to load coupons.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad) loadCoupons();
  }, [autoLoad, loadCoupons]);

  const getCouponById = useCallback(async (id) => {
    try {
      const res = await fetchCouponById(id);
      return res.data?.data ?? res.data;
    } catch (err) {
      throw new Error(err?.response?.data?.message ?? "Failed to load coupon.");
    }
  }, []);

  const addCoupon = useCallback(async (data) => {
    setSubmitting(true);
    try {
      const res = await createCoupon(data);
      return res.data?.data ?? res.data;
    } catch (err) {
      throw new Error(err?.response?.data?.message ?? "Failed to create coupon.");
    } finally {
      setSubmitting(false);
    }
  }, []);

  const editCoupon = useCallback(async (id, data) => {
    setSubmitting(true);
    try {
      const res = await updateCoupon(id, data);
      return res.data?.data ?? res.data;
    } catch (err) {
      throw new Error(err?.response?.data?.message ?? "Failed to update coupon.");
    } finally {
      setSubmitting(false);
    }
  }, []);

  const removeCoupon = useCallback(async (id) => {
    setSubmitting(true);
    try {
      await deleteCoupon(id);
      setCoupons((prev) => prev.filter((c) => (c.id ?? c._id) !== id));
    } catch (err) {
      throw new Error(err?.response?.data?.message ?? "Failed to delete coupon.");
    } finally {
      setSubmitting(false);
    }
  }, []);

  return {
    coupons,
    total,
    loading,
    submitting,
    error,
    loadCoupons,
    getCouponById,
    addCoupon,
    editCoupon,
    removeCoupon,
  };
};

export default useCoupon;
