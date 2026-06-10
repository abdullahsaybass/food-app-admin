// src/app/routes/appRoutes.jsx

import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import AuthGuard from '../guards/AuthGuard';

import AdminLayout from '../../shared/layout/AdminLayout';
import LoginPage from '../../features/auth/pages/LoginPage';
import DashboardPage from '../../features/dashboard/DashboardPage';
import ProductListPage from '../../features/product/pages/ProductListPage';
import UsersPage from '../../features/user/pages/UsersPage';
import OrdersPage      from '../../features/order/pages/OrdersPage';
import OrderDetailPage from '../../features/order/pages/OrderDetailPage';

const router = createBrowserRouter([
  // ✅ MAIN APP (protected)
  {
    path: '/',
    element: (
      <AuthGuard>
        <AdminLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <DashboardPage /> }, // 👈 Dashboard as default home
      { path: 'products', element: <ProductListPage /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'orders/:id', element: <OrderDetailPage /> },
      { path: 'users', element: <UsersPage /> },
    ],
  },

  // ✅ LOGIN
  {
    path: '/login',
    element: <LoginPage />,
  },

  // optional
  {
    path: '/unauthorized',
    element: <div style={{ padding: 40 }}>Not authorized</div>,
  },

  {
    path: '*',
    element: <div style={{ padding: 40 }}>404 — Page not found</div>,
  },
 
  
]);

export default function Router() {
  return <RouterProvider router={router} />;
}