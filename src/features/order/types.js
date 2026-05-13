// features/orders/types.js

export const ORDER_STATUS = {
  PENDING:    "pending",
  CONFIRMED:  "confirmed",
  PROCESSING: "processing",
  SHIPPED:    "shipped",
  DELIVERED:  "delivered",
  CANCELLED:  "cancelled",
};

export const STATUS_TRANSITIONS = {
  pending:    ["confirmed", "cancelled"],
  confirmed:  ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped:    ["delivered"],
  delivered:  [],
  cancelled:  [],
};

export const STATUS_COLORS = {
  pending:    { bg: "#fef9c3", text: "#854d0e", dot: "#ca8a04" },
  confirmed:  { bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6" },
  processing: { bg: "#ede9fe", text: "#5b21b6", dot: "#7c3aed" },
  shipped:    { bg: "#d1fae5", text: "#065f46", dot: "#10b981" },
  delivered:  { bg: "#dcfce7", text: "#14532d", dot: "#22c55e" },
  cancelled:  { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444" },
};