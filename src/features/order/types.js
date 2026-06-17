// features/orders/types.js

// Matches backend ORDER_STATUS exactly (modules/order/order.constants.js).
// "processing" / "shipped" never existed on the backend — this used to be
// out of sync, which silently broke admin status updates for any order in
// "packing" or "out_for_delivery" (STATUS_TRANSITIONS had no entry for them,
// so the admin UI showed "No further status transitions available").
export const ORDER_STATUS = {
  PENDING:          "pending",
  CONFIRMED:        "confirmed",
  PACKING:          "packing",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED:        "delivered",
  CANCELLED:        "cancelled",
};

export const ORDER_STATUS_LABELS = {
  pending:          "Order Placed",
  confirmed:        "Confirmed",
  packing:          "Packing",
  out_for_delivery: "Out for Delivery",
  delivered:        "Delivered",
  cancelled:        "Cancelled",
};

// Mirrors backend ADMIN_STATUS_TRANSITIONS exactly (order.constants.js) —
// this is what the backend will actually accept via PATCH /:id/status.
export const STATUS_TRANSITIONS = {
  pending:          ["confirmed", "cancelled"],
  confirmed:        ["packing", "cancelled"],
  packing:          ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered"],
  delivered:        [],
  cancelled:        [],
};

export const STATUS_COLORS = {
  pending:          { bg: "#fef9c3", text: "#854d0e", dot: "#ca8a04" },
  confirmed:        { bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6" },
  packing:          { bg: "#ede9fe", text: "#5b21b6", dot: "#7c3aed" },
  out_for_delivery: { bg: "#ffedd5", text: "#9a3412", dot: "#f97316" },
  delivered:        { bg: "#dcfce7", text: "#14532d", dot: "#22c55e" },
  cancelled:        { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444" },
};