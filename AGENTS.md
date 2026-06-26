# AGENTS.md — Contexto de Sesión

## Stack
- Next.js 16 App Router, TypeScript, Tailwind v4, shadcn/ui
- Prisma + PostgreSQL (Neon), Zustand, JWT auth (jose), TanStack React Query v5
- Carrito client-side (localStorage), checkout vía WhatsApp, sin pasarela de pago
- **DB dual:** SQLite (desarrollo) / Neon PostgreSQL (producción)
- **Deploy:** Vercel (CI/CD automático via GitHub)
- **Uploads:** Vercel Blob Storage

---

## Lo que hemos hecho

### 1. React Query (@tanstack/react-query)
- `src/lib/providers.tsx` — QueryClientProvider con staleTime 30s
- `src/app/layout.tsx` — envuelve con `<Providers>`
- `src/hooks/use-products.ts` — refactorizado a `useQuery` + `useMutation`, options object `{category, limit}`
- `src/hooks/use-categories.ts` — mismo patrón, staleTime 60s, pagination support
- `src/hooks/use-crud.ts` — **pendiente de eliminar** (código muerto, 119 líneas)

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
#### Completado:
- **Prisma** — campos `discountPrice Float?` y `onSale Boolean @default(false)` en modelo Product, índice en `onSale`
- **DB** — `npx prisma generate && npx prisma db push` ejecutado, schema sincronizado
- **Types** — `Product` y `ProductFormData` actualizados con `discountPrice`, `onSale`
- **API** — `GET /api/products`, `POST /api/products`, `PUT /api/products/[id]` actualizados para incluir nuevos campos
- **Admin form** (`product-form-dialog.tsx`) — sección "En rebaja" con Switch + campo precio de oferta + cálculo de % descuento
- **Admin panel** (`admin-panel-refactored.tsx`) — `productFormData` y funciones `handleEditProduct`, `resetProductForm` actualizadas
- **Admin products-table.tsx** — columna "Oferta" con badge, precio original tachado y precio con descuento
- **Admin products-cards.tsx** — badge de oferta y precio con descuento
- **Product card** (`product-card.tsx`) — precio original tachado + precio de oferta cuando `onSale=true`, badge "Oferta" rojo, usa precio de oferta en carrito
- **Stats cards** — stat "En Oferta" con icono Tag, cuenta productos en rebaja
- **Componente SalesSection** (`sales-section.tsx`) — sección con gradiente rojo, countdown de 24h, grid responsive, animaciones scroll
- **Página principal** (`page.tsx`) — SalesSection integrada entre FeaturedProducts y ProductsSection

### 8. Deploy a Vercel (COMPLETADO)
- **Repo:** `https://github.com/AkduDev/AkduShop.git`
- **Proyecto Vercel:** `akdushop` (`akdulaydev-8764s-projects/akdushop`)
- **URL producción:** `https://akdushop.vercel.app`
- **CI/CD:** cada push a `main` auto-deploya
- **Build:** `vercel-build` script → `prisma generate && prisma db push --skip-generate && next build`
- **Blob Store:** `akdushop-blobs` (store_18Iip8jpM0rwmCUv, iad1) — **pendiente linkar** para habilitar uploads
- **Env vars en Vercel:** `DATABASE_URL` (Neon pooler), `JWT_SECRET`
- **AGENTS.md** actualizado con info de deploy

### 9. Admin Panel — Responsive + Visual (COMPLETADO)
- **Header admin** (`header.tsx`) — hamburger menu en mobile, nav items en desktop
- **Products cards** (`products-cards.tsx`) — grid layout, dropdown actions, hover effects, imagen con gradiente overlay, badges flotantes, zoom hover
- **Categories cards** (`categories-cards.tsx`) — headers coloreados por categoría, dropdown actions, icono por categoría, footer con conteo productos
- **Orders cards** (`orders-table.tsx`) — barra de estado coloreada, layout limpio en mobile
- **Settings panel** (`settings-panel.tsx`) — 3 tabs principales visibles + "Más" dropdown para 4 secciones, secciones coloreadas con iconos, colapsable

### 10. Store Header — Responsive (COMPLETADO)
- Solo 2 categorías visibles + "Más" dropdown en mobile
- Mi Cuenta / Admin siempre visibles
- Categorías se expanden en desktop

### 11. Paginación + Cache (COMPLETADO)
- **API categories** — paginación server-side (`page`, `limit`, `total`, `totalPages`)
- **useProducts** — options object `{category, limit}`, staleTime 30s, placeholderData
- **useCategories** — staleTime 60s, pagination support
- **Admin panel** — products limit=100, categories paginadas con UI (flechas, page info)
- **Cache global** — staleTime 30s en QueryClient (excepto auth: staleTime 0)

### 12. Seguridad — Fixes Críticos (COMPLETADO)
- **Seed endpoint** (`/api/seed`) — protegido con auth admin, cambiado a POST, sin credenciales en response
- **Migrate-images endpoint** (`/api/migrate-images`) — protegido con auth admin, cambiado a POST
- **Categories CRUD** — auth admin agregado en POST/PUT/DELETE
- **Orders** — precios validados server-side contra DB (`discountPrice` si `onSale`), stock verificado antes de crear orden

---

## Decisiones clave
| Decisión | Por qué |
|----------|---------|
| React Query en lugar de useState | Caching automático, invalidación, loading/error states |
| `placeholderData: (prev) => prev` | Mantiene datos visibles mientras se recarga |
| Cookie separada para customers | No interferir con sesión admin |
| Mutations retornan `Promise<boolean>` | Compatible con código existente |
| Checkout automático post-login | UX: usuario no hace clic dos veces |
| CSS variables `--gold` con valores azules | Renombrar 75+ clases Tailwind sería muy costoso, cambiar valores CSS es más limpio |
| `discountPrice` nullable en Prisma | Productos sin oferta simplemente tienen null, sin booleano extra innecesario |
| `onSale` boolean separado de `discountPrice` | Permite marcar "en oferta" sin necesidad de precio, o tener precio deshabilitado |
| Seed/migrate como POST con auth | GET no debe mutar estado; auth previene ejecución arbitraria |
| Precios server-side en orders | Previene manipulación de precios por el cliente |
| useProducts con options object | Backward-compatible, permite pasar limit para admin (100) vs store (12) |

---

## Pendiente — Futuro
### Seguridad
- **Rate limiting** — agregar `next-rate-limit` o middleware para endpoints de auth (brute-force vulnerable)
- **Input validation con Zod** — schemas para todos los API routes (email, password, precios, cantidades)
- **Middleware de protección** — `src/middleware.ts` para rutas admin

### Performance
- **Stats endpoint** — full table scan en `/api/admin/stats` para calcular inventario; reemplazar con Prisma aggregate o raw SQL `SUM(price * stock)`
- **Búsqueda server-side** — endpoint de búsqueda en API en vez de filtrar cliente

### Calidad de código
- **Eliminar `use-crud.ts`** — código muerto (119 líneas), documentado como "no usado"
- **Reemplazar console.log/error** — 32 llamadas en producción; considerar logger estructurado (pino)
- **React DevTools** — agregar en development

### Funcionalidad
- **Blob Store linkado** — linkar `akdushop-blobs` desde Vercel Dashboard para habilitar uploads de imagen
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
- `src/app/api/upload/route.ts` — upload images via Vercel Blob Storage
- `src/app/api/admin/stats/route.ts` — estadísticas admin (pendiente: optimizar full table scan)
- `.env` — SQLite (dev) o Neon (prod), JWT_SECRET requerido
- `.env.development` — SQLite + dev JWT secret
- `vercel.json` — config de build para Vercel (vercel-build script)
- `scripts/switch-db.js` — alterna SQLite/Neon + regenera Prisma client

---

## Credenciales
- Admin: `admin@lesly.com` / `123Lesly`
- DB SQLite local: `prisma/db/custom.db`
- Neon: ver `.env.production.bak`
- JWT_SECRET generado via `openssl rand -base64 32` (sin fallback hardcodeado)
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
