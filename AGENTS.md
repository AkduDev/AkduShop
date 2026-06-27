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
- `me/route.ts` — devuelve perfil + órdenes del customer logueado

#### Frontend
- `src/hooks/use-customer-auth.ts` — hook con React Query
- `src/hooks/use-auth.ts` — hook admin con React Query
- `src/components/store/customer-auth-modal.tsx` — Dialog con tabs Login/Register
- `src/components/store/layout/header.tsx` — botón "Mi Cuenta" → modal
- `src/app/profile/page.tsx` — info personal + historial de pedidos

### 3. Órdenes vinculadas al customer autenticado
- `POST /api/orders` — requiere `customer_session` (401 si no)
- **Validación server-side**: precios calculados desde DB (`discountPrice` si `onSale`), stock verificado antes de crear
- `src/hooks/use-cart-checkout.ts` — usa `useCustomerAuth` internamente
- `src/components/store/cart-drawer.tsx` — checkout automático post-login

### 4. Paleta de colores → Azul
- `src/app/globals.css` — paleta completa migrada a azul (hue 250)
- Variables `--gold`, `--gold-light`, `--champagne` ahora son tonos azules
- Modo claro y oscuro actualizados
- ~75 referencias Tailwind en 17 archivos ahora se renderizan en azul

### 5. Mejoras de diseño
- **Tarjetas de producto** (`product-card.tsx`) — rediseñadas con rounded-2xl, hover sombra/borde, badge destacado azul, overlay con botón "Ver"
- **Skeleton loader** (`product-card-skeleton.tsx`) — sincronizado con diseño actual
- **Hero Section** (`hero-section.tsx`) — degradados con primary, stats con bordes sutiles, animaciones de entrada
- **Featured Products** (`featured-products.tsx`) — gradientes con primary en vez de gold
- **Footer** (`footer.tsx`) — botón contacto usa primary-foreground
- **Search input** (`products-section.tsx`) — focus ring con primary
- **Aria-labels** — agregados en: carrito, cantidades +/-, eliminar item, admin login, admin settings, menú móvil

### 6. Funcionalidades UX nuevas
- **Barra de anuncios** (`announcement-bar.tsx`) — banda superior con mensajes rotativos (envío + WhatsApp), auto-rotate 5s, botón cerrar
- **Badges de stock bajo** — badge amarillo "¡Solo quedan X!" cuando stock ≤ 5
- **Selector de cantidad rápido** — botones +/- en tarjeta + botón "Agregar" con feedback visual verde "✓ Agregado"
- **Botón volver arriba** (`back-to-top.tsx`) — flotante tras scroll 400px
- **Animaciones al scroll** (`animate-on-scroll.tsx`) — fade-in + translateY con IntersectionObserver, delay configurable
- **Zoom de imagen** (`product-detail-modal.tsx`) — hover → zoom 1.8x con transform-origin dinámico al cursor

### 7. Sistema de ofertas/rebajas (COMPLETADO)
- **Prisma** — campos `discountPrice Float?` y `onSale Boolean @default(false)` en modelo Product
- **Types** — `Product` y `ProductFormData` actualizados
- **API** — GET/POST/PUT actualizados para incluir nuevos campos
- **Admin form** — sección "En rebaja" con Switch + campo precio de oferta + cálculo de % descuento
- **Admin panel** — `productFormData` y funciones actualizadas
- **Admin products-table.tsx** — columna "Oferta" con badge, precio tachado
- **Admin products-cards.tsx** — badge de oferta y precio con descuento
- **Product card** — precio tachado + precio de oferta, badge "Oferta" rojo
- **Stats cards** — stat "En Oferta" con icono Tag
- **SalesSection** (`sales-section.tsx`) — sección con gradiente, countdown, grid responsive
- **Página principal** — SalesSection integrada

### 8. Deploy a Vercel (COMPLETADO)
- **Repo:** `https://github.com/AkduDev/AkduShop.git`
- **Proyecto Vercel:** `akdushop` (`akdulaydev-8764s-projects/akdushop`)
- **URL producción:** `https://akdushop.vercel.app`
- **CI/CD:** cada push a `main` auto-deploya
- **Build:** `vercel-build` script → `prisma generate && prisma db push --skip-generate && next build`
- **Env vars en Vercel:** `DATABASE_URL` (Neon pooler), `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

### 9. Admin Panel — Responsive + Visual (COMPLETADO)
- **Header admin** — hamburger menu en mobile, nav items en desktop
- **Products cards** — grid layout, dropdown actions, hover effects, badges flotantes
- **Categories cards** — headers coloreados, dropdown actions, icono por categoría
- **Orders cards** — barra de estado coloreada, layout limpio en mobile
- **Settings panel** — 3 tabs + "Más" dropdown, secciones coloreadas con iconos

### 10. Store Header — Responsive (COMPLETADO)
- Solo 2 categorías visibles + "Más" dropdown en mobile
- Mi Cuenta / Admin siempre visibles
- Categorías se expanden en desktop

### 11. Paginación + Cache (COMPLETADO)
- **API categories** — paginación server-side
- **useProducts** — options object, staleTime 30s, placeholderData
- **useCategories** — staleTime 60s, pagination support
- **Admin panel** — products limit=100, categories paginadas
- **Cache global** — staleTime 30s en QueryClient

### 12. Seguridad — Fixes Críticos (COMPLETADO)
- **Seed/migrate endpoints** — protegidos con auth admin, cambiado a POST
- **Categories CRUD** — auth admin en POST/PUT/DELETE
- **Orders** — precios validados server-side, stock verificado

### 13. Upload de imágenes — Cloudinary (COMPLETADO)
- **Provider:** Cloudinary (migrado desde Vercel Blob)
- **Cloud name:** `ds7tspnjm` (verificar en Cloudinary Dashboard → Settings)
- **Ruta:** `src/app/api/upload/route.ts` — usa `cloudinary.uploader.upload_stream()`
- **Runtime:** Node.js (`export const runtime = 'nodejs'`)
- **Config:** `cloudinary.config()` se ejecuta dentro del handler (no a nivel de módulo)
- **Carpeta:** `akdushop/products`
- **Env vars necesarias:** `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

### 14. Code Cleanup + Security Hardening (COMPLETADO)
- **Dead code eliminado:** `src/lib/constants.ts` (credenciales hardcodeadas), `use-mobile.ts`, `sidebar.tsx`
- **14 paquetes Radix UI no usados eliminados** + componentes shadcn wrappers muertos
- **`next-themes` eliminado** (nunca se importó)
- **`bun.lock` eliminado** (duplicado con `package-lock.json`)
- **`server.err`/`server.log` eliminados** del repo
- **Admin panel:** variables muertas eliminadas (`imagePreview`, `isUploading`, `fileInputRef`)

### 15. Security Headers (COMPLETADO)
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `poweredByHeader: false`
- `remotePatterns` restringido a `images.unsplash.com` y `res.cloudinary.com`

### 16. TypeScript + ESLint (COMPLETADO)
- `noImplicitAny: true` en tsconfig (antes `false`)
- ESLint: reglas esenciales habilitadas en modo `warn` (`no-explicit-any`, `no-unused-vars`, `prefer-const`, `no-redeclare`, `no-unreachable`, `no-debugger: error`)
- `react-hooks/exhaustive-deps: warn`

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
| `cloudinary.config()` dentro del POST | En Vercel las env vars no están disponibles a nivel de módulo |
| ESLint en modo warn, no error | Evita que builds fallen pero alerta sobre código problemático |

---

## Pendiente — Futuro
### Seguridad
- **Rate limiting** — usar Redis/Upstash en vez de in-memory Map (inútil en Vercel serverless)
- **Input validation con Zod** — schemas para todos los API routes
- **Middleware admin** — `src/middleware.ts` protege rutas admin (ya implementado)

### Performance
- **Stats endpoint** — full table scan en `/api/admin/stats`; reemplazar con Prisma aggregate
- **Búsqueda server-side** — endpoint de búsqueda en API en vez de filtrar cliente

### Calidad de código
- **Eliminar `use-crud.ts`** — código muerto si aún existe
- **Reemplazar console.error** — considerar logger estructurado (pino)
- **Prisma** — considerar Decimal en vez de Float para precios monetarios

### Funcionalidad
- **Cuentas admin con roles** — considerar roles adicionales (viewer, editor)

---

## Archivos relevantes
- `prisma/schema.prisma` — modelos: User, Customer, Category, Product, SiteSetting, Order, OrderItem
- `src/lib/auth.ts` — JWT + hashing + session helpers (admin + customer)
- `src/lib/providers.tsx` — QueryClientProvider
- `src/lib/settings-context.tsx` — SettingsProvider con fetch de /api/settings
- `src/hooks/use-products.ts` — React Query para productos (options object)
- `src/hooks/use-categories.ts` — React Query para categorías (paginación)
- `src/hooks/use-customer-auth.ts` — auth de clientes
- `src/hooks/use-cart-checkout.ts` — checkout con datos del customer logueado
- `src/types/product.ts` — interfaces Product, ProductFormData (con discountPrice, onSale)
- `src/types/api.ts` — SiteSettings, DEFAULT_SETTINGS
- `src/components/store/layout/announcement-bar.tsx` — barra de anuncios rotativa
- `src/components/store/layout/back-to-top.tsx` — botón volver arriba
- `src/components/store/layout/header.tsx` — store header responsive (2 categorías + "Más")
- `src/components/store/animate-on-scroll.tsx` — wrapper animaciones scroll
- `src/components/store/product-card.tsx` — tarjeta con quantity selector, badges stock, feedback
- `src/components/store/product-detail-modal.tsx` — modal con zoom de imagen
- `src/components/store/featured-products.tsx` — sección destacados
- `src/components/store/products-section.tsx` — sección productos con search/pagination
- `src/components/store/sales-section.tsx` — sección de ofertas con countdown y grid responsive
- `src/components/store/admin/product-form-dialog.tsx` — formulario con campos onSale + discountPrice
- `src/components/store/admin/products-table.tsx` — tabla admin con paginación UI
- `src/components/store/admin/categories-table.tsx` — tabla admin con paginación UI
- `src/components/store/admin-panel-refactored.tsx` — panel admin principal
- `src/app/page.tsx` — página principal con AnnouncementBar + BackToTop
- `src/app/admin/page.tsx` — página admin
- `src/app/globals.css` — paleta de colores (azul hue 250)
- `src/app/api/products/route.ts` — GET/POST productos (paginación)
- `src/app/api/products/[id]/route.ts` — GET/PUT/DELETE producto
- `src/app/api/categories/route.ts` — GET/POST categorías (paginación + auth en POST)
- `src/app/api/categories/[id]/route.ts` — GET/PUT/DELETE categoría (auth en PUT/DELETE)
- `src/app/api/orders/route.ts` — GET/POST órdenes (paginación + validación server-side)
- `src/app/api/orders/[id]/route.ts` — GET/PUT orden
- `src/app/api/seed/route.ts` — POST con auth admin
- `src/app/api/migrate-images/route.ts` — POST con auth admin
- `src/app/api/upload/route.ts` — upload images via Cloudinary
- `src/app/api/admin/stats/route.ts` — estadísticas admin (pendiente: optimizar full table scan)
- `src/middleware.ts` — JWT auth lazy evaluation, protección rutas admin
- `next.config.ts` — security headers, remotePatterns restringidos, poweredByHeader: false
- `eslint.config.mjs` — reglas esenciales en modo warn
- `.env` — SQLite (dev) o Neon (prod), JWT_SECRET, CLOUDINARY_* requeridos
- `.env.development` — SQLite + dev JWT secret
- `vercel.json` — config de build para Vercel
- `scripts/switch-db.js` — alterna SQLite/Neon + regenera Prisma client

---

## Credenciales
- Admin: `admin@lesly.com` / `123Lesly`
- DB SQLite local: `prisma/db/custom.db`
- Neon: ver `.env.production.bak`
- JWT_SECRET generado via `openssl rand -base64 32`
- Cloudinary: cloud name `ds7tspnjm` (verificar en Dashboard → Settings)
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
