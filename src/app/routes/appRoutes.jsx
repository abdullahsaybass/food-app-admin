// src/app/routes/appRoutes.jsx

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AuthGuard from '../guards/AuthGuard';

import AdminLayout from '../../shared/layout/AdminLayout';
import LoginPage from '../../features/auth/pages/LoginPage';
import DashboardPage from '../../features/dashboard/DashboardPage';
import ProductListPage from '../../features/product/pages/ProductListPage';
import AddProductPage from '../../features/product/pages/AddProduct';
import UsersPage from '../../features/user/pages/UsersPage';
import OrdersPage      from '../../features/order/pages/OrdersPage';
import OrderDetailPage from '../../features/order/pages/OrderDetailPage';
import AllCategoriesPage from '../../features/catergory/pages/AllCategoriesPage';
import AddCategoryPage   from '../../features/catergory/pages/AddCategoryPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthGuard>
        <AdminLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'products', element: <ProductListPage /> },
      { path: 'products/add', element: <AddProductPage /> },
      { path: 'products/:id/edit', element: <AddProductPage /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'orders/:id', element: <OrderDetailPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'categories', element: <AllCategoriesPage /> },
      { path: 'categories/add', element: <AddCategoryPage /> },
      { path: 'categories/:id/edit', element: <AddCategoryPage /> },
    ],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/unauthorized', element: <div style={{ padding: 40 }}>Not authorized</div> },
  { path: '*', element: <div style={{ padding: 40 }}>404 — Page not found</div> },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}