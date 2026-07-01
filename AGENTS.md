# AGENTS.md — Contexto de Sesión

## Stack
- Next.js 16 App Router, TypeScript, Tailwind v4, shadcn/ui
- Prisma + PostgreSQL (Neon), Zustand, JWT auth (jose), TanStack React Query v5
- Carrito client-side (localStorage), checkout vía WhatsApp, sin pasarela de pago
- **DB dual:** SQLite (desarrollo) / Neon PostgreSQL (producción)
- **Deploy:** Vercel (CI/CD automático via GitHub)
- **Uploads:** Cloudinary (upload_stream, folder `akdushop/products`)

---

## Lo que hemos hecho

### 1. React Query (@tanstack/react-query)
- `src/lib/providers.tsx` — QueryClientProvider con staleTime 30s
- `src/app/layout.tsx` — envuelve con `<Providers>`
- `src/hooks/use-products.ts` — refactorizado a `useQuery` + `useMutation`, options object `{category, limit}`
- `src/hooks/use-categories.ts` — mismo patrón, staleTime 60s, pagination support

### 2. Cuentas de clientes
#### Prisma
- Modelo `Customer` (name, email unique, phone?, address?, password hasheado)
- `Order.customerId` opcional → FK a Customer
- Índices: `Order(customerId, status, createdAt)`, `OrderItem(orderId)`, `Product(categoryId, featured, onSale, createdAt)`

#### Auth
- `src/lib/auth.ts` — `getCustomerSession()`, `authenticateCustomer(email, password)`
- Cookie separada del admin: `customer_session` (admin usa `session`)

#### API Routes (`/api/auth/customer/*`)
- `register/route.ts` — crea Customer, setea cookie
- `login/route.ts` — valida credenciales, setea cookie
- `logout/route.ts` — limpia cookie
- `me/route.ts` — GET perfil + órdenes, **PATCH actualizar perfil** (nombre, teléfono, dirección, contraseña)

#### Frontend
- `src/hooks/use-customer-auth.ts` — hook con React Query + `updateProfile()`
- `src/hooks/use-auth.ts` — hook admin con React Query
- `src/components/store/customer-auth-modal.tsx` — Dialog con tabs Login/Register
- `src/components/store/layout/header.tsx` — botón "Mi Cuenta" → modal
- `src/app/profile/page.tsx` — perfil editable + historial de pedidos + botón "Volver a comprar"

### 3. Órdenes vinculadas al customer autenticado
- `POST /api/orders` — requiere `customer_session` (401 si no)
- **Validación server-side**: precios calculados desde DB (`discountPrice` si `onSale`), stock verificado antes de crear
- **Teléfono/dirección del customer** se guardan automáticamente en la orden desde el perfil
- `src/hooks/use-cart-checkout.ts` — usa `useCustomerAuth` internamente + validación de stock pre-checkout
- `src/components/store/cart-drawer.tsx` — checkout automático post-login

### 4. Paleta de colores → Azul
- `src/app/globals.css` — paleta completa migrada a azul (hue 250)
- Variables `--gold`, `--gold-light`, `--champagne` ahora son tonos azules
- Modo claro y oscuro actualizados
- ~75 referencias Tailwind en 17 archivos ahora se renderizan en azul

### 5. Mejoras de diseño
- **Tarjetas de producto** (`product-card.tsx`) — rounded-2xl, hover sombra/borde, flex h-full para altura uniforme, **botón corazón favorito** (backdrop-blur-md, shadow-lg, scale animations, dark mode, `aria-pressed`), **overlay "Ver Detalles"** en hover sobre imagen (visible con `group-focus-within`), **botón "Ver Detalles"** outline full-width debajo de "Agregar al Carrito", descripción visible en sm+, sin selector +/- en tarjeta
- **Skeleton loader** (`product-card-skeleton.tsx`) — sincronizado con diseño actual (sin quantity selector)
- **Hero Section** (`hero-section.tsx`) — **layout 2 columnas en desktop** (texto + imagen de producto destacado), stats, animaciones
- **Featured Products** (`featured-products.tsx`) — gradientes con primary
- **Footer** (`footer.tsx`) — **3 columnas** (marca, enlaces, contacto), WhatsApp icon, links funcionales con `router.push` para anclas
- **Search input** (`products-section.tsx`) — focus ring con primary, **debounce 300ms**
- **Aria-labels** — carrito, eliminar item, admin login, admin settings, menú móvil, favoritos

### 6. Funcionalidades UX
- **Barra de anuncios** (`announcement-bar.tsx`) — mensajes rotativos, auto-rotate 5s
- **Badges de stock bajo** — "¡Solo quedan X!" cuando stock ≤ 5
- **Selector de cantidad** — componente reutilizable `QuantitySelector` en modal detalle (+/- con min 1), tarjeta agrega 1 unidad directo
- **Botón volver arriba** (`back-to-top.tsx`) — flotante tras scroll 400px
- **Animaciones al scroll** (`animate-on-scroll.tsx`) — fade-in + translateY
- **Zoom de imagen** (`product-detail-modal.tsx`) — hover → zoom 1.8x
- **Dark mode toggle** (`theme-toggle.tsx`) — persiste en localStorage, respeta prefers-color-scheme
- **Página 404 personalizada** (`not-found.tsx`) — diseño limpio conCTA para volver

### 7. Sistema de ofertas/rebajas (COMPLETADO)
- **Prisma** — `discountPrice Float?` y `onSale Boolean @default(false)` en Product
- **Admin form** — Switch + campo precio de oferta + cálculo % descuento
- **SalesSection** (`sales-section.tsx`) — gradiente, grid responsive (countdown eliminado por ser fake)

### 8. Deploy a Vercel (COMPLETADO)
- **Repo:** `https://github.com/AkduDev/AkduShop.git`
- **Proyecto Vercel:** `akdushop` (`akdulaydev-8764s-projects/akdushop`)
- **URL producción:** `https://akdushop.vercel.app`
- **CI/CD:** cada push a `main` auto-deploya
- **Build:** `vercel-build` script → `node scripts/switch-db.js prod && prisma db push --skip-generate && next build`

### 9. Admin Panel — Responsive + Visual (COMPLETADO)
- Hamburger menu mobile, nav desktop
- Products/Categories/Orders cards con dropdown actions
- Settings panel con 3 tabs + "Más" dropdown

### 10. Store Header — Responsive (COMPLETADO)
- 2 categorías visibles + "Más" dropdown en mobile
- **Badge de favoritos** con contador + icono corazón
- Mi Cuenta / Admin siempre visibles

### 11. Paginación + Cache (COMPLETADO)
- **API categories** — paginación server-side
- **useProducts** — options object, staleTime 30s, placeholderData
- **Cache global** — staleTime 30s en QueryClient

### 12. Seguridad — Fixes Críticos (COMPLETADO)
- Seed/migrate protegidos con auth admin (POST)
- Categories CRUD con auth admin
- Precios validados server-side en orders

### 13. Upload de imágenes — Cloudinary (COMPLETADO)
- Cloud name: `ds7tspnjm`, folder: `akdushop/products`
- `upload_stream()` dentro del handler

### 14. Code Cleanup + Security Hardening (COMPLETADO)
- Dead code, paquetes Radix no usados, `next-themes`, `bun.lock` eliminados

### 15. Security Headers (COMPLETADO)
- X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS, poweredByHeader: false

### 16. TypeScript + ESLint (COMPLETADO)
- `noImplicitAny: true`, ESLint reglas esenciales en modo `warn`

### 17. Frontend Overhaul (2025-06-27)
#### Fixes críticos
- **Búsqueda con debounce** — 300ms con `setTimeout` + estado local en `products-section.tsx`
- **Catálogo variant default** — products-section usa `variant="default"` (cards grandes con descripción)
- **Timer countdown falso eliminado** — SalesSection limpia sin countdown engañoso
- **Botón "Vaciar Carrito" duplicado eliminado** — solo queda en header del drawer
- **Selector de cantidad en modal detalle** — componente reutilizable `QuantitySelector`
- **Tipos compartidos** — `product-detail-modal.tsx` usa `Product` desde `@/types`

#### SEO + Performance
- **URL state sync** — query params `?cat=`, `?q=`, `?page=` — enlaces compartibles
- **Suspense boundary** — `useSearchParams` envuelto en `<Suspense>` en page.tsx
- **addItem con qty param** — store acepta `qty?: number`, callers ya no hacen loop
- **SettingsProvider con React Query** — staleTime 5min, ya no fetch en cada navegación

#### Hero + Footer
- **Hero 2 columnas** — texto izquierda + imagen producto destacado en desktop
- **Footer 3 columnas** — marca, enlaces (Productos/Contacto/Mi Cuenta), contacto con dirección/horario
- **Footer links funcionales** — anclas con `router.push` + `scrollIntoView` para todas las páginas

#### Editar perfil
- **API PATCH** `/api/auth/customer/me` — actualiza nombre, teléfono, dirección, contraseña
- **use-customer-auth.ts** — `updateProfile()` exportado, `updateProfileApi` (evita naming conflict)
- **Profile page** — formulario inline con modo edición, validación de contraseña actual
- **Toast de éxito** — feedback al actualizar perfil

#### Dark mode
- **Badges de estado** — `bg-*/15` + `dark:text-*` en vez de `bg-*-100` (funciona en ambos temas)
- **ThemeToggle** (`src/components/ui/theme-toggle.tsx`) — persiste en localStorage, respeta prefers-color-scheme

#### Skeleton loading
- **Homepage** — skeletons para FeaturedProducts y SalesSection mientras cargan

#### Filtros avanzados
- **Sort** — Predeterminado, Menor precio, Mayor precio, Más recientes, Destacados
- **Rango de precio** — Todos, Hasta $10, $10-25, $25-50, $50-100, Más de $100

#### Wishlist / Favoritos
- **Store** (`src/store/wishlist.ts`) — Zustand + persist, `addItem`/`removeItem`/`toggleItem`/`isInWishlist`
- **Página** (`src/app/wishlist/page.tsx`) — lista de favoritos, agregar al carrito, eliminar
- **Botón corazón** en product card — hover overlay + always-visible heart icon + `aria-pressed`
- **Badge** en header — contador de favoritos con hidratación

#### Share button
- **Hook `useShare`** (`src/hooks/use-share.ts`) — Web Share API + clipboard fallback reutilizable
- Comparte URL con query `?q=nombre producto`

#### Toast notifications
- **Carrito** — toast al agregar, quitar, y vaciar
- **Favoritos** — toast al agregar/quitar de wishlist

#### Reordenar
- **Profile** — botón "Volver a comprar" en cada pedido
- **Promise.allSettled** — fetch paralelo de productos (no secuencial)

### 18. Product Card Redesign (2025-07-01)
- **Botón favorito** — circular con backdrop-blur-md, shadow-lg, scale animations, dark mode, `aria-pressed`
- **Overlay "Ver Detalles"** — aparece al hover sobre la imagen con blur, visible con `group-focus-within`
- **Botón "Ver Detalles"** — outline full-width debajo de "Agregar al Carrito"
- **Descripción** — visible en sm+, sin descripción placeholder si está vacía
- **Sin selector +/-** — tarjeta agrega 1 unidad directo, cantidad se elige en modal detalle
- **Layout flex** — `flex flex-col h-full` para altura uniforme en el grid
- **Skeleton sync** — `product-card-skeleton.tsx` actualizado sin quantity selector

### 19. Fix Vercel Build — PostgreSQL Provider (2025-07-01)
- **Problema:** `schema.prisma` tiene `provider = "sqlite"` pero Vercel usa Neon PostgreSQL
- **Fix:** `vercel-build` ejecuta `node scripts/switch-db.js prod` antes de `prisma db push`
- **`switch-db.js`** cambia provider a `postgresql` + regenera Prisma client en build time
- `.env.production.bak` no se sube a git; Vercel usa `DATABASE_URL` del dashboard

### 20. Seguridad + Performance + SEO (2025-07-01)
#### Seguridad
- **Password fallback eliminado** — `authenticateUser` solo acepta passwords hasheados (scrypt)
- **Rate limit** — soporte `x-vercel-forwarded-for` header para IP real en Vercel
- **Validación de stock pre-checkout** — endpoint `/api/orders/validate-stock` antes de crear orden
- **Teléfono/dirección del customer** se guardan automáticamente en la orden

#### Performance
- **SettingsProvider con React Query** — staleTime 5min, gcTime 10min, sin fetch en cada navegación
- **Reorder paralelo** — `Promise.allSettled` en vez de N llamadas secuenciales

#### SEO
- **Sitemap.xml dinámico** (`src/app/sitemap.ts`) — incluye todos los productos
- **JSON-LD Product schema** (`src/app/products/[id]/page.tsx`) — rich results en Google
- **Página 404 personalizada** (`src/app/not-found.tsx`)

#### Accesibilidad
- **`aria-current="page"`** en botón activo de paginación
- **`aria-pressed`** en botón favorito de tarjeta
- **Overlay "Ver Detalles"** visible con `group-focus-within` (teclado)

#### Código limpio
- **`useShare` hook** (`src/hooks/use-share.ts`) — Web Share API + clipboard reutilizable
- **`QuantitySelector`** (`src/components/ui/quantity-selector.tsx`) — componente reutilizable (elimina 3 copias)
- **`getDisplayPrice`** (`src/lib/product-utils.ts`) — utility para cálculo de precio (elimina 4 copias)
- **`product-detail-modal.tsx`** — refactorizado para usar shared utilities

---

## Decisiones clave
| Decisión | Por qué |
|----------|---------|
| React Query en lugar de useState | Caching automático, invalidación, loading/error states |
| `placeholderData: (prev) => prev` | Mantiene datos visibles mientras se recarga |
| Cookie separada para customers | No interferir con sesión admin |
| Mutations retornan `Promise<boolean>` | Compatible con código existente |
| Checkout automático post-login | UX: usuario no hace clic dos veces |
| CSS variables `--gold` con valores azules | Renombrar 75+ clases Tailwind sería muy costoso |
| `discountPrice` nullable en Prisma | Productos sin oferta simplemente tienen null |
| `onSale` boolean separado de `discountPrice` | Permite marcar "en oferta" sin precio |
| Seed/migrate como POST con auth | GET no debe mutar estado |
| Precios server-side en orders | Previene manipulación por el cliente |
| Cloudinary upload_stream en handler | Config dentro del handler evita problemas con env vars en serverless |
| ESLint en modo warn, no error | Evita que builds fallen pero alerta sobre código problemático |
| Debounce búsqueda 300ms | Evita 1 API call por tecla, balance speed/responsiveness |
| `addItem(item, qty)` con param opcional | Un solo state update en vez de N loops |
| URL state sync con `router.replace` | Permite compartir enlaces con filtros sin recargar |
| Suspense para useSearchParams | Requerido por Next.js 14+ App Router |
| `updateProfileApi` (no `updateProfile`) | Evita naming conflict con la función del hook |
| Sin quantity selector en tarjeta | Cantidad se elige en modal detalle, tarjeta agrega 1 directo |
| `switch-db.js prod` en vercel-build | Corrige provider sqlite→postgresql durante build en Vercel |
| SettingsProvider con React Query | staleTime 5min, evita fetch en cada navegación |
| Password solo hasheado | Elimina riesgo de passwords en texto plano en DB |
| Validación stock pre-checkout | Previene órdenes con items agotados |
| Promise.allSettled en reorder | Paralelo es más rápido que secuencial |
| Sitemap dinámico | SEO: motores de búsqueda descubren productos |
| JSON-LD Product schema | Rich results en Google (precio, disponibilidad) |
| Dark mode con localStorage | Persiste preferencia del usuario entre sesiones |
| `group-focus-within` en overlay | Overlay visible con teclado (accesibilidad) |
| `aria-pressed` en favorito | Screen readers anuncian estado del botón |

---

## Pendiente — Futuro
### Seguridad
- **Rate limiting Upstash Redis** — in-memory inútil en Vercel serverless; considerar Upstash para producción
- **Input validation con Zod** — schemas para todos los API routes

### Performance
- **Stats endpoint** — full table scan en `/api/admin/stats`; reemplazar con Prisma aggregate
- **Búsqueda server-side** — endpoint de búsqueda en API en vez de filtrar cliente

### Calidad de código
- **Eliminar `use-crud.ts`** — código muerto si aún existe
- **Reemplazar console.error** — considerar logger estructurado (pino)
- **Prisma** — considerar Decimal en vez de Float para precios monetarios

### Funcionalidad
- **Cuentas admin con roles** — considerar roles adicionales (viewer, editor)
- **Newsletter signup** — formulario en footer
- **Reseñas/ratings** — sistema de valoraciones de productos
- **Paginación con infinite scroll** — alternativa a paginación tradicional
- **Carrito server-side** — persistir entre dispositivos si el usuario está logueado
- **Email de confirmación** — fallback cuando WhatsApp falla
- **Términos y Privacidad** — páginas legales para GDPR
- **"Notificame cuando esté disponible"** — para productos agotados

---

## Archivos relevantes
### Core
- `prisma/schema.prisma` — modelos: User, Customer, Category, Product, SiteSetting, Order, OrderItem
- `src/lib/auth.ts` — JWT + hashing + session helpers (admin + customer)
- `src/lib/providers.tsx` — QueryClientProvider
- `src/lib/settings-context.tsx` — SettingsProvider con React Query (staleTime 5min)
- `src/lib/product-utils.ts` — `getDisplayPrice()` utility para cálculo de precio
- `src/lib/rate-limit.ts` — rate limiting con soporte Vercel headers

### Hooks
- `src/hooks/use-products.ts` — React Query para productos (options object)
- `src/hooks/use-categories.ts` — React Query para categorías (paginación)
- `src/hooks/use-customer-auth.ts` — auth de clientes + `updateProfile()`
- `src/hooks/use-cart-checkout.ts` — checkout con validación de stock pre-checkout
- `src/hooks/use-share.ts` — Web Share API + clipboard fallback reutilizable

### Stores
- `src/store/cart.ts` — Zustand cart con `addItem(item, qty?)`, persist localStorage
- `src/store/wishlist.ts` — Zustand wishlist con `toggleItem`, persist localStorage

### Types
- `src/types/product.ts` — interfaces Product, ProductFormData (con discountPrice, onSale)
- `src/types/api.ts` — SiteSettings, DEFAULT_SETTINGS, PaginationData
- `src/types/order.ts` — Order, OrderItem, ORDER_STATUS_LABELS

### UI Components
- `src/components/ui/quantity-selector.tsx` — selector de cantidad reutilizable (+/-)
- `src/components/ui/theme-toggle.tsx` — toggle dark mode con persistencia

### Store Frontend
- `src/components/store/layout/announcement-bar.tsx` — barra de anuncios rotativa
- `src/components/store/layout/back-to-top.tsx` — botón volver arriba
- `src/components/store/layout/header.tsx` — store header responsive + badge favoritos + theme toggle
- `src/components/store/layout/hero-section.tsx` — hero 2 columnas con producto destacado
- `src/components/store/layout/footer.tsx` — footer 3 columnas con links funcionales
- `src/components/store/layout/contact-section.tsx` — sección contacto
- `src/components/store/animate-on-scroll.tsx` — wrapper animaciones scroll
- `src/components/store/product-card.tsx` — card con badges, favoritos (aria-pressed), overlay focus-within
- `src/components/store/product-detail-modal.tsx` — modal con zoom, QuantitySelector, share, shared utils
- `src/components/store/featured-products.tsx` — sección destacados
- `src/components/store/products-section.tsx` — catálogo con debounce, sort, filtros precio
- `src/components/store/sales-section.tsx` — sección ofertas (sin countdown)
- `src/components/store/cart-drawer.tsx` — carrito lateral con toast
- `src/components/store/customer-auth-modal.tsx` — login/register modal
- `src/components/store/pagination.tsx` — paginación con `aria-current="page"`

### Pages
- `src/app/page.tsx` — homepage con Suspense, URL state sync, skeleton loading
- `src/app/not-found.tsx` — página 404 personalizada
- `src/app/sitemap.ts` — sitemap dinámico con productos
- `src/app/profile/page.tsx` — perfil editable + historial + reordenar paralelo
- `src/app/wishlist/page.tsx` — página de favoritos
- `src/app/products/[id]/page.tsx` — página de producto con JSON-LD schema
- `src/app/admin/page.tsx` — página admin

### API Routes
- `src/app/api/products/route.ts` — GET/POST productos (paginación)
- `src/app/api/products/[id]/route.ts` — GET/PUT/DELETE producto
- `src/app/api/categories/route.ts` — GET/POST categorías (paginación + auth en POST)
- `src/app/api/categories/[id]/route.ts` — GET/PUT/DELETE categoría (auth en PUT/DELETE)
- `src/app/api/orders/route.ts` — GET/POST órdenes (paginación + validación server-side + customer phone/address)
- `src/app/api/orders/[id]/route.ts` — GET/PUT orden
- `src/app/api/orders/validate-stock/route.ts` — POST validación de stock pre-checkout
- `src/app/api/auth/customer/me/route.ts` — GET perfil + PATCH actualizar perfil
- `src/app/api/auth/customer/register/route.ts` — registro
- `src/app/api/auth/customer/login/route.ts` — login
- `src/app/api/auth/customer/logout/route.ts` — logout
- `src/app/api/seed/route.ts` — POST con auth admin
- `src/app/api/upload/route.ts` — upload Cloudinary

### Config
- `src/middleware.ts` — JWT auth lazy evaluation, protección rutas admin
- `next.config.ts` — security headers, remotePatterns restringidos
- `eslint.config.mjs` — reglas esenciales en modo warn
- `.env` / `.env.development` — DB, JWT_SECRET, CLOUDINARY_*
- `vercel.json` — config de build
- `public/placeholder.svg` — imagen placeholder para reordenar

---

## Credenciales
- Admin: `admin@lesly.com` / `123Lesly`
- DB SQLite local: `prisma/db/custom.db`
- Neon: ver `.env.production.bak`
- JWT_SECRET generado via `openssl rand -base64 32`
- Cloudinary: cloud name `ds7tspnjm`
- Vercel project: `akdushop` (akdulaydev-8764s-projects)

---

## Comandos útiles
```bash
npm run dev          # Iniciar dev server (SQLite)
npm run build        # Build producción
npm run lint         # Verificar código
npm run db:dev       # Cambiar a SQLite
npm run db:prod      # Cambiar a Neon PostgreSQL
npx prisma studio    # Visualizar base de datos
npx prisma generate  # Regenerar Prisma client
npx prisma db push   # Sincronizar schema con DB
vercel --yes --prod  # Deploy a Vercel producción
git push origin main # Auto-deploy via CI/CD
```
