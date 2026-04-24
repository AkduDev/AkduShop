import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 LIMPIEZA DE DATOS DE PRUEBA\n')
  
  // Eliminar productos de prueba
  console.log('📦 Eliminando productos de prueba...')
  const deletedProducts = await prisma.product.deleteMany({
    where: {
      OR: [
        { name: 'asds' },
        { name: 'Bolso Cruzado Casua' }
      ]
    }
  })
  console.log(`   ✓ ${deletedProducts.count} productos eliminados`)
  
  // Eliminar categorías de prueba
  console.log('\n📁 Eliminando categorías de prueba...')
  const deletedCategories = await prisma.category.deleteMany({
    where: {
      name: 'sadsa'
    }
  })
  console.log(`   ✓ ${deletedCategories.count} categorías eliminadas`)
  
  // Verificar estado final
  console.log('\n📊 ESTADO FINAL:')
  const users = await prisma.user.count()
  const categories = await prisma.category.findMany()
  const products = await prisma.product.findMany()
  
  console.log(`\n👤 Usuarios: ${users}`)
  console.log(`📁 Categorías: ${categories.length}`)
  categories.forEach(c => console.log(`   - ${c.name}`))
  
  console.log(`\n📦 Productos: ${products.length}`)
  products.forEach(p => console.log(`   - ${p.name} - $${p.price}`))
  
  console.log('\n✅ Base de datos limpia y lista para producción!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
