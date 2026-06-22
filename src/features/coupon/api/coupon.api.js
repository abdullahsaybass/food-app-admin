// features/coupon/api/coupon.api.js
import httpClient from "../../../core/api/httpClient";

const BASE = "/coupons";

export const fetchCoupons = (params = {}) =>
  httpClient.get(BASE, { params });

export const fetchCouponById = (id) => httpClient.get(`${BASE}/${id}`);

export const createCoupon = (data) => httpClient.post(BASE, data);

export const updateCoupon = (id, data) => httpClient.patch(`${BASE}/${id}`, data);

export const deleteCoupon = (id) => httpClient.delete(`${BASE}/${id}`);
