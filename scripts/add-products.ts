import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📦 Agregando productos adicionales...\n')
  
  const categories = await prisma.category.findMany()
  const categoryMap = Object.fromEntries(categories.map(c => [c.name, c.id]))
  
  const additionalProducts = [
    {
      name: 'Cartera Elegante Oro',
      description: 'Cartera de noche con detalles dorados. Perfecta para eventos especiales y ocasiones formales.',
      price: 59.99,
      imageUrl: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=500',
      categoryId: categoryMap['Carteras'],
      stock: 18,
      featured: true
    },
    {
      name: 'Mochila Ejecutiva Premium',
      description: 'Mochila profesional con compartimento acolchado para laptop 15". Diseño elegante y funcional.',
      price: 79.99,
      imageUrl: 'https://images.unsplash.com/photo-1581605405669-fcdf8115afa3?w=500',
      categoryId: categoryMap['Mochilas'],
      stock: 12,
      featured: false
    },
    {
      name: 'Bolso Playa Mediterráneo',
      description: 'Bolso de playa estilo mediterráneo con bolsillos internos. Resistente y espacioso.',
      price: 42.99,
      imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500',
      categoryId: categoryMap['Playa'],
      stock: 22,
      featured: false
    },
    {
      name: 'Bolso Casual Crossbody',
      description: 'Bolso cruzado casual con correa ajustable. Perfecto para el día a día con estilo.',
      price: 39.99,
      imageUrl: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=500',
      categoryId: categoryMap['Casuales'],
      stock: 35,
      featured: false
    },
    {
      name: 'Maletín Ejecutivo Clásico',
      description: 'Maletín de cuero genuino para el ejecutivo moderno. Compartimentos para documentos y dispositivos.',
      price: 149.99,
      imageUrl: 'https://images.unsplash.com/photo-1559563458-527698bf5295?w=500',
      categoryId: categoryMap['Ejecutivos'],
      stock: 8,
      featured: true
    }
  ]
  
  for (const product of additionalProducts) {
    const existing = await prisma.product.findFirst({
      where: { name: product.name }
    })
    
    if (!existing && product.categoryId) {
      await prisma.product.create({ data: product })
      console.log(`   ✓ ${product.name}`)
    }
  }
  
  // Resumen final
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { name: 'asc' }
  })
  
  console.log('\n📦 PRODUCTOS EN PRODUCCIÓN:')
  products.forEach(p => {
    const featured = p.featured ? '⭐' : '  '
    console.log(`${featured} ${p.name} - $${p.price} (${p.category.name})`)
  })
  
  console.log(`\n✅ Total: ${products.length} productos listos para producción!`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
