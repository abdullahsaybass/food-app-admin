// features/invoice/pages/InvoiceDetailPage.jsx
//
// Renders a single invoice (from the dedicated Invoice resource, not the
// order directly) styled to match the admin's Invoice Details / Invoice
// Preview / Order Items / Summary / Invoice History layout. The delivery
// status timeline isn't stored on the Invoice itself, so we also fetch the
// linked order to build the "Invoice History" table.
// "Download" uses the browser's native print-to-PDF (window.print + print
// stylesheet) — no PDF library needed.
import { Link, useParams, useNavigate } from "react-router-dom";
import { useInvoice } from "../hooks/invoiceAuth.js";
import { useOrder } from "../../order/hooks/orderAuth.js";
import { normalizeError } from "../../../shared/lib/error-handler.js";
import styles from "./InvoiceDetailPage.module.css";

const isLocalError = (code) => code && code !== 401 && code !== 403 && code < 500;

const STATUS_HISTORY_LABELS = {
  pending:          { action: "Invoice Created",     note: "Order placed by customer" },
  confirmed:        { action: "Order Confirmed",      note: "Order confirmed by admin" },
  packing:          { action: "Packing Started",      note: "Order is being packed" },
  out_for_delivery: { action: "Out for Delivery",      note: "Order handed to delivery" },
  delivered:        { action: "Marked as Delivered",   note: "Order delivered to customer" },
  cancelled:        { action: "Order Cancelled",       note: "Order was cancelled" },
};

const formatDateTime = (d) =>
  d
    ? new Date(d).toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
      })
    : "—";

export default function InvoiceDetailPage() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useInvoice(id);

  const localError = error && isLocalError(error?.response?.status) ? normalizeError(error) : null;
  const invoice     = data?.data;

  // The delivery status timeline lives on the order, not the invoice — fetch
  // it once we know which order this invoice belongs to.
  const orderId = invoice?.order?.id ?? null;
  const { data: orderData, isLoading: isOrderLoading } = useOrder(orderId);
  const order = orderData?.data;

  if (isLoading) return <div className={styles.centered}>Loading invoice…</div>;

  if (localError) {
    return (
      <div className={styles.page}>
        <button className={`${styles.backBtn} ${styles.noPrint}`} onClick={() => navigate("/invoice")}>← Back</button>
        <div className={styles.errorBox}>
          <span className={styles.errorIcon}><AlertIcon /></span>
          <div>
            <p className={styles.errorMsg}>{localError.message}</p>
            {localError.errors?.map((e, i) => <p key={i} className={styles.errorSub}>{e}</p>)}
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) return null;

  const billing      = invoice.billingAddress ?? {};
  const invoiceDate  = new Date(invoice.issuedAt ?? invoice.createdAt);

  const customerName  = billing.fullName ?? invoice.user?.name ?? "—";
  const customerPhone = billing.phone ?? invoice.user?.phone ?? "—";
  const customerEmail = invoice.user?.email ?? "—";
  const address = [billing.street, billing.city, billing.state].filter(Boolean).join(", ");

  // Same-day delivery only — there's no "due date" concept, so it's never shown.
  // Payment status: COD orders sit at "pending" until cash is collected, which
  // reads oddly as a customer-facing badge — show COD / Online instead.
  const isCOD        = invoice.paymentMethod?.toUpperCase() === "COD";
  const isRefunded   = invoice.paymentStatus === "refunded";
  const paymentLabel = isRefunded ? "Refunded" : isCOD ? "COD" : "Online";
  const paymentTone  = isRefunded ? "red" : isCOD ? "yellow" : "green";

  const discount = invoice.discount ?? invoice.discountAmount ?? 0;

  // Build a readable history from the linked order's status timeline (falls
  // back to just "Invoice Created" if the order hasn't logged any
  // transitions, or hasn't loaded yet).
  const history = !order
    ? []
    : (order.statusTimeline?.length ? order.statusTimeline : [{ status: order.status, at: order.createdAt }])
        .map((entry, i) => ({
          num: i + 1,
          action: STATUS_HISTORY_LABELS[entry.status]?.action ?? entry.status,
          by: entry.changedBy ? "Admin" : i === 0 ? "Admin" : "System",
          at: entry.at,
          note: entry.note || STATUS_HISTORY_LABELS[entry.status]?.note || "",
        }));

  if (invoice.voidedAt) {
    history.push({
      num: history.length + 1,
      action: "Invoice Voided",
      by: "Admin",
      at: invoice.voidedAt,
      note: "Invoice was voided",
    });
  }

  return (
    <div className={styles.page}>

      {/* ── Breadcrumb (hidden on print) ── */}
      <div className={`${styles.breadcrumb} ${styles.noPrint}`}>
        <Link to="/" className={styles.crumbLink}>Dashboard</Link>
        <span className={styles.crumbSep}>›</span>
        <Link to="/orders" className={styles.crumbLink}>Orders</Link>
        <span className={styles.crumbSep}>›</span>
        <Link to="/invoice" className={styles.crumbLink}>Invoices</Link>
        <span className={styles.crumbSep}>›</span>
        <span className={styles.crumbCurrent}>{invoice.invoiceNumber}</span>
      </div>

      {/* ── Header ── */}
      <div className={`${styles.headerRow} ${styles.noPrint}`}>
        <div>
          <div className={styles.headingRow}>
            <h1 className={styles.heading}>Invoice #{invoice.invoiceNumber}</h1>
            {invoice.status === "void" && <span className={styles.badge} data-tone="red">Void</span>}
          </div>
          <p className={styles.sub}>View invoice details and order information</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.ghostBtn} onClick={() => navigate("/invoice")}>← Back to Invoices</button>
          <button className={styles.ghostBtn} onClick={() => window.print()}><DownloadIcon /> Download PDF</button>
          <button className={styles.primaryBtn} onClick={() => window.print()}><PrintIcon /> Print Invoice</button>
        </div>
      </div>

      {/* ── Invoice Details + Invoice Preview ── */}
      <div className={styles.topGrid}>

        {/* LEFT — Invoice Details */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Invoice Details</h2>
          <div className={styles.detailsGrid}>
            <div className={styles.detailCol}>
              <DetailRow icon={<DocumentIcon />} label="Invoice Number" value={invoice.invoiceNumber} />
              <DetailRow icon={<ReceiptIcon />}  label="Order Number"   value={invoice.order?.orderNumber ?? "—"} />
              <DetailRow icon={<CalendarIcon />} label="Invoice Date"   value={formatDateTime(invoiceDate)} />
              <DetailRow icon={<CardIcon />}     label="Payment Method" value={invoice.paymentMethod?.toUpperCase() === "COD" ? "Cash on Delivery" : invoice.paymentMethod?.toUpperCase()} />
              <DetailRow icon={<WalletIcon />}   label="Payment Status">
                <span className={styles.badge} data-tone={paymentTone}>
                  {paymentLabel}
                </span>
              </DetailRow>
            </div>
            <div className={styles.detailCol}>
              <DetailRow icon={<UserIcon />}  label="Customer Name"   value={customerName} />
              <DetailRow icon={<PhoneIcon />} label="Phone Number"    value={customerPhone} />
              <DetailRow icon={<MailIcon />}  label="Email Address"   value={customerEmail} />
              <DetailRow icon={<PinIcon />}   label="Delivery Address" value={address || "—"} />
              {billing.notes && <DetailRow icon={<NoteIcon />} label="Notes" value={billing.notes} />}
            </div>
          </div>
        </div>

        {/* RIGHT — Invoice Preview */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Invoice Preview</h2>
          <p className={styles.previewHint}>This is how the invoice will appear to customers.</p>

          <div className={styles.previewSheet}>
            <div className={styles.previewTop}>
              <img src="/src/assets/vfresh.png" alt="VFresh" className={styles.previewLogoImg} />
              <span className={styles.previewPaidBadge} data-tone={paymentTone}>
                {paymentLabel}
              </span>
            </div>

            <div className={styles.previewBizRow}>
              <div>
                <p className={styles.previewBizName}>VFresh Supermarket</p>
                <p className={styles.previewBizLine}>Malé, Maldives</p>
                <p className={styles.previewBizLine}>+960 333 1234 | support@vfresh.mv</p>
              </div>
              <div className={styles.previewMeta}>
                <p><span>Invoice #:</span> {invoice.invoiceNumber}</p>
                <p><span>Order #:</span> {invoice.order?.orderNumber ?? "—"}</p>
                <p><span>Date:</span> {invoiceDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
              </div>
            </div>

            <div className={styles.previewBillRow}>
              <div>
                <p className={styles.previewLabelSm}>Bill To</p>
                <p className={styles.previewBizName}>{customerName}</p>
                <p className={styles.previewBizLine}>{customerPhone}</p>
                <p className={styles.previewBizLine}>{customerEmail}</p>
                <p className={styles.previewBizLine}>{address}</p>
              </div>
            </div>

            <table className={styles.previewItemsTable}>
              <thead>
                <tr>
                  <th className={styles.previewItemsTh}>Item</th>
                  <th className={styles.previewItemsThRight}>Qty</th>
                  <th className={styles.previewItemsThRight}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item, i) => (
                  <tr key={i}>
                    <td className={styles.previewItemsTd}>{item.name}</td>
                    <td className={styles.previewItemsTdRight}>{item.quantity}</td>
                    <td className={styles.previewItemsTdRight}>MVR {item.subtotal?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.previewBreakdown}>
              <div className={styles.previewBreakdownRow}>
                <span>Subtotal</span>
                <span>MVR {invoice.itemsTotal?.toFixed(2)}</span>
              </div>
              <div className={styles.previewBreakdownRow}>
                <span>Discount</span>
                <span>{discount > 0 ? `- MVR ${discount.toFixed(2)}` : "—"}</span>
              </div>
              <div className={styles.previewBreakdownRow}>
                <span>Delivery Fee</span>
                <span>{invoice.deliveryCharge > 0 ? `MVR ${invoice.deliveryCharge.toFixed(2)}` : "—"}</span>
              </div>
              <div className={`${styles.previewBreakdownRow} ${styles.previewGrandTotal}`}>
                <span>Total</span>
                <span>MVR {invoice.totalAmount?.toFixed(2)}</span>
              </div>
            </div>

            <div className={styles.previewFooter}>
              <QRPlaceholder />
              <div>
                <p className={styles.previewThanks}>Thank you for your purchase!</p>
                <p className={styles.previewBizLine}>We appreciate your business.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Order Items + Summary ── */}
      <div className={styles.bottomGrid}>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Order Items</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>#</th>
                <th className={styles.th}>Product</th>
                <th className={styles.th}>SKU</th>
                <th className={styles.thRight}>Quantity</th>
                <th className={styles.thRight}>Unit Price</th>
                <th className={styles.thRight}>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items?.map((item, i) => (
                <tr key={i}>
                  <td className={styles.td}>{i + 1}</td>
                  <td className={styles.td}>{item.name}</td>
                  <td className={styles.td}>{item.sku ?? "—"}</td>
                  <td className={styles.tdRight}>{item.quantity}</td>
                  <td className={styles.tdRight}>MVR {item.price?.toFixed(2)}</td>
                  <td className={styles.tdRight}>MVR {item.subtotal?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Summary</h2>
          <div className={styles.summaryRows}>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>MVR {invoice.itemsTotal?.toFixed(2)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Discount</span>
              <span>{discount > 0 ? `- MVR ${discount.toFixed(2)}` : "—"}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Delivery Fee</span>
              <span>{invoice.deliveryCharge > 0 ? `MVR ${invoice.deliveryCharge.toFixed(2)}` : "—"}</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.grandTotal}`}>
              <span>Grand Total</span>
              <span>MVR {invoice.totalAmount?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Invoice History ── */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Invoice History</h2>
        {isOrderLoading ? (
          <p className={styles.previewHint}>Loading history…</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>#</th>
                <th className={styles.th}>Action</th>
                <th className={styles.th}>By</th>
                <th className={styles.th}>Date</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Note</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.num}>
                  <td className={styles.td}>{h.num}</td>
                  <td className={styles.td}>{h.action}</td>
                  <td className={styles.td}>{h.by}</td>
                  <td className={styles.td}>{formatDateTime(h.at)}</td>
                  <td className={styles.td}><span className={styles.badge} data-tone="green">Completed</span></td>
                  <td className={styles.td}>{h.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────── */

function DetailRow({ icon, label, value, children }) {
  return (
    <div className={styles.detailRow}>
      <span className={styles.detailIcon}>{icon}</span>
      <div>
        <p className={styles.detailLabel}>{label}</p>
        {children ?? <p className={styles.detailValue}>{value}</p>}
      </div>
    </div>
  );
}

function QRPlaceholder() {
  // Decorative QR-style pattern (not a real scannable code) — purely visual,
  // matching the look of the reference design's invoice preview.
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className={styles.qr}>
      <rect width="56" height="56" fill="white" />
      {[...Array(7)].map((_, r) =>
        [...Array(7)].map((_, c) => (
          (r + c * 3) % 5 < 2 || (r === 0 || r === 6 || c === 0 || c === 6) ? (
            <rect key={`${r}-${c}`} x={r * 8} y={c * 8} width="7" height="7" fill="#111" />
          ) : null
        ))
      )}
    </svg>
  );
}

/* ── Icons (outline style, matching the sidebar's icon convention) ──────── */

const iconProps = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };

function DocumentIcon() {
  return (
    <svg {...iconProps}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

function ReceiptIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 2h16v20l-3-2-3 2-3-2-3 2-3-2-1 2z" />
      <line x1="8" y1="8"  x2="16" y2="8" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8"  y1="2" x2="8"  y2="6" />
      <line x1="3"  y1="10" x2="21" y2="10" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg {...iconProps}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg {...iconProps}>
      <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5z" />
      <path d="M17 12h.01" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg {...iconProps}>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg {...iconProps}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 6l10 7 10-7" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 22s7-7.4 7-12a7 7 0 1 0-14 0c0 4.6 7 12 7 12z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg {...iconProps}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="13" y2="17" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg {...iconProps} width="14" height="14">
      <path d="M12 3v12" />
      <path d="M7 10l5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

function PrintIcon() {
  return (
    <svg {...iconProps} width="14" height="14">
      <path d="M6 9V2h12v7" />
      <rect x="4" y="9" width="16" height="8" rx="1" />
      <path d="M6 17v5h12v-5" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg {...iconProps} width="18" height="18">
      <path d="M12 2 1 21h22z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}