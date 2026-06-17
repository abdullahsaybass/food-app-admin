// ─────────────────────────────────────────────────────────────────────────────
// INTEGRATION GUIDE  —  Category Feature
// ─────────────────────────────────────────────────────────────────────────────
//
// 1.  COPY the entire "category/" folder into:
//         src/features/category/
//
// 2.  ADD ROUTES  ─  in src/app/routes/appRoutes.jsx
// ─────────────────────────────────────────────────────────────────────────────

// ── Imports to add ──
import { AllCategoriesPage, AddCategoryPage } from "../features/category";

// ── Add inside your <Route> tree (wrapped in AuthGuard / AdminLayout) ──
//
//   <Route path="categories" element={<AllCategoriesPage />} />
//   <Route path="categories/add" element={<AddCategoryPage />} />
//
// Full example (adjust to match your existing route nesting):
//
//   <Route element={<AuthGuard />}>
//     <Route element={<AdminLayout />}>
//       ...existing routes...
//       <Route path="categories"     element={<AllCategoriesPage />} />
//       <Route path="categories/add" element={<AddCategoryPage />} />
//     </Route>
//   </Route>


// ─────────────────────────────────────────────────────────────────────────────
// 3.  SIDEBAR  ─  in src/components/layout/Sidebar.jsx
// ─────────────────────────────────────────────────────────────────────────────
//
// Add a "Categories" nav item. Find where "Banners" or "Products" is defined
// in your navItems array and insert after it:
//
//   {
//     label: "Categories",
//     icon: <CategoryIcon />,          // use whichever icon matches your sidebar style
//     path: "/categories",
//     children: [
//       { label: "All Categories", path: "/categories" },
//       { label: "Add Category",   path: "/categories/add" },
//     ],
//   },
//
// If your sidebar uses a flat list (no children), just add:
//   { label: "Categories", icon: <...>, path: "/categories" }


// ─────────────────────────────────────────────────────────────────────────────
// 4.  UPLOAD ENDPOINT  ─  src/features/category/api/category.api.js
// ─────────────────────────────────────────────────────────────────────────────
//
// The `uploadCategoryImage` function POSTs to "/upload".
// Adjust the path to match your backend's image upload endpoint, e.g.:
//
//   POST /api/v1/upload          → change BASE to "/upload"
//   POST /api/v1/media/upload    → change BASE to "/media/upload"
//
// The backend should respond with { url, publicId } (or { url, public_id }).
// Check your existing product upload flow for the exact endpoint.


// ─────────────────────────────────────────────────────────────────────────────
// 5.  BACKEND  ─  No changes needed
// ─────────────────────────────────────────────────────────────────────────────
//
// The backend already has full category CRUD:
//   GET    /categories           (public)
//   GET    /categories/:id       (public)
//   POST   /categories           (admin/superadmin)
//   PATCH  /categories/:id       (admin/superadmin)
//   DELETE /categories/:id       (admin/superadmin — soft delete)
//
// The frontend maps to these endpoints via httpClient (with auth interceptors).