import { useState, useMemo } from 'react';
import { useUsers, useUpdateUser, useDeleteUser } from '../hooks/useUsers';
import './UsersPage.css';

/* ─── helpers ─────────────────────────────────────────── */
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function getInitials(name = '') {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

const AVATAR_COLORS = [
  '#f97316', '#ef4444', '#8b5cf6', '#06b6d4',
  '#10b981', '#f59e0b', '#ec4899', '#3b82f6',
];
function avatarColor(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

const ROLE_LABELS = { customer: 'Customer', delivery: 'Delivery', staff: 'Staff' };
const LIMIT = 10;

/* ─── Address helper ──────────────────────────────────── */
function formatAddress(addresses = []) {
  if (!addresses || addresses.length === 0) return '—';
  const addr = addresses.find((a) => a.isDefault) ?? addresses[0];
  const parts = [addr.street, addr.city, addr.state, addr.postalCode, addr.country].filter(Boolean);
  return parts.length ? parts.join(', ') : '—';
}

/* ─── StatCard ────────────────────────────────────────── */
function StatCard({ label, value, delta, positive, icon }) {
  return (
    <div className="up-stat-card">
      <div className="up-stat-header">
        <span className="up-stat-icon">{icon}</span>
      </div>
      <p className="up-stat-label">{label}</p>
      <h3 className="up-stat-value">{value}</h3>
      {delta && (
        <p className={`up-stat-delta ${positive ? 'positive' : 'negative'}`}>
          {delta} compared to last month
        </p>
      )}
    </div>
  );
}

/* ─── Avatar ──────────────────────────────────────────── */
function Avatar({ name, url }) {
  if (url) return <img className="up-avatar" src={url} alt={name} />;
  return (
    <span className="up-avatar up-avatar--initials" style={{ background: avatarColor(name) }}>
      {getInitials(name)}
    </span>
  );
}

/* ─── StatusBadge ─────────────────────────────────────── */
function StatusBadge({ status }) {
  return (
    <span className={`up-badge up-badge--${status}`}>
      <span className="up-badge-dot" />
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : '—'}
    </span>
  );
}

/* ─── ActionMenu ──────────────────────────────────────── */
function ActionMenu({ status, onToggleStatus, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="up-action-wrap">
      <button className="up-action-btn" onClick={() => setOpen((o) => !o)}>⋯</button>
      {open && (
        <div className="up-dropdown" onMouseLeave={() => setOpen(false)}>
          <button
            className="up-dropdown-item"
            onClick={() => { onToggleStatus(); setOpen(false); }}
          >
            {status === 'active' ? '🚫 Deactivate' : '✅ Activate'}
          </button>
          <button
            className="up-dropdown-item up-dropdown-item--danger"
            onClick={() => { onDelete(); setOpen(false); }}
          >
            🗑 Delete
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────── */
export default function UsersPage() {
  const { users, loading, error, refetch } = useUsers();
  const { update } = useUpdateUser();
  const { remove } = useDeleteUser();

  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('');
  const [roleFilter, setRole]     = useState('');
  const [selected, setSelected]   = useState(new Set());

  // exclude admins + apply filters
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return users.filter((u) => {
      if (u.role === 'admin') return false;
      const matchSearch =
        !q ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.includes(q);
      const matchStatus = !statusFilter || u.status === statusFilter;
      const matchRole   = !roleFilter   || u.role   === roleFilter;
      return matchSearch && matchStatus && matchRole;
    });
  }, [users, search, statusFilter, roleFilter]);

  // pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * LIMIT, safePage * LIMIT);

  // stats (non-admin users only)
  const nonAdmins     = users.filter((u) => u.role !== 'admin');
  const activeCount   = nonAdmins.filter((u) => u.isActive === true).length;
  const inactiveCount = nonAdmins.filter((u) => u.isActive === false).length;
  const thisMonth     = useMemo(() => {
    const now = new Date();
    return nonAdmins.filter((u) => {
      const d = new Date(u.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [users]);

  // selection
  const allIds      = paginated.map((u) => u._id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));
  const toggleAll   = () => setSelected(allSelected ? new Set() : new Set(allIds));
  const toggleOne   = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // actions
  const handleToggleStatus = async (user) => {
    const newStatus = user.isActive ? false : true;
    await update(user._id, { isActive: newStatus });
    refetch();
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${user.name}?`)) return;
    await remove(user._id);
    refetch();
  };

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <div className="up-page">

      {/* Stats */}
      <div className="up-stats-row">
        <StatCard label="Total Users"    value={nonAdmins.length} delta="+2%" positive icon={<UsersIcon />}    />
        <StatCard label="Active Users"   value={activeCount}      delta="-5%"          icon={<ActiveIcon />}   />
        <StatCard label="New This Month" value={thisMonth}        delta="+7%" positive icon={<NewIcon />}      />
        <StatCard label="Inactive Users" value={inactiveCount}    delta="-2%"          icon={<InactiveIcon />} />
      </div>

      {/* Table card */}
      <div className="up-card">

        {/* Toolbar */}
        <div className="up-toolbar">
          <h2 className="up-table-title">
            User List{' '}
            {filtered.length > 0 && (
              <span className="up-total-badge">(Total {filtered.length})</span>
            )}
          </h2>
          <div className="up-toolbar-right">
            <div className="up-search-wrap">
              <SearchIcon />
              <input
                className="up-search"
                placeholder="Search by name, email, phone..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            <select
              className="up-filter-select"
              value={statusFilter}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>

            <select
              className="up-filter-select"
              value={roleFilter}
              onChange={(e) => { setRole(e.target.value); setPage(1); }}
            >
              <option value="">All Roles</option>
              <option value="customer">Customer</option>
              <option value="delivery">Delivery</option>
              <option value="staff">Staff</option>
            </select>

            <button className="up-btn-primary">+ Add User</button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="up-error-bar">
            ⚠️ {error} —{' '}
            <button onClick={refetch} className="up-retry-btn">Retry</button>
          </div>
        )}

        {/* Table */}
        <div className="up-table-wrap">
          {loading && (
            <div className="up-table-overlay"><span className="up-spinner" /></div>
          )}
          <table className="up-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                </th>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Role</th>
                <th>Status</th>
                <th>Join Date</th>
                <th style={{ width: 60 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 10 }).map((_, j) => (
                      <td key={j}><span className="up-skeleton" /></td>
                    ))}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="up-empty">
                    <EmptyIcon />
                    <p>
                      {search || statusFilter || roleFilter
                        ? 'No users match your filters'
                        : 'No users found'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginated.map((user, idx) => {
                  const rowNum    = (safePage - 1) * LIMIT + idx + 1;
                  const isChecked = selected.has(user._id);
                  return (
                    <tr key={user._id} className={isChecked ? 'up-row--selected' : ''}>
                      <td>
                        <input type="checkbox" checked={isChecked} onChange={() => toggleOne(user._id)} />
                      </td>
                      <td className="up-cell-muted">USR-{String(rowNum).padStart(3, '0')}</td>
                      <td>
                        <div className="up-name-cell">
                          <Avatar name={user.name} url={user.profilePic?.url} />
                          <span className="up-name-text">{user.name}</span>
                        </div>
                      </td>
                      <td className="up-cell-muted">{user.email}</td>
                      <td className="up-cell-muted">{user.phone ?? '—'}</td>
                      <td className="up-cell-muted">{formatAddress(user.addresses)}</td> {/* ✅ addresses array */}
                      <td>
                        <span className={`up-role-chip up-role-chip--${user.role}`}>
                          {ROLE_LABELS[user.role] ?? user.role}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={user.isActive ? 'active' : 'inactive'} /> {/* ✅ isActive */}
                      </td>
                      <td className="up-cell-muted">{fmtDate(user.createdAt)}</td>
                      <td>
                        <ActionMenu
                          status={user.isActive ? 'active' : 'inactive'}
                          onToggleStatus={() => handleToggleStatus(user)}
                          onDelete={() => handleDelete(user)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="up-table-footer">
          <p className="up-page-info">
            {filtered.length === 0
              ? 'No entries'
              : `Showing ${(safePage - 1) * LIMIT + 1} to ${Math.min(safePage * LIMIT, filtered.length)} of ${filtered.length} entries`}
          </p>
          <div className="up-pagination">
            <button
              className="up-page-btn"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  className={`up-page-btn up-page-num ${safePage === p ? 'up-page-btn--active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              );
            })}

            <button
              className="up-page-btn"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ─── Icons ───────────────────────────────────────────── */
function UsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  );
}
function ActiveIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}
function NewIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  );
}
function InactiveIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}
function EmptyIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  );
}