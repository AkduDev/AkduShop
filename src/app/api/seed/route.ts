import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { DEFAULT_SETTINGS } from '@/types'

export async function GET() {
  try {
    const existingAdmin = await db.user.findUnique({
      where: { email: 'admin@lesly.com' }
    })

    if (!existingAdmin) {
      await db.user.create({
        data: {
          email: 'admin@lesly.com',
          name: 'admin Lesly',
          password: await hashPassword('123Lesly'),
          role: 'admin'
        }
      })
    }

    const existingSettings = await db.siteSetting.count()

    if (existingSettings === 0) {
      for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
        await db.siteSetting.create({
          data: { key, value }
        })
      }
    }

    const existingCategories = await db.category.count()

    if (existingCategories === 0) {
      const categories = await Promise.all([
        db.category.create({
          data: { name: 'Electrónicos', description: 'Dispositivos y accesorios electrónicos' }
        }),
        db.category.create({
          data: { name: 'Ropa y Accesorios', description: 'Prendas de vestir y accesorios de moda' }
        }),
        db.category.create({
          data: { name: 'Hogar y Decoración', description: 'Artículos para el hogar y decoración' }
        }),
        db.category.create({
          data: { name: 'Deportes y Aire Libre', description: 'Equipamiento deportivo y actividades al aire libre' }
        }),
        db.category.create({
          data: { name: 'Salud y Belleza', description: 'Productos de cuidado personal y belleza' }
        }),
        db.category.create({
          data: { name: 'Juguetes y Entretenimiento', description: 'Juguetes y artículos de entretenimiento' }
        }),
      ])

      const sampleProducts = [
        {
          name: 'Auriculares Bluetooth Premium',
          description: 'Auriculares inalámbricos con cancelación de ruido activa y 30 horas de batería.',
          price: 79.99,
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
          categoryId: categories[0].id,
          stock: 25,
          featured: true
        },
        {
          name: 'Camiseta Algodón Premium',
          description: 'Camiseta de algodón orgánico de alta calidad. Cómoda y duradera.',
          price: 29.99,
          imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
          categoryId: categories[1].id,
          stock: 50,
          featured: true
        },
        {
          name: 'Lámpara de Mesa Moderna',
          description: 'Lámpara de escritorio con diseño minimalista. Luz LED regulable.',
          price: 49.99,
          imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=500',
          categoryId: categories[2].id,
          stock: 15,
          featured: false
        },
        {
          name: 'Botella Deportiva Reutilizable',
          description: 'Botella de acero inoxidable que mantiene la temperatura por 24 horas.',
          price: 24.99,
          imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500',
          categoryId: categories[3].id,
          stock: 100,
          featured: false
        },
        {
          name: 'Set de Cuidado Facial',
          description: 'Kit completo de cuidado facial con productos naturales y orgánicos.',
          price: 39.99,
          imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500',
          categoryId: categories[4].id,
          stock: 30,
          featured: true
        },
        {
          name: 'Rompecabezas 1000 Piezas',
          description: 'Rompecabezas de alta calidad con diseño artístico. Horas de entretenimiento.',
          price: 19.99,
          imageUrl: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=500',
          categoryId: categories[5].id,
          stock: 45,
          featured: false
        },
      ]

      for (const product of sampleProducts) {
        await db.product.create({ data: product })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Base de datos inicializada correctamente',
      admin: { email: 'admin@lesly.com', password: '123Lesly' }
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Error al inicializar base de datos' },
      { status: 500 }
    )
  }
}
