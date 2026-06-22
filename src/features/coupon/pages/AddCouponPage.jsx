// features/coupon/pages/AddCouponPage.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useCoupon from "../hooks/useCoupon";
import DeleteCouponModal from "../components/DeleteCouponModal";
import styles from "./AddCouponPage.module.css";

const DISCOUNT_TYPES = [
  { value: "percentage", label: "Percentage Discount" },
  { value: "fixed",      label: "Fixed Amount" },
  { value: "free_shipping", label: "Free Shipping" },
];

const PAGE_SIZE = 10;

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtDateTime = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  return dt.toLocaleString("en-US", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
};

const toLocalInput = (isoStr) => {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const AddCouponPage = () => {
  const navigate  = useNavigate();
  const { id }    = useParams();
  const isEdit    = Boolean(id);

  const { coupons, total, loading, submitting, error, loadCoupons, getCouponById, addCoupon, editCoupon, removeCoupon } =
    useCoupon({ autoLoad: true });

  /* ── Form state ── */
  const [code, setCode]                 = useState("");
  const [description, setDescription]  = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [maxDiscount, setMaxDiscount]   = useState("");
  const [minOrder, setMinOrder]         = useState("");
  const [usageLimit, setUsageLimit]     = useState("");
  const [usageLimitPerUser, setUsageLimitPerUser] = useState("");
  const [startDate, setStartDate]       = useState("");
  const [endDate, setEndDate]           = useState("");
  const [isActive, setIsActive]         = useState(true);
  const [errors, setErrors]             = useState({});
  const [toast, setToast]               = useState(null);
  const [loadingForm, setLoadingForm]   = useState(isEdit);

  /* ── Edit meta ── */
  const [meta, setMeta]         = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  /* ── List state ── */
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sortFilter, setSortFilter]   = useState("Newest");
  const [page, setPage]               = useState(1);
  const [perPage, setPerPage]         = useState(10);

  /* ── Load coupon for edit ── */
  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    (async () => {
      setLoadingForm(true);
      try {
        const c = await getCouponById(id);
        if (cancelled || !c) return;
        setCode(c.code ?? "");
        setDescription(c.description ?? "");
        setDiscountType(c.discountType ?? "percentage");
        setDiscountValue(c.discountValue ?? "");
        setMaxDiscount(c.maxDiscount ?? "");
        setMinOrder(c.minOrderValue ?? c.minOrder ?? "");
        setUsageLimit(c.usageLimit ?? "");
        setUsageLimitPerUser(c.usageLimitPerUser ?? "");
        setStartDate(toLocalInput(c.startDate));
        setEndDate(toLocalInput(c.endDate));
        setIsActive(c.isActive ?? true);
        setMeta({ createdAt: c.createdAt, createdBy: c.createdBy ?? "Admin" });
      } catch (err) {
        setErrors((e) => ({ ...e, submit: err.message }));
      } finally {
        if (!cancelled) setLoadingForm(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isEdit, id, getCouponById]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  /* ── Validate ── */
  const validate = () => {
    const errs = {};
    if (!code.trim()) errs.code = "Coupon code is required.";
    if (discountType !== "free_shipping") {
      if (!discountValue || Number(discountValue) <= 0) errs.discountValue = "Enter a valid discount value.";
      if (discountType === "percentage" && Number(discountValue) > 100) errs.discountValue = "Percentage cannot exceed 100.";
    }
    if (!startDate) errs.startDate = "Start date is required.";
    if (!endDate)   errs.endDate   = "End date is required.";
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) errs.endDate = "End date must be after start date.";
    return errs;
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    const payload = {
      code: code.trim().toUpperCase(),
      description: description.trim(),
      discountType,
      discountValue: discountType !== "free_shipping" ? Number(discountValue) : 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : 0,
      minOrderValue: minOrder ? Number(minOrder) : 0,
      usageLimit: usageLimit ? Number(usageLimit) : 0,
      usageLimitPerUser: usageLimitPerUser ? Number(usageLimitPerUser) : 0,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      endDate:   endDate   ? new Date(endDate).toISOString()   : null,
      isActive,
    };
    try {
      if (isEdit) {
        await editCoupon(id, payload);
        showToast("Coupon updated successfully.");
        loadCoupons();
      } else {
        await addCoupon(payload);
        showToast("Coupon created successfully.");
        loadCoupons();
        resetForm();
      }
    } catch (err) {
      setErrors((e) => ({ ...e, submit: err.message }));
    }
  };

  const resetForm = () => {
    setCode(""); setDescription(""); setDiscountType("percentage");
    setDiscountValue(""); setMaxDiscount(""); setMinOrder("");
    setUsageLimit(""); setUsageLimitPerUser("");
    setStartDate(""); setEndDate(""); setIsActive(true);
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    try {
      await removeCoupon(deleteTarget._id ?? deleteTarget.id);
      setDeleteTarget(null);
      showToast("Coupon deleted.");
      if (isEdit) navigate("/coupons");
    } catch (err) {
      showToast(err.message, "error");
      setDeleteTarget(null);
    }
  };

  /* ── Preview computed values ── */
  const previewLabel = discountType === "percentage"
    ? `${discountValue || "0"}% OFF`
    : discountType === "fixed"
    ? `MVR ${discountValue || "0"} OFF`
    : "FREE SHIPPING";

  const previewEndDate = endDate
    ? new Date(endDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

  /* ── List filtering ── */
  let filtered = coupons.filter((c) => {
    const matchSearch = !search ||
      (c.code ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (c.description ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "All Status" ||
      (statusFilter === "Active" && c.isActive) ||
      (statusFilter === "Inactive" && !c.isActive);
    return matchSearch && matchStatus;
  });

  if (sortFilter === "Newest") filtered = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (sortFilter === "Oldest") filtered = [...filtered].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const totalPages  = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const pageItems   = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const typeLabel = (t) => {
    if (t === "percentage")    return "Percentage";
    if (t === "fixed")         return "Fixed Amount";
    if (t === "free_shipping") return "Free Shipping";
    return t;
  };

  if (isEdit && loadingForm) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>
          <span className={styles.spinnerLg} />
          <p>Loading coupon…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>

      {/* ── Toast ── */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === "error" ? styles.toastError : styles.toastSuccess}`}>
          {toast.type === "error" ? "⚠️" : "✅"} {toast.msg}
        </div>
      )}

      {/* ── Breadcrumb ── */}
      <div className={styles.breadcrumb}>
        <button className={styles.breadcrumbLink} onClick={() => navigate("/")}>Dashboard</button>
        <ChevronIcon />
        <button className={styles.breadcrumbLink} onClick={() => navigate("/coupons")}>Coupons</button>
        <ChevronIcon />
        <span className={styles.breadcrumbCurrent}>{isEdit ? "Edit Coupon" : "Add Coupon"}</span>
      </div>

      {/* ── Page header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{isEdit ? "Edit Coupon" : "Add New Coupon"}</h1>
          <p className={styles.pageSub}>{isEdit ? "Update coupon details and discount rules" : "Create a new coupon and set discount rules"}</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.backBtn} onClick={() => navigate("/coupons")}>
            <ArrowLeftIcon /> Back to Coupons
          </button>
          <button className={styles.saveBtn} onClick={handleSubmit} disabled={submitting}>
            {submitting ? <span className={styles.spinnerSm} /> : <SaveIcon />}
            {isEdit ? "Save Changes" : "Save Coupon"}
          </button>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className={styles.layout}>

        {/* ── LEFT: Form ── */}
        <div className={styles.formCol}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Coupon Details</h2>

            {/* Row 1 */}
            <div className={styles.row3}>
              <div className={styles.field}>
                <label className={styles.label}>Coupon Code <span className={styles.req}>*</span></label>
                <input
                  className={`${styles.input} ${errors.code ? styles.inputErr : ""}`}
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SAVE20"
                />
                <p className={styles.hint}>Enter unique coupon code</p>
                {errors.code && <p className={styles.fieldError}>{errors.code}</p>}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Description</label>
                <input
                  className={styles.input}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="20% OFF on your order"
                />
                <p className={styles.hint}>Short description for this coupon</p>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Discount Type <span className={styles.req}>*</span></label>
                <select className={styles.input} value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
                  {DISCOUNT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <p className={styles.hint}>Select discount type</p>
              </div>
            </div>

            {/* Row 2 */}
            <div className={styles.row3}>
              <div className={styles.field}>
                <label className={styles.label}>
                  Discount Value {discountType !== "free_shipping" && <span className={styles.req}>*</span>}
                </label>
                <div className={styles.inputAddon}>
                  <input
                    type="number" min="0"
                    className={`${styles.input} ${errors.discountValue ? styles.inputErr : ""}`}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder="20"
                    disabled={discountType === "free_shipping"}
                  />
                  <span className={styles.addonLabel}>{discountType === "percentage" ? "%" : discountType === "fixed" ? "MVR" : "—"}</span>
                </div>
                <p className={styles.hint}>Enter discount value</p>
                {errors.discountValue && <p className={styles.fieldError}>{errors.discountValue}</p>}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Max Discount Amount</label>
                <div className={styles.inputAddon}>
                  <input
                    type="number" min="0"
                    className={styles.input}
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    placeholder="200"
                    disabled={discountType === "free_shipping"}
                  />
                  <span className={styles.addonLabel}>MVR</span>
                </div>
                <p className={styles.hint}>Maximum discount amount (0 for no limit)</p>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Minimum Order Value</label>
                <div className={styles.inputAddon}>
                  <input
                    type="number" min="0"
                    className={styles.input}
                    value={minOrder}
                    onChange={(e) => setMinOrder(e.target.value)}
                    placeholder="500"
                  />
                  <span className={styles.addonLabel}>MVR</span>
                </div>
                <p className={styles.hint}>Minimum order value to apply</p>
              </div>
            </div>

            {/* Row 3: Usage limits */}
            <div className={styles.row2}>
              <div className={styles.field}>
                <label className={styles.label}>Usage Limit (Total)</label>
                <input
                  type="number" min="0"
                  className={styles.input}
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  placeholder="1000"
                />
                <p className={styles.hint}>Total times this coupon can be used (0 for unlimited)</p>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Usage Limit Per User</label>
                <input
                  type="number" min="0"
                  className={styles.input}
                  value={usageLimitPerUser}
                  onChange={(e) => setUsageLimitPerUser(e.target.value)}
                  placeholder="1"
                />
                <p className={styles.hint}>Maximum uses per user (0 for unlimited)</p>
              </div>
            </div>

            {/* Row 4: Dates */}
            <div className={styles.row2}>
              <div className={styles.field}>
                <label className={styles.label}>Start Date <span className={styles.req}>*</span></label>
                <div className={styles.dateWrap}>
                  <CalendarIcon />
                  <input
                    type="datetime-local"
                    className={`${styles.input} ${styles.dateInput} ${errors.startDate ? styles.inputErr : ""}`}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <p className={styles.hint}>Coupon start date and time</p>
                {errors.startDate && <p className={styles.fieldError}>{errors.startDate}</p>}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>End Date <span className={styles.req}>*</span></label>
                <div className={styles.dateWrap}>
                  <CalendarIcon />
                  <input
                    type="datetime-local"
                    className={`${styles.input} ${styles.dateInput} ${errors.endDate ? styles.inputErr : ""}`}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <p className={styles.hint}>Coupon end date and time</p>
                {errors.endDate && <p className={styles.fieldError}>{errors.endDate}</p>}
              </div>
            </div>

            {/* Status toggle */}
            <div className={styles.field}>
              <label className={styles.label}>Status</label>
              <div className={styles.toggleRow}>
                <button
                  type="button"
                  className={`${styles.toggle} ${isActive ? styles.toggleOn : styles.toggleOff}`}
                  onClick={() => setIsActive((v) => !v)}
                  aria-pressed={isActive}
                >
                  <span className={styles.toggleThumb} />
                </button>
                <span className={styles.toggleLabel}>{isActive ? "Active" : "Inactive"}</span>
              </div>
              <p className={styles.hint}>Inactive coupons won&apos;t be available to users</p>
            </div>

            {errors.submit && <p className={styles.fieldError} style={{ marginTop: 8 }}>{errors.submit}</p>}
          </div>
        </div>

        {/* ── RIGHT: Preview + Info ── */}
        <aside className={styles.previewCol}>
          {/* Coupon Preview card */}
          <div className={styles.previewCard}>
            <h3 className={styles.previewTitle}>Coupon Preview</h3>
            <p className={styles.previewSub}>This is how the coupon will appear to customers.</p>

            <div className={styles.couponVisual}>
              <div className={styles.couponLeft}>
                <span className={styles.couponPercent}>{previewLabel}</span>
              </div>
              <div className={styles.couponRight}>
                <p className={styles.couponCode}>{code || "CODE"}</p>
                <p className={styles.couponDesc}>{description || "Discount on your order"}</p>
                <div className={styles.couponMeta}>
                  {minOrder && <span className={styles.couponMetaTag}>Min Order: MVR {minOrder}</span>}
                  {endDate   && <span className={styles.couponMetaTag}>Valid till: {previewEndDate}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Coupon Information */}
          <div className={styles.infoCard}>
            <h3 className={styles.infoCardTitle}>Coupon Information</h3>
            <div className={styles.infoTable}>
              <InfoRow icon={<DiscountTypeIcon />} label="Discount Type"      value={DISCOUNT_TYPES.find((t) => t.value === discountType)?.label ?? "—"} />
              <InfoRow icon={<PercentIcon />}      label="Discount Value"     value={discountType !== "free_shipping" ? `${discountValue || "—"}${discountType === "percentage" ? "%" : " MVR"}` : "—"} />
              <InfoRow icon={<MaxDiscIcon />}      label="Max Discount"       value={maxDiscount ? `MVR ${maxDiscount}` : "No limit"} />
              <InfoRow icon={<MinOrderIcon />}     label="Min Order Value"    value={minOrder    ? `MVR ${minOrder}` : "None"} />
              <InfoRow icon={<UsageIcon />}        label="Usage Limit (Total)" value={usageLimit ? `${usageLimit} times` : "Unlimited"} />
              <InfoRow icon={<UserIcon />}         label="Usage Limit Per User" value={usageLimitPerUser ? `${usageLimitPerUser} time per user` : "Unlimited"} />
              <InfoRow icon={<StatusIcon />}       label="Status"
                value={<span className={`${styles.statusBadge} ${isActive ? styles.statusActive : styles.statusInactive}`}>{isActive ? "Active" : "Inactive"}</span>}
              />
              {isEdit && meta && (
                <>
                  <InfoRow icon={<UserIcon />}     label="Created By"  value={meta.createdBy ?? "Admin"} />
                  <InfoRow icon={<CalendarIcon2 />} label="Created At" value={fmtDateTime(meta.createdAt)} />
                </>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* ── Coupons List ── */}
      <div className={styles.listCard}>
        <h2 className={styles.listTitle}>Coupons List</h2>

        {/* Toolbar */}
        <div className={styles.listToolbar}>
          <div className={styles.searchWrap}>
            <SearchIcon />
            <input
              className={styles.searchInput}
              placeholder="Search coupons..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className={styles.toolbarRight}>
            <select className={styles.filterSelect} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <select className={styles.filterSelect} value={`Sort by: ${sortFilter}`} onChange={(e) => setSortFilter(e.target.value.replace("Sort by: ", ""))}>
              <option>Sort by: Newest</option>
              <option>Sort by: Oldest</option>
            </select>
            <button className={styles.filterBtn}><FilterIcon /> Filter</button>
            <button className={styles.exportBtn}><ExportIcon /> Export</button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className={styles.loadingState}><span className={styles.spinnerLg} /><p>Loading…</p></div>
        ) : (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>COUPON CODE</th>
                    <th>TYPE</th>
                    <th>DISCOUNT</th>
                    <th>MIN ORDER</th>
                    <th>MAX DISCOUNT</th>
                    <th>USAGE</th>
                    <th>VALID TILL</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.length === 0 ? (
                    <tr>
                      <td colSpan={10} className={styles.emptyCell}>
                        No coupons found.
                      </td>
                    </tr>
                  ) : pageItems.map((c, idx) => {
                    const cId   = c._id ?? c.id;
                    const rowN  = (currentPage - 1) * perPage + idx + 1;
                    const used  = c.usedCount ?? c.usageCount ?? 0;
                    const limit = c.usageLimit ?? 0;
                    const pct   = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
                    const barColor = pct > 80 ? "#ef4444" : pct > 50 ? "#f59e0b" : "#16a34a";
                    return (
                      <tr key={cId} className={styles.tableRow}>
                        <td className={styles.rowNum}>{rowN}</td>
                        <td>
                          <p className={styles.couponCodeCell}>{c.code}</p>
                          <p className={styles.couponDescCell}>{c.description}</p>
                        </td>
                        <td>{typeLabel(c.discountType)}</td>
                        <td>
                          {c.discountType === "percentage" ? `${c.discountValue}%` :
                           c.discountType === "fixed"      ? `MVR ${c.discountValue}` : "—"}
                        </td>
                        <td>{c.minOrderValue ? `MVR ${c.minOrderValue}` : "MVR 0"}</td>
                        <td>{c.maxDiscount   ? `MVR ${c.maxDiscount}` : "MVR 0"}</td>
                        <td>
                          <div className={styles.usageWrap}>
                            <span className={styles.usageText}>{used} / {limit || "∞"}</span>
                            {limit > 0 && (
                              <div className={styles.progressBar}>
                                <div className={styles.progressFill} style={{ width: `${pct}%`, background: barColor }} />
                              </div>
                            )}
                          </div>
                        </td>
                        <td>{fmtDate(c.endDate)}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${c.isActive ? styles.statusActive : styles.statusInactive}`}>
                            {c.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actionBtns}>
                            <button
                              className={styles.actionEdit}
                              title="Edit"
                              onClick={() => navigate(`/coupons/${cId}/edit`)}
                            ><EditIcon /></button>
                            <button
                              className={styles.actionDelete}
                              title="Delete"
                              onClick={() => setDeleteTarget(c)}
                            ><TrashIcon /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className={styles.pagination}>
              <span className={styles.paginationInfo}>
                Showing {filtered.length === 0 ? 0 : (currentPage - 1) * perPage + 1} to{" "}
                {Math.min(currentPage * perPage, filtered.length)} of {filtered.length} coupons
              </span>
              <div className={styles.paginationControls}>
                <button className={styles.pageBtn} disabled={currentPage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>‹</button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let num = i + 1;
                  if (totalPages > 5 && currentPage > 3) num = currentPage - 2 + i;
                  if (num > totalPages) return null;
                  return (
                    <button key={num} className={`${styles.pageNum} ${num === currentPage ? styles.pageNumActive : ""}`} onClick={() => setPage(num)}>{num}</button>
                  );
                })}
                {totalPages > 5 && currentPage < totalPages - 2 && <span className={styles.pageDots}>…</span>}
                {totalPages > 5 && currentPage < totalPages - 1 && (
                  <button className={`${styles.pageNum} ${totalPages === currentPage ? styles.pageNumActive : ""}`} onClick={() => setPage(totalPages)}>{totalPages}</button>
                )}
                <button className={styles.pageBtn} disabled={currentPage === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>›</button>
                <select className={styles.perPageSelect} value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}>
                  {[10, 25, 50].map((n) => <option key={n} value={n}>{n} / page</option>)}
                </select>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete modal */}
      <DeleteCouponModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        submitting={submitting}
        couponCode={deleteTarget?.code ?? ""}
      />
    </div>
  );
};

export default AddCouponPage;

/* ── Small helper ── */
const InfoRow = ({ icon, label, value }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
    <span style={{ color: "#6b7280", flexShrink: 0 }}>{icon}</span>
    <span style={{ fontSize: 13, color: "#6b7280", minWidth: 130 }}>{label}</span>
    <span style={{ fontSize: 13, color: "#111", fontWeight: 500, marginLeft: "auto" }}>{value}</span>
  </div>
);

/* ── Icons ── */
function ChevronIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>;
}
function ArrowLeftIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>;
}
function SaveIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
}
function CalendarIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function CalendarIcon2() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function SearchIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function FilterIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
}
function ExportIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
}
function EditIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
}
function TrashIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>;
}
function DiscountTypeIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>; }
function PercentIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>; }
function MaxDiscIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>; }
function MinOrderIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.99-1.77L23 6H6"/></svg>; }
function UsageIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>; }
function UserIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function StatusIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>; }
