# Sistema de Imágenes - Carteras Lesly

## 📸 Nuevo Sistema de Almacenamiento Local

### ✅ Cambios Realizados

1. **Endpoint de subida**: `/api/upload`
   - Recibe archivos de imagen vía FormData
   - Valida tipo y tamaño (máx 5MB)
   - Guarda en `/public/uploads/products/`
   - Retorna URL relativa: `/uploads/products/timestamp-random.jpg`

2. **Panel de Admin Actualizado**
   - Ahora sube imágenes al servidor en lugar de convertir a Base64
   - Mantiene la URL en la base de datos (más ligero)
   - Las imágenes se sirven directamente por Next.js

3. **Migración de Imágenes Existentes**
   - Endpoint: `/api/migrate-images`
   - Convierte imágenes Base64 almacenadas en BD a archivos locales
   - Actualiza las URLs en la base de datos

---

## 🚀 Cómo Usar

### Subir Nueva Imagen (Desde Admin Panel)
1. Accede al panel de administración
2. Crea o edita un producto
3. Haz clic en "Subir Imagen desde Dispositivo"
4. Selecciona la imagen (JPG, PNG, WebP - máx 5MB)
5. La imagen se sube automáticamente y se muestra el preview

### Migrar Imágenes Base64 Existentes
Si ya tienes productos con imágenes en Base64:

```bash
# Con el servidor corriendo, visita:
http://localhost:3000/api/migrate-images
```

Esto convertirá todas las imágenes Base64 a archivos locales y actualizará la BD.

---

## 📁 Estructura de Archivos

```
public/
└── uploads/
    ├── .gitkeep                    # Mantiene la carpeta en git
    └── products/                   # Imágenes de productos (ignorada en git)
        ├── 1714234567890-a3f2d1.jpg
        ├── 1714234598234-b7e9c2.png
        └── ...
```

---

## 🔧 Configuración .gitignore

```gitignore
# Upload folder
/public/uploads/*
!/public/uploads/.gitkeep
```

**Nota:** Las imágenes subidas NO se guardan en Git. Debes:
- Hacer backup manual de `/public/uploads/products/`
- O migrar a un servicio cloud (Cloudinary, AWS S3, etc.) en producción

---

## 💡 Ventajas del Nuevo Sistema

✅ **Base de datos más ligera** - Solo guarda URLs, no datos binarios  
✅ **Imágenes sin pérdida de calidad** - Se guarda el archivo original  
✅ **Mejor rendimiento** - Next.js sirve archivos estáticos directamente  
✅ **Compatible con `next/image`** - Optimización automática en el frontend  
✅ **Fácil backup** - Las imágenes están en archivos separados  

---

## ⚠️ Consideraciones

1. **Backup**: Recuerda hacer backup de `/public/uploads/products/` regularmente
2. **Producción**: Para entornos de producción, considera:
   - Cloudinary (recomendado)
   - AWS S3
   - Vercel Blob Storage
3. **Espacio en disco**: Monitorea el espacio disponible en el servidor

---

## 🔄 Migración a Cloud (Futuro)

Cuando decidas migrar a un servicio cloud:

1. Las imágenes ya están en archivos separados (fácil de migrar)
2. Solo necesitas cambiar el endpoint `/api/upload`
3. Actualizar las URLs en la base de datos
4. El frontend no necesita cambios (solo URLs)

---

## 📊 Estadísticas

- **Tamaño máximo por imagen**: 5MB
- **Formatos soportados**: JPG, PNG, WebP, GIF
- **Almacenamiento**: Local en `/public/uploads/products/`
- **CDN**: Next.js dev server (producción requiere configuración adicional)
