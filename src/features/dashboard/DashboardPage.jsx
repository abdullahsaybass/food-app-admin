// src/features/dashboard/pages/DashboardPage.jsx

import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ordersApi } from '../order/api/api';
import { productApi } from '../product/api/api';
import { getAllUsers } from '../user/api/user.api';
import './Dashboardpage.css';

export default function DashboardPage() {
  const navigate = useNavigate();

  const { data: orderStats } = useQuery({
    queryKey: ['order-stats'],
    queryFn: ordersApi.admin.getStats,
    staleTime: 1000 * 60,
  });

  const { data: recentOrdersData } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: () => ordersApi.admin.getRecent({ limit: 5 }),
    staleTime: 1000 * 60,
  });

  const { data: lowStockData } = useQuery({
    queryKey: ['low-stock'],
    queryFn: productApi.getLowStock,
    staleTime: 1000 * 60,
  });

  const { data: productsData } = useQuery({
    queryKey: ['products-top', { page: 1, limit: 5 }],
    queryFn: () => productApi.list({ page: 1, limit: 5 }),
    staleTime: 1000 * 60,
  });

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
    staleTime: 1000 * 60,
  });

  const stats = orderStats?.data ?? orderStats ?? {};
  const recentOrders = recentOrdersData?.data ?? recentOrdersData?.orders ?? recentOrdersData ?? [];
 const lowStockProducts = Array.isArray(lowStockData?.data?.products)
  ? lowStockData.data.products
  : Array.isArray(lowStockData?.data)
  ? lowStockData.data
  : Array.isArray(lowStockData?.products)
  ? lowStockData.products
  : Array.isArray(lowStockData)
  ? lowStockData
  : [];
  console.log("lowStockData", lowStockData);
  const topProducts = productsData?.products ?? productsData ?? [];
  const totalUsers = Array.isArray(usersData) ? usersData.length : (usersData?.total ?? 0);

  const totalOrders = stats.totalOrders ?? 0;
  const totalRevenue = stats.totalRevenue ?? 0;
  const totalProducts = topProducts.length > 0 ? (productsData?.pagination?.total ?? topProducts.length) : 0;

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const maxSold = topProducts.length > 0
    ? Math.max(...topProducts.map(p => p.totalSold ?? p.soldCount ?? 500))
    : 1000;

  return (
    <div className="dash-wrap">

      {/* ── Top Bar ── */}
      <div className="dash-topbar">
        <div className="dash-topbar-left">
          <h1 className="dash-title">Dashboard</h1>
          <p className="dash-subtitle">Welcome back, Admin! 👋</p>
        </div>
        <div className="dash-topbar-right">
          <div className="dash-date-range">
            <CalendarIcon />
            <span>{dateStr}</span>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="dash-stats">
        <StatCard
          icon={<OrdersStatIcon />}
          iconBg="icon-bg--blue"
          label="Total Orders"
          value={totalOrders.toLocaleString()}
          change="+18.6%"
          positive
        />
        <StatCard
          icon={<RevenueStatIcon />}
          iconBg="icon-bg--green"
          label="Total Revenue"
          value={`$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change="+22.4%"
          positive
        />
        <StatCard
          icon={<ProductsStatIcon />}
          iconBg="icon-bg--purple"
          label="Total Products"
          value={totalProducts.toLocaleString() || '—'}
          change="+8.2%"
          positive
        />
        <StatCard
          icon={<CustomersStatIcon />}
          iconBg="icon-bg--orange"
          label="Total Customers"
          value={totalUsers.toLocaleString() || '—'}
          change="+16.7%"
          positive
        />
      </div>

      {/* ── Middle Row: Quick Actions + Low Stock ── */}
      <div className="dash-mid-row">

        {/* Quick Actions */}
        <div className="dash-card dash-quick-actions">
          <h2 className="dash-card-title">Quick Actions</h2>
          <div className="dash-actions-grid">
            <QuickAction icon={<PlusCircleIcon />} label="Add Product" onClick={() => navigate('/products/add')} color="action--green" />
            <QuickAction icon={<GridIcon />} label="Add Category" onClick={() => navigate('/categories/add')} color="action--orange" />
            <QuickAction icon={<CartActionIcon />} label="New Order" onClick={() => navigate('/orders')} color="action--blue" />
            <QuickAction icon={<CouponIcon />} label="Add Coupon" onClick={() => navigate('/coupons/add')} color="action--purple" />
            <QuickAction icon={<AddUserIcon />} label="Add Customer" onClick={() => navigate('/users')} color="action--teal" />
          </div>
        </div>

        {/* Low Stock */}
        <div className="dash-card dash-low-stock">
          <div className="dash-card-header">
            <h2 className="dash-card-title">Low Stock Products</h2>
            <button className="dash-view-all" onClick={() => navigate('/products')}>View All</button>
          </div>
          <div className="dash-low-list">
            {lowStockProducts.length === 0 ? (
              <div className="dash-empty">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="dash-low-item dash-low-item--skeleton">
                    <div className="skel skel-avatar" />
                    <div className="skel skel-lg" />
                    <div className="skel skel-sm" />
                    <div className="skel skel-badge" />
                  </div>
                ))}
              </div>
            ) : (
              lowStockProducts.slice(0, 5).map((product) => {
                const stock = product.totalStock ?? product.variants?.[0]?.quantity ?? 0;
                return (
                  <div key={product._id ?? product.id} className="dash-low-item">
                    <div className="dash-low-avatar">
                      {product.images?.[0]?.url
                        ? <img src={product.images[0].url} alt={product.name} />
                        : <span>{product.name?.[0]}</span>
                      }
                    </div>
                    <span className="dash-low-name">{product.name}</span>
                    <span className="dash-low-stock-num">Stock: {stock}</span>
                    <span className="dash-low-badge">Low Stock</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Recent Orders + Top Selling ── */}
      <div className="dash-bottom-row">

        {/* Recent Orders */}
        <div className="dash-card dash-recent-orders">
          <div className="dash-card-header">
            <h2 className="dash-card-title">Recent Orders</h2>
            <button className="dash-view-all" onClick={() => navigate('/orders')}>View All</button>
          </div>
          <div className="dash-orders-table-wrap">
            <table className="dash-orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="dash-orders-skeleton">
                        <td><div className="skel skel-md" /></td>
                        <td><div className="skel skel-lg" /></td>
                        <td><div className="skel skel-md" /></td>
                        <td><div className="skel skel-sm" /></td>
                        <td><div className="skel skel-badge" /></td>
                        <td><div className="skel skel-sm" /></td>
                      </tr>
                    ))
                  : recentOrders.map((order) => {
                      const orderId = order._id ?? order.id ?? '';
                      const shortId = `#ORD-${String(orderId).slice(-4).toUpperCase()}`;
                      const customerName = order.user?.name ?? order.customerName ?? 'Unknown';
                      const date = order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—';
                      const amount = `$${(order.totalAmount ?? 0).toFixed(2)}`;
                      const status = order.status ?? 'pending';
                      return (
                        <tr key={orderId} className="dash-order-row" onClick={() => navigate(`/orders/${orderId}`)}>
                          <td className="dash-order-id">{shortId}</td>
                          <td>{customerName}</td>
                          <td className="dash-order-date">{date}</td>
                          <td className="dash-order-amount">{amount}</td>
                          <td><StatusBadge status={status} /></td>
                          <td>
                            <button className="dash-eye-btn" onClick={(e) => { e.stopPropagation(); navigate(`/orders/${orderId}`); }}>
                              <EyeIcon />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                }
              </tbody>
            </table>
          </div>
          <button className="dash-view-all-orders" onClick={() => navigate('/orders')}>
            View All Orders <ArrowRightIcon />
          </button>
        </div>

        {/* Top Selling Products */}
        <div className="dash-card dash-top-selling">
          <div className="dash-card-header">
            <h2 className="dash-card-title">Top Selling Products</h2>
            <button className="dash-view-all" onClick={() => navigate('/products')}>View All</button>
          </div>
          <div className="dash-top-list">
            {topProducts.length === 0
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="dash-top-item">
                    <div className="skel skel-avatar" />
                    <div className="dash-top-info">
                      <div className="skel skel-lg" />
                      <div className="skel skel-bar" />
                    </div>
                    <div className="skel skel-sm" />
                  </div>
                ))
              : topProducts.map((product) => {
                  const sold = product.totalSold ?? product.soldCount ?? Math.floor(Math.random() * 800 + 200);
                  const pct = Math.min(100, Math.round((sold / maxSold) * 100));
                  return (
                    <div key={product._id ?? product.id} className="dash-top-item">
                      <div className="dash-top-avatar">
                        {product.images?.[0]?.url
                          ? <img src={product.images[0].url} alt={product.name} />
                          : <span>{product.name?.[0]}</span>
                        }
                      </div>
                      <div className="dash-top-info">
                        <span className="dash-top-name">{product.name}</span>
                        <div className="dash-top-bar-wrap">
                          <div className="dash-top-bar" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <span className="dash-top-sold">{sold.toLocaleString()} Sold</span>
                    </div>
                  );
                })
            }
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────── */

function StatCard({ icon, iconBg, label, value, change, positive }) {
  return (
    <div className="dash-stat-card">
      <div className={`dash-stat-icon ${iconBg}`}>{icon}</div>
      <div className="dash-stat-info">
        <p className="dash-stat-label">{label}</p>
        <p className="dash-stat-value">{value}</p>
        <p className={`dash-stat-change ${positive ? 'change--up' : 'change--down'}`}>
          {positive ? '↑' : '↓'} {change} <span>vs last 30 days</span>
        </p>
      </div>
    </div>
  );
}

function QuickAction({ icon, label, onClick, color }) {
  return (
    <button className={`dash-quick-btn ${color}`} onClick={onClick}>
      <span className="dash-quick-icon">{icon}</span>
      <span className="dash-quick-label">{label}</span>
    </button>
  );
}

function StatusBadge({ status }) {
  const map = {
    delivered:        'badge--delivered',
    completed:        'badge--delivered',
    processing:       'badge--processing',
    pending:          'badge--processing',
    out_for_delivery: 'badge--otd',
    shipped:          'badge--otd',
    cancelled:        'badge--cancelled',
    canceled:         'badge--cancelled',
  };
  const cls = map[status?.toLowerCase()] ?? 'badge--processing';
  const labels = {
    delivered: 'Delivered', completed: 'Delivered',
    processing: 'Processing', pending: 'Processing',
    out_for_delivery: 'Out for Delivery', shipped: 'Shipped',
    cancelled: 'Cancelled', canceled: 'Cancelled',
  };
  return <span className={`dash-status-badge ${cls}`}>{labels[status?.toLowerCase()] ?? status}</span>;
}

/* ── Icons ──────────────────────────────────────────────── */
function CalendarIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function OrdersStatIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>;
}
function RevenueStatIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>;
}
function ProductsStatIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>;
}
function CustomersStatIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
}
function PlusCircleIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>;
}
function GridIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
}
function CartActionIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.98-1.73l1.38-7.42H6"/></svg>;
}
function CouponIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
}
function AddUserIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>;
}
function EyeIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}
function ArrowRightIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
}