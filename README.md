# Product Admin Dashboard

A modern, responsive, production-ready Admin Dashboard built for managing products using the [DummyJSON API](https://dummyjson.com).

Built strictly in accordance with the **Frontend Assignment: Product Admin Dashboard** requirements:
- **Next.js (App Router)** • **React** • **Tailwind CSS** • **Axios**
- **Zero third-party query or table libraries**: No React Query, SWR, or ready-made pagination/table libraries. All state, caching, synchronization, and pagination logic are custom built.

---

## 🚀 Live Demo & Repository
- **GitHub Repository**: [Your Repo Link Here]
- **Live Deployment**: [Your Vercel/Netlify Deployment Link Here]

---

## 🔐 Credentials & Authentication
- **Username**: `emilys`
- **Password**: `emilyspass`
- **API Endpoint**: `POST https://dummyjson.com/auth/login`
- **Protected Routes**: Unauthenticated users attempting to access `/products` or `/products/[id]` are automatically redirected to `/login`. A one-click demo filler button is included on the login screen for testing convenience.

---

## 🛠️ Setup & Installation

```bash
# 1. Clone repository
git clone <your-repo-url>
cd my-app

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
# Visit http://localhost:3000 (automatically redirects to /products or /login)
```

---

## ✨ Features Completed

### 1. Authentication & Security
- [x] Login page communicating with `POST /auth/login`.
- [x] Clear error messages for incorrect credentials.
- [x] Rapid-click prevention to avoid duplicate login requests.
- [x] Global route guard (`AuthGuard`) protecting `/products` and `/products/[id]`.
- [x] Profile indicator and responsive Logout button in Navbar.

### 2. Networking & Architecture
- [x] **Shared Axios Instance (`lib/axios.ts`)**: Automatically injects `Authorization: Bearer <token>` to all requests via request interceptors.
- [x] **Centralized Error Handling**: Response interceptor catches 401 Unauthorized errors, clears tokens, and redirects to login with session expiry notices.
- [x] **Separation of Concerns**: Small components; API logic isolated in `services/auth.service.ts` and `services/product.service.ts`.

### 3. Product Catalog & Responsiveness
- [x] **Desktop Table View**: Clean table displaying thumbnail, title, category, price, star rating, and stock badges.
- [x] **Mobile Card Grid**: Adaptive cards optimized for small screen viewing.
- [x] **Custom Pagination**:
  - Limit & skip pagination from API.
  - Page size dropdown selector (`10`, `20`, `50`).
  - Summary text: `"Showing 21–40 of 194"`.
  - Previous / Next navigation with smart numbered pages and ellipsis (`...`).
- [x] **URL Synchronization**: `page`, `limit`, `q` (search), `category`, `sortBy`, and `order` stay synchronized in the URL query string.
- [x] **Malformed URL Protection**: Handled gracefully without breaking (e.g. `?page=abc` falls back to 1; out-of-range pages clamp safely).

### 4. Search, Filter & Sort
- [x] **Debounced Search**: Waits until the user stops typing (350ms) before querying `/products/search?q=`. Resets to page 1 upon search query change.
- [x] **Category Filter**: Dynamically loaded from `/products/categories`.
- [x] **Sorting**: Sort by price (asc/desc), rating, and title.

### 5. Product Details (`/products/[id]`)
- [x] High-resolution image gallery / thumbnail picker.
- [x] Comprehensive specs: title, brand, category, price, discount badge, stock units, SKU, weight, shipping & warranty.
- [x] Customer reviews section displaying reviewer name, star rating, comment, and date.
- [x] Polished **404 Not Found state** for invalid IDs or deleted items with return link.

### 6. Add, Edit & Delete Mutations
- [x] **Add Product Modal**: Form with input validation (title required, positive price, non-negative stock integer, category selection).
- [x] **Edit Product Modal**: Pre-populates existing data and updates fields.
- [x] **Delete Confirmation Popup**: Modal prompt ensuring accidental clicks do not delete products.
- [x] **Submit Throttling**: Submit buttons disable and show spinners during async operations.

### 7. States & Feedback
- [x] **Loading State**: Animated skeleton placeholder for tables/cards and detail screens.
- [x] **Empty State**: Friendly illustration and message when search or filter returns zero items, with a "Reset Filters" action.
- [x] **Error State**: Banner with a "Retry" button when network or server errors occur.

---

## 🧠 Architectural Explanations & Solutions to Assignment Challenges

### 1. Simultaneous Search & Category Filter
> *“The API cannot search and filter by category at the same time. Decide what your app does and explain why.”*

- **Limitation**: The DummyJSON API treats `/products/search?q=` and `/products/category/{category}` as mutually exclusive endpoints.
- **Our Solution**: When both a search query and a category filter are active, the app queries the category's products and performs text searching, sorting, and pagination client-side over that category.
- **Why**: This provides the user with an intuitive "Search within category" experience without dropping either user preference or showing an error.

### 2. Persistence of Simulated Mutations
> *“Add, edit and delete are not really saved by the API. Show the change in the app anyway and explain your approach.”*

- **Limitation**: DummyJSON simulates mutations but does not persist newly added, edited, or deleted records.
- **Our Solution**: A dedicated `ProductContext` tracks:
  - `addedProducts`: New items prepended to the catalog.
  - `updatedProducts`: Field-level overrides merged by ID.
  - `deletedProductIds`: Filtered out across both list and detail views.
  All mutations are persisted in `localStorage`.
- **Why**: Changes survive page refreshes, back-and-forth navigations, and detail page visits.

### 3. Preventing Race Conditions During Fast Typing
> *“If the user types fast, old search results must never replace new ones. (Test by adding &delay=2000 to the API URL.)”*

- **Our Solution**: Two-layer defense:
  1. **Debounce (350ms)**: Ensures rapid keystrokes don't flood the network.
  2. **`AbortController` + Sequence Tracking**: Each API call receives an `AbortSignal` to cancel prior in-flight requests. Additionally, a monotonic request counter (`activeRequestIdRef`) ensures that even if an older delayed request completes after a newer one, its response is discarded.

### 4. Malformed URL Protection
> *“Wrong URL values like ?page=abc or ?page=999 must not break the page.”*

- **Our Solution**: In `useProducts.ts`, `page` is parsed using `parseInt(..., 10)`. If `isNaN` or `< 1`, it safely defaults to `1`. If `page` exceeds `totalPages`, it clamps safely to total pages or shows empty state without runtime exceptions.

---

## 📝 Reflection Notes

### One Problem Faced & How It Was Fixed
- **Problem**: Next.js App Router's `useSearchParams()` can cause client-side de-opt warnings during prerendering if accessed without suspense boundaries. Additionally, when searching inside a category, DummyJSON's default search endpoint disregarded the category parameter.
- **Fix**: Wrapped the dashboard content in a `<Suspense fallback={<LoadingSkeleton />}>` boundary, and structured `useProducts` to detect when both `category` and `q` are present, fetching category data and performing client-side matching so users get accurate "search inside category" results.

### Where AI Assisted
- Assisted in architecting the two-layer race condition protection (`AbortController` + sequence reference ID) ensuring rapid keystrokes never produce out-of-order bugs under high latency (`&delay=2000`).
- Streamlined clean TypeScript definitions and helped build custom pagination without external dependencies.
