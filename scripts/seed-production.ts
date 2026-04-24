import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de producción...\n')

  // 1. Crear usuario administrador
  console.log('👤 Creando usuario administrador...')
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@lesly.com' }
  })

  if (existingAdmin) {
    console.log('   ✓ Admin ya existe:', existingAdmin.email)
  } else {
    const admin = await prisma.user.create({
      data: {
        email: 'admin@lesly.com',
        name: 'Admin Lesly',
        password: '123Lesly',
        role: 'admin'
      }
    })
    console.log('   ✓ Admin creado:', admin.email)
  }

  // 2. Crear categorías
  console.log('\n📁 Creando categorías...')
  const categoriesData = [
    { name: 'Ejecutivos', description: 'Bolsos y portafolios ejecutivos de cuero premium' },
    { name: 'Carteras', description: 'Carteras elegantes para damas' },
    { name: 'Mochilas', description: 'Mochilas modernas y funcionales' },
    { name: 'Playa', description: 'Bolsos de playa artesanales' },
    { name: 'Casuales', description: 'Bolsos casuales para el día a día' }
  ]

  const categories = []
  for (const cat of categoriesData) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name }
    })
    
    if (existing) {
      categories.push(existing)
      console.log(`   ✓ Categoría ya existe: ${cat.name}`)
    } else {
      const created = await prisma.category.create({ data: cat })
      categories.push(created)
      console.log(`   ✓ Categoría creada: ${cat.name}`)
    }
  }

  // 3. Crear productos de ejemplo
  console.log('\n📦 Creando productos de ejemplo...')
  const productsCount = await prisma.product.count()
  
  if (productsCount > 0) {
    console.log(`   ✓ Ya existen ${productsCount} productos en la base de datos`)
  } else {
    const sampleProducts = [
      {
        name: 'Bolso Ejecutivo Cuero Negro',
        description: 'Elegante bolso ejecutivo de cuero genuino en color negro. Perfecto para reuniones de negocios y uso diario.',
        price: 89.99,
        imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500',
        categoryId: categories.find(c => c.name === 'Ejecutivos')!.id,
        stock: 15,
        featured: true
      },
      {
        name: 'Cartera Clásica Mujer',
        description: 'Cartera de cuero suave con múltiples compartimentos. Diseño clásico y elegante.',
        price: 45.99,
        imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500',
        categoryId: categories.find(c => c.name === 'Carteras')!.id,
        stock: 25,
        featured: true
      },
      {
        name: 'Mochila Urbana',
        description: 'Mochila moderna con diseño urbano. Resistente al agua con múltiples bolsillos.',
        price: 65.99,
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
        categoryId: categories.find(c => c.name === 'Mochilas')!.id,
        stock: 20,
        featured: false
      },
      {
        name: 'Bolso Playa Trenzado',
        description: 'Bolso de playa artesanal con diseño trenzado. Perfecto para el verano.',
        price: 35.99,
        imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500',
        categoryId: categories.find(c => c.name === 'Playa')!.id,
        stock: 30,
        featured: false
      },
      {
        name: 'Portafolio Ejecutivo',
        description: 'Portafolio de cuero premium para documentos y laptop. Diseño profesional.',
        price: 129.99,
        imageUrl: 'https://images.unsplash.com/photo-1559563458-527698bf5295?w=500',
        categoryId: categories.find(c => c.name === 'Ejecutivos')!.id,
        stock: 10,
        featured: true
      },
      {
        name: 'Bolso Cruzado Casual',
        description: 'Bolso cruzado casual perfecto para el día a día. Ajustable y cómodo.',
        price: 39.99,
        imageUrl: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=500',
        categoryId: categories.find(c => c.name === 'Casuales')!.id,
        stock: 40,
        featured: false
      },
      {
        name: 'Cartera Elegante Oro',
        description: 'Cartera de noche con detalles dorados. Perfecta para eventos especiales.',
        price: 59.99,
        imageUrl: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=500',
        categoryId: categories.find(c => c.name === 'Carteras')!.id,
        stock: 18,
        featured: true
      },
      {
        name: 'Mochila Ejecutiva',
        description: 'Mochila profesional con compartimento para laptop 15". Ideal para profesionales.',
        price: 79.99,
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
        categoryId: categories.find(c => c.name === 'Mochilas')!.id,
        stock: 12,
        featured: false
      }
    ]

    for (const product of sampleProducts) {
      await prisma.product.create({ data: product })
    }
    console.log(`   ✓ ${sampleProducts.length} productos creados`)
  }

  // Resumen final
  console.log('\n' + '='.repeat(50))
  console.log('📊 RESUMEN DE PRODUCCIÓN')
  console.log('='.repeat(50))
  
  const usersCount = await prisma.user.count()
  const catsCount = await prisma.category.count()
  const prodsCount = await prisma.product.count()
  
  console.log(`\n👤 Usuarios: ${usersCount}`)
  console.log(`📁 Categorías: ${catsCount}`)
  console.log(`📦 Productos: ${prodsCount}`)
  
  console.log('\n🔐 CREDENCIALES DE ADMINISTRADOR:')
  console.log('   Email: admin@lesly.com')
  console.log('   Contraseña: 123Lesly')
  
  console.log('\n📞 INFORMACIÓN DE CONTACTO:')
  console.log('   WhatsApp: +53 5 413 3253')
  console.log('   Dirección: Calle 140 # 4112 / 41 y 43, Marianao, Coco Solo')
  console.log('   Horario: 9:00 AM - 8:00 PM')
  
  console.log('\n✅ Base de datos lista para producción!\n')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
