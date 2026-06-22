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
import AllCouponsPage    from '../../features/coupon/pages/AllCouponsPage';
import AddCouponPage     from '../../features/coupon/pages/AddCouponPage';
import AllBannersPage    from '../../features/banner/pages/AllBannersPage';
import InvoicesPage      from '../../features/invoice/pages/InvoicesPage';
import InvoiceDetailPage from '../../features/invoice/pages/InvoiceDetailPage';

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
      { path: 'banners', element: <AllBannersPage /> },
      { path: 'categories', element: <AllCategoriesPage /> },
      { path: 'categories/add', element: <AddCategoryPage /> },
      { path: 'categories/:id/edit', element: <AddCategoryPage /> },
      { path: 'coupons', element: <AllCouponsPage /> },
      { path: 'coupons/add', element: <AddCouponPage /> },
      { path: 'coupons/:id/edit', element: <AddCouponPage /> },
      { path: 'invoice', element: <InvoicesPage /> },
      { path: 'invoice/:id', element: <InvoiceDetailPage /> },
    ],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/unauthorized', element: <div style={{ padding: 40 }}>Not authorized</div> },
  { path: '*', element: <div style={{ padding: 40 }}>404 — Page not found</div> },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}