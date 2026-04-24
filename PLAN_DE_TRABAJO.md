# 📋 PLAN DE TRABAJO - Carteras Lesly

## 🎯 ESTADO ACTUAL (Completado Hoy)

### ✅ **FASE 1: Arquitectura Base** (COMPLETADA)
- [x] Tipos centralizados en `/types/`
- [x] Hooks personalizados en `/hooks/`
- [x] Constantes globales en `/lib/constants.ts`
- [x] Documentación de arquitectura (`ARCHITECTURE.md`)

### ✅ **FASE 2: Admin Panel** (COMPLETADA)
- [x] Componentes separados (stats-cards, products-table, etc.)
- [x] Formularios modales (product-form-dialog, category-form-dialog)
- [x] Admin panel refactorizado activado en producción
- [x] Reducción de 1086 → 336 líneas (-69%)

### ✅ **FASE 3: Layout Components** (COMPLETADA)
- [x] Header separado (`layout/header.tsx`)
- [x] Hero Section separado (`layout/hero-section.tsx`)
- [x] Contact Section separado (`layout/contact-section.tsx`)
- [x] Footer separado (`layout/footer.tsx`)
- [x] page.tsx reducido de 445 → ~310 líneas (-30%)

### ✅ **FASE 4: Búsqueda** (COMPLETADA)
- [x] Búsqueda en tiempo real implementada
- [x] Filtrado por nombre, descripción y categoría
- [x] Barra de búsqueda con UI profesional
- [x] Contador de resultados dinámico

---

## 🚀 PRÓXIMAS MEJORAS (Para Mañana)

### **PRIORIDAD ALTA** 🔥

#### 1. Loading States y Skeletons
**Objetivo:** Mejorar UX durante carga de datos
**Tiempo estimado:** 1 hora

**Tareas:**
- [ ] Crear componente `ProductCardSkeleton`
- [ ] Crear componente `StatsCardsSkeleton`
- [ ] Agregar skeletons en tabla de productos
- [ ] Agregar skeletons en tabla de categorías
- [ ] Reemplazar "Cargando..." por animaciones visuales

**Archivos a crear:**
```
src/components/ui/skeletons/
├── product-card-skeleton.tsx
├── stats-card-skeleton.tsx
└── table-skeleton.tsx
```

**Archivos a modificar:**
- `src/app/page.tsx` (usar skeletons en loading)
- `src/components/store/admin/products-table.tsx`
- `src/components/store/admin/categories-table.tsx`

---

#### 2. Error Boundaries
**Objetivo:** Prevenir pantallas blancas en producción
**Tiempo estimado:** 45 minutos

**Tareas:**
- [ ] Crear componente `ErrorBoundary`
- [ ] Agregar manejo de errores en hooks
- [ ] Crear página de error personalizada
- [ ] Agregar logs de errores para debugging

**Archivos a crear:**
```
src/components/error-boundary.tsx
src/app/error.tsx (Next.js error page)
```

---

### **PRIORIDAD MEDIA** ⚡

#### 3. Optimización de Imágenes
**Objetivo:** Mejorar performance y SEO
**Tiempo estimado:** 30 minutos

**Tareas:**
- [ ] Configurar `next.config.ts` para optimización
- [ ] Quitar `unoptimized` de componentes Image
- [ ] Agregar formatos WebP/AVIF
- [ ] Configurar dominios permitidos

**Archivos a modificar:**
- `next.config.ts`
- `src/components/store/admin/product-form-dialog.tsx`
- `src/components/store/layout/header.tsx`
- `src/components/store/layout/footer.tsx`
- Todos los archivos con `<Image unoptimized>`

---

#### 4. Filtros Avanzados
**Objetivo:** Mejorar experiencia de búsqueda
**Tiempo estimado:** 1.5 horas

**Tareas:**
- [ ] Agregar filtro por rango de precio
- [ ] Agregar filtro por disponibilidad (en stock)
- [ ] Agregar ordenamiento (precio, nombre, más nuevo)
- [ ] UI de filtros responsive (dropdown en móvil, sidebar en desktop)

**Archivos a modificar:**
- `src/app/page.tsx`
- Crear componente `src/components/store/products/product-filters.tsx`

---

### **PRIORIDAD BAJA** 🎨

#### 5. Notificaciones Toast
**Objetivo:** Feedback visual al usuario
**Tiempo estimado:** 1 hora

**Tareas:**
- [ ] Configurar Sonner (ya instalado en el proyecto)
- [ ] Toast al agregar producto al carrito
- [ ] Toast al eliminar producto del carrito
- [ ] Toast en CRUD de productos (admin)
- [ ] Toast en CRUD de categorías (admin)

**Archivos a modificar:**
- `src/app/page.tsx`
- `src/components/store/admin-panel-refactored.tsx`
- `src/components/store/cart-drawer.tsx`

---

#### 6. Wishlist / Favoritos
**Objetivo:** Permitir guardar productos favoritos
**Tiempo estimado:** 2 horas

**Tareas:**
- [ ] Crear store Zustand para wishlist
- [ ] Agregar botón de corazón en ProductCard
- [ ] Crear modal/página de favoritos
- [ ] Persistir en localStorage

**Archivos a crear:**
```
src/store/wishlist.ts
src/components/store/wishlist-drawer.tsx
src/hooks/use-wishlist.ts
```

---

#### 7. Tests Unitarios Básicos
**Objetivo:** Asegurar calidad del código
**Tiempo estimado:** 2 horas

**Tareas:**
- [ ] Configurar Jest + React Testing Library
- [ ] Test para hook `useProducts`
- [ ] Test para hook `useCategories`
- [ ] Test para componente `ProductCard`
- [ ] Test para componente `StatsCards`

**Archivos a crear:**
```
__tests__/
├── hooks/
│   ├── use-products.test.ts
│   └── use-categories.test.ts
└── components/
    ├── product-card.test.tsx
    └── stats-cards.test.tsx
```

---

## 📁 ESTRUCTURA ACTUAL DEL PROYECTO

```
src/
├── app/
│   ├── api/                      # API Routes
│   ├── layout.tsx
│   └── page.tsx                  # ~310 líneas ✅
│
├── components/
│   ├── store/
│   │   ├── admin/                # Admin panel components ✅
│   │   │   ├── stats-cards.tsx
│   │   │   ├── dashboard-welcome.tsx
│   │   │   ├── products-table.tsx
│   │   │   ├── products-cards.tsx
│   │   │   ├── categories-table.tsx
│   │   │   ├── categories-cards.tsx
│   │   │   ├── product-form-dialog.tsx
│   │   │   └── category-form-dialog.tsx
│   │   │
│   │   ├── layout/               # Layout components ✅
│   │   │   ├── header.tsx
│   │   │   ├── hero-section.tsx
│   │   │   ├── contact-section.tsx
│   │   │   └── footer.tsx
│   │   │
│   │   ├── product-card.tsx
│   │   ├── product-detail-modal.tsx
│   │   ├── cart-drawer.tsx
│   │   ├── pagination.tsx
│   │   ├── admin-panel-refactored.tsx  # 336 líneas ✅
│   │   └── admin-login.tsx
│   │
│   └── ui/                       # shadcn/ui
│
├── hooks/                        # Custom hooks ✅
│   ├── use-auth.ts
│   ├── use-products.ts
│   ├── use-categories.ts
│   └── use-cart-checkout.ts
│
├── lib/
│   ├── db.ts
│   ├── auth.ts
│   ├── utils.ts
│   └── constants.ts              # Constantes globales ✅
│
├── store/
│   └── cart.ts                   # Zustand store
│
└── types/                        # TypeScript types ✅
    ├── index.ts
    ├── product.ts
    ├── category.ts
    ├── cart.ts
    └── api.ts
```

---

## 🎨 CONSTANTES Y CONFIGURACIÓN

### WhatsApp Number
```typescript
const WHATSAPP_NUMBER = '5354133253'
```

### Admin Credentials (para testing)
```
Email: admin@lesly.com
Password: 123Lesly
```

### Colores del Tema
```css
--gold: Color principal dorado
--gold-light: Dorado claro
--champagne: Champagne background
```

---

## 📊 MÉTRICAS DEL PROYECTO

| Métrica | Valor |
|---------|-------|
| **Total de archivos** | ~50 archivos |
| **Líneas de código** | ~3000 líneas |
| **Componentes** | 14 componentes |
| **Hooks** | 4 hooks personalizados |
| **Tipos TypeScript** | 10+ interfaces |
| **Commits totales** | 5+ commits |
| **Último commit** | `75eff60` - Búsqueda de productos |

---

## 🔗 RECURSOS IMPORTANTES

### Repositorio GitHub
**URL:** https://github.com/AkduDev/bolsos-lesly

### Documentación
- `ARCHITECTURE.md` - Guía completa de arquitectura
- `IMAGE_SYSTEM.md` - Sistema de imágenes
- `RESPONSIVE_IMPROVEMENTS.md` - Mejoras responsive

### APIs
- `/api/products` - CRUD productos
- `/api/categories` - CRUD categorías
- `/api/auth/login` - Autenticación
- `/api/auth/logout` - Logout
- `/api/upload` - Subida de imágenes
- `/api/admin/stats` - Estadísticas dashboard

---

## 🚀 COMANDOS ÚTILES

### Desarrollo
```bash
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Build de producción
npm run start        # Iniciar servidor de producción
npm run lint         # Verificar linting
```

### Git
```bash
git status           # Ver estado
git add .            # Agregar todos los cambios
git commit -m "msg"  # Commit
git push origin main # Push a GitHub
```

### Base de Datos
```bash
npx prisma generate  # Generar cliente Prisma
npx prisma migrate   # Ejecutar migraciones
npx prisma studio    # Abrir Prisma Studio
```

---

## 💡 NOTAS PARA MAÑANA

1. **Empezar por:** Loading States y Skeletons (mayor impacto en UX)
2. **Seguir con:** Error Boundaries (seguridad en producción)
3. **Luego:** Optimización de imágenes (performance)
4. **Finalmente:** Features adicionales (filtros, wishlist, etc.)

### Contexto Importante:
- El proyecto usa Next.js 16.1.1 con React 19
- Tailwind CSS v4 para estilos
- Prisma ORM con SQLite
- Zustand para estado global
- shadcn/ui para componentes UI
- JWT personalizado para autenticación

### Problemas Conocidos:
- Ninguno crítico identificado
- Todas las funcionalidades operativas
- Código limpio y organizado

---

## ✅ CHECKLIST DE INICIO (Mañana)

Antes de empezar a trabajar:
- [ ] Revisar este plan
- [ ] Verificar que el servidor de desarrollo funcione
- [ ] Revisar últimos cambios en GitHub
- [ ] Empezar por prioridad ALTA (Loading States)

---

**Última actualización:** 2026-04-24  
**Próxima sesión:** Mañana  
**Estado:** Listo para continuar 🚀
