import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📊 VERIFICACIÓN DE BASE DE DATOS\n')
  
  // Usuarios
  console.log('👤 USUARIOS:')
  const users = await prisma.user.findMany()
  users.forEach(u => {
    console.log(`   - ${u.name} (${u.email}) - Rol: ${u.role}`)
  })
  
  // Categorías
  console.log('\n📁 CATEGORÍAS:')
  const categories = await prisma.category.findMany()
  categories.forEach(c => {
    console.log(`   - ${c.name}: ${c.description || 'Sin descripción'}`)
  })
  
  // Productos
  console.log('\n📦 PRODUCTOS:')
  const products = await prisma.product.findMany({
    include: { category: true }
  })
  products.forEach(p => {
    console.log(`   - ${p.name} - $${p.price} (${p.category.name}) - Stock: ${p.stock}`)
  })
  
  console.log('\n' + '='.repeat(50))
  console.log('✅ Total usuarios:', users.length)
  console.log('✅ Total categorías:', categories.length)
  console.log('✅ Total productos:', products.length)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
