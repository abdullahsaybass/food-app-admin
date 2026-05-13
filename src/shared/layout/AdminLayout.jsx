// src/shared/components/layout/AdminLayout.jsx

import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import './AdminLayout.css';

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <Sidebar />                  {/* ← left panel */}
      <main className="admin-main">
        <Outlet />                 {/* ← page renders here (ProductListPage etc.) */}
      </main>
    </div>
  );
}