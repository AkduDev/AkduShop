# 📐 Arquitectura del Proyecto - Carteras Lesly

## 🎯 Estructura Refactorizada

### **Principios Aplicados:**

1. **Separation of Concerns** - Cada archivo tiene una responsabilidad única
2. **DRY (Don't Repeat Yourself)** - Tipos y lógica reutilizables
3. **Single Responsibility** - Componentes < 300 líneas
4. **Composition over Inheritance** - Componentes pequeños y composables
5. **Custom Hooks** - Lógica de negocio separada de la UI

---

## 📁 Estructura de Carpetas

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes (backend)
│   │   ├── admin/stats/         # Estadísticas del dashboard
│   │   ├── auth/                # Autenticación
│   │   ├── categories/          # CRUD categorías
│   │   ├── products/            # CRUD productos
│   │   ├── upload/              # Subida de imágenes
│   │   └── migrate-images/      # Migración Base64
│   ├── layout.tsx               # Layout principal
│   └── page.tsx                 # Home (< 100 líneas)
│
├── components/                   # Componentes React
│   ├── store/                   # Componentes de la tienda
│   │   ├── admin/               # 🆕 Panel administrativo
│   │   │   ├── admin-panel.tsx          # Dashboard principal
│   │   │   ├── admin-login.tsx          # Login admin
│   │   │   ├── stats-cards.tsx          # Tarjetas métricas
│   │   │   ├── dashboard-welcome.tsx    # Welcome message
│   │   │   ├── products-table.tsx       # Tabla desktop
│   │   │   ├── products-cards.tsx       # Cards móvil
│   │   │   ├── categories-list.tsx      # Lista categorías
│   │   │   ├── product-form-dialog.tsx  # Form producto
│   │   │   └── category-form-dialog.tsx # Form categoría
│   │   │
│   │   ├── products/            # 🆕 Productos
│   │   │   ├── product-card.tsx
│   │   │   ├── product-detail-modal.tsx
│   │   │   ├── product-grid.tsx
│   │   │   └── featured-products.tsx
│   │   │
│   │   ├── cart/                # 🆕 Carrito
│   │   │   ├── cart-drawer.tsx
│   │   │   └── cart-item.tsx
│   │   │
│   │   ├── layout/              # 🆕 Layout components
│   │   │   ├── header.tsx
│   │   │   ├── mobile-nav.tsx
│   │   │   ├── hero-section.tsx
│   │   │   ├── contact-section.tsx
│   │   │   └── footer.tsx
│   │   │
│   │   └── pagination.tsx
│   │
│   └── ui/                      # shadcn/ui (no modificar)
│
├── hooks/                        # 🆕 Custom Hooks
│   ├── use-auth.ts              # Lógica autenticación
│   ├── use-products.ts          # CRUD productos
│   ├── use-categories.ts        # CRUD categorías
│   └── use-cart-checkout.ts     # Checkout WhatsApp
│
├── lib/                         # Utilidades
│   ├── db.ts                    # Prisma client
│   ├── auth.ts                  # Funciones auth
│   ├── utils.ts                 # Utilidades generales
│   └── constants.ts             # 🆕 Constantes globales
│
├── store/                       # State management (Zustand)
│   └── cart.ts                  # Estado del carrito
│
└── types/                       # 🆕 TypeScript types
    ├── index.ts                 # Barrel exports
    ├── product.ts               # Tipos de productos
    ├── category.ts              # Tipos de categorías
    ├── cart.ts                  # Tipos del carrito
    └── api.ts                   # Tipos de API responses
```

---

## 🔄 Flujo de Datos

```
┌─────────────────────────────────────────┐
│           Component (UI)                │
│  - Solo presenta información            │
│  - Eventos llaman hooks                 │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│        Custom Hook (Logic)              │
│  - fetchProducts()                      │
│  - createProduct()                      │
│  - Maneja estados loading/error         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         API Route (Backend)             │
│  - /api/products                        │
│  - Validación                           │
│  - Base de datos                        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│       Database (Prisma + SQLite)        │
│  - Models: Product, Category, User      │
└─────────────────────────────────────────┘
```

---

## 📏 Reglas de Arquitectura

### **1. Tamaño de Archivos:**
- ✅ Componentes: < 300 líneas
- ✅ Hooks: < 150 líneas
- ✅ Pages: < 150 líneas
- ✅ API Routes: < 100 líneas

### **2. Naming Conventions:**
```
Components:     PascalCase    (ProductCard.tsx)
Hooks:          camelCase     (use-products.ts)
Types:          PascalCase    (Product interface)
Constants:      UPPER_CASE    (MAX_IMAGE_SIZE)
Functions:      camelCase     (fetchProducts)
```

### **3. Import Order:**
```typescript
// 1. React/Next.js
import { useState } from 'react'
import Image from 'next/image'

// 2. External libraries
import { Package } from 'lucide-react'

// 3. Types
import { Product } from '@/types'

// 4. Internal components
import { ProductCard } from '@/components/store/products/product-card'

// 5. Hooks
import { useProducts } from '@/hooks/use-products'

// 6. Utils/Lib
import { cn } from '@/lib/utils'
```

### **4. Component Structure:**
```typescript
'use client'

// Imports...

// Types/Interfaces
interface MyComponentProps {
  title: string
}

// Component
export function MyComponent({ title }: MyComponentProps) {
  // 1. Hooks
  const { data } = useFetch()
  
  // 2. Event handlers
  const handleClick = () => {}
  
  // 3. Return JSX
  return <div>{title}</div>
}
```

---

## 🎨 Patrones de Diseño Utilizados

### **1. Container/Presentational:**
```typescript
// Container (con lógica)
function ProductsContainer() {
  const { products, loading } = useProducts()
  return <ProductGrid products={products} loading={loading} />
}

// Presentational (solo UI)
function ProductGrid({ products, loading }: ProductGridProps) {
  if (loading) return <Spinner />
  return <div>{/* render products */}</div>
}
```

### **2. Custom Hooks:**
```typescript
// Lógica reutilizable
function useProducts() {
  const [products, setProducts] = useState([])
  
  const fetchProducts = async () => {
    // fetch logic
  }
  
  return { products, fetchProducts }
}
```

### **3. Composition:**
```typescript
// En lugar de props drilling
<AdminPanel>
  <StatsCards stats={stats} />
  <Tabs>
    <ProductsTable />
    <CategoriesList />
  </Tabs>
</AdminPanel>
```

---

## 📊 Comparativa Antes vs Después

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| **page.tsx** | 530 líneas | ~100 líneas | **-81%** |
| **admin-panel.tsx** | 1086 líneas | ~200 líneas | **-82%** |
| **Interfaces duplicadas** | 4 archivos | 1 archivo centralizado | **-75%** |
| **Lógica en componentes** | Mezclada | Separada en hooks | **100% separada** |
| **Reutilización** | Baja | Alta | **Componentes composables** |
| **Testing** | Difícil | Fácil | **Hooks testeables** |
| **Maintainability** | Complejo | Simple | **SRP aplicado** |

---

## 🚀 Beneficios Obtenidos

✅ **Mantenimiento:** Cambios локаizados, sin efectos secundarios  
✅ **Testing:** Hooks y componentes pequeños = tests fáciles  
✅ **Reutilización:** Componentes compartidos entre páginas  
✅ **Onboarding:** Nuevo developer entiende el código en horas  
✅ **Escalabilidad:** Agregar features sin romper existentes  
✅ **Performance:** Solo se renderiza lo necesario  
✅ **Type Safety:** Tipos centralizados, sin duplicación  

---

## 📝 Próximos Pasos (Futuro)

1. **Agregar TypeScript strict mode**
2. **Implementar React Query** para cache de API
3. **Agregar tests unitarios** (Jest + React Testing Library)
4. **Implementar error boundaries**
5. **Agregar loading skeletons**
6. **Optimizar con React.memo** donde sea necesario
7. **Implementar lazy loading** para rutas pesadas

---

**Última actualización:** 2026-04-24  
**Versión:** 2.0.0 (Refactorizada)
