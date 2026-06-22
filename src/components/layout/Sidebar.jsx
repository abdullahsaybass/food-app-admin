import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import './Sidebar.css';

const NAV_ITEMS = [
  {
    label: 'Main',
    links: [
      { to: '/',            label: 'Overview',   icon: <OverviewIcon />, end: true },
      {
        key: 'products',
        label: 'Products',
        icon: <ProductsIcon />,
        to: '/products',
        children: [
          { to: '/products',     label: 'All Products', end: true },
          { to: '/products/add', label: 'Add Product',  icon: <AddProductIcon /> },
        ],
      },
      { to: '/orders',      label: 'Orders',     icon: <OrderIcon />   },
      
      {
        key: 'categories',
        label: 'Categories',
        icon: <CatIcon />,
        to: '/categories',
        children: [
          { to: '/categories',     label: 'All Categories', end: true },
          { to: '/categories/add', label: 'Add Category',  icon: <AddCategoryIcon /> },
        ],
      },
      { to: '/users',       label: 'Users',      icon: <UsersIcon />   },
      { to: '/banners',     label: 'Banners',    icon: <BannerIcon />  },
      { to: '/coupons',     label: 'Coupons',    icon: <CouponIcon />  },
    
      { to: '/invoice',     label: 'Invoice',    icon: <InvoiceIcon /> },
    ],
  },
 
];

export default function Sidebar() {
  const logout = useAuthStore((s) => s.logout);
  const user   = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  // Auto-expand a parent menu if the current route matches one of its children
  const initialExpanded = {};
  NAV_ITEMS.forEach((section) => {
    section.links.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some((child) =>
          child.end
            ? location.pathname === child.to
            : location.pathname.startsWith(child.to)
        );
        if (isChildActive) initialExpanded[item.key] = true;
      }
    });
  });

  const [expanded, setExpanded] = useState(initialExpanded);

  // Keep parent menus open when navigating to a child route
  useEffect(() => {
    const active = {};
    NAV_ITEMS.forEach((section) => {
      section.links.forEach((item) => {
        if (item.children) {
          const isChildActive = item.children.some((child) =>
            child.end
              ? location.pathname === child.to
              : location.pathname.startsWith(child.to)
          );
          if (isChildActive) active[item.key] = true;
        }
      });
    });
    setExpanded((prev) => ({ ...prev, ...active }));
  }, [location.pathname]);

  const toggleExpanded = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <img src="/src/assets/vfresh.png" alt="VFresh" className="logo-img" />
      </div>

      {/* Nav sections */}
      {NAV_ITEMS.map((section) => (
        <div key={section.label} className="sidebar-section">
          <p className="sidebar-section-label">{section.label}</p>
          {section.links.map((item) => {
            if (item.children) {
              const isOpen = !!expanded[item.key];
              const isParentActive = item.children.some((child) =>
                child.end
                  ? location.pathname === child.to
                  : location.pathname.startsWith(child.to)
              );

              return (
                <div key={item.key} className="sidebar-group">
                  <button
                    type="button"
                    className={`sidebar-link sidebar-link--parent ${isParentActive ? 'sidebar-link--active' : ''}`}
                    onClick={() => toggleExpanded(item.key)}
                  >
                    <span className="sidebar-link-icon">{item.icon}</span>
                    <span className="sidebar-link-label">{item.label}</span>
                    <span className={`sidebar-chevron ${isOpen ? 'sidebar-chevron--open' : ''}`}>
                      <ChevronIcon />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="sidebar-submenu">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          end={child.end}
                          className={({ isActive }) =>
                            `sidebar-link sidebar-sublink ${isActive ? 'sidebar-link--active' : ''}`
                          }
                        >
                          {child.icon && <span className="sidebar-link-icon">{child.icon}</span>}
                          <span className="sidebar-link-label">{child.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
                }
              >
                <span className="sidebar-link-icon">{item.icon}</span>
                <span className="sidebar-link-label">{item.label}</span>
                {item.badge && (
                  <span className="sidebar-badge">{item.badge}</span>
                )}
              </NavLink>
            );
          })}
        </div>
      ))}

      {/* Spacer pushes logout to bottom */}
      <div style={{ flex: 1 }} />

      {/* User profile strip + Logout */}
      <div className="sidebar-footer">
        {user && (
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} />
              ) : (
                <span>{user.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{user.name}</p>
              <p className="sidebar-user-role">{user.role}</p>
            </div>
          </div>
        )}

        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <LogoutIcon />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

/* ── SVG icons ──────────────────────────────────────────── */
function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  );
}
function OverviewIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  );
}
function AddProductIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
      <line x1="12" y1="9" x2="12" y2="15"/>
      <line x1="9" y1="12" x2="15" y2="12"/>
    </svg>
  );
}
function ProductsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
    </svg>
  );
}
function OrderIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
    </svg>
  );
}
function FavIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/>
    </svg>
  );
}
function CatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
    </svg>
  );
}
function AddCategoryIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
      <line x1="12" y1="10" x2="12" y2="16"/>
      <line x1="9" y1="13" x2="15" y2="13"/>
    </svg>
  );
}
// ← new
function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/>
      <path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  );
}
function MsgIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  );
}
function BannerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="10" r="1.5" />
      <path d="M21 15l-5-5L5 19" />
    </svg>
  );
}
function InvoiceIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  );
}
function FeedbackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
      <line x1="9" y1="9" x2="9.01" y2="9"/>
      <line x1="15" y1="9" x2="15.01" y2="9"/>
    </svg>
  );
}
function SettingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M2 12h2M20 12h2"/>
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}
function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}
function CouponIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  );
}