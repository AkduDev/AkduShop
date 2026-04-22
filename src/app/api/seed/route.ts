import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Verificar si ya existe el admin
    const existingAdmin = await db.user.findUnique({
      where: { email: 'admin@lesly.com' }
    })
    
    if (!existingAdmin) {
      // Crear usuario admin
      await db.user.create({
        data: {
          email: 'admin@lesly.com',
          name: 'admin Lesly',
          password: '123Lesly',
          role: 'admin'
        }
      })
    }
    
    // Verificar si ya hay categorías
    const existingCategories = await db.category.count()
    
    if (existingCategories === 0) {
      // Crear categorías por defecto
      const categories = await Promise.all([
        db.category.create({
          data: {
            name: 'Ejecutivos',
            description: 'Bolsos y portafolios ejecutivos de cuero premium'
          }
        }),
        db.category.create({
          data: {
            name: 'Carteras',
            description: 'Carteras elegantes para damas'
          }
        }),
        db.category.create({
          data: {
            name: 'Mochilas',
            description: 'Mochilas modernas y funcionales'
          }
        }),
        db.category.create({
          data: {
            name: 'Playa',
            description: 'Bolsos de playa artesanales'
          }
        }),
        db.category.create({
          data: {
            name: 'Casuales',
            description: 'Bolsos casuales para el día a día'
          }
        })
      ])
      
      // Crear productos de ejemplo con las nuevas categorías
      const sampleProducts = [
        {
          name: 'Bolso Ejecutivo Cuero Negro',
          description: 'Elegante bolso ejecutivo de cuero genuino en color negro. Perfecto para reuniones de negocios y uso diario.',
          price: 89.99,
          imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500',
          categoryId: categories[0].id, // Ejecutivos
          stock: 15,
          featured: true
        },
        {
          name: 'Cartera Clásica Mujer',
          description: 'Cartera de cuero suave con múltiples compartimentos. Diseño clásico y elegante.',
          price: 45.99,
          imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500',
          categoryId: categories[1].id, // Carteras
          stock: 25,
          featured: true
        },
        {
          name: 'Mochila Urbana',
          description: 'Mochila moderna con diseño urbano. Resistente al agua con múltiples bolsillos.',
          price: 65.99,
          imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
          categoryId: categories[2].id, // Mochilas
          stock: 20,
          featured: false
        },
        {
          name: 'Bolso Playa Trenzado',
          description: 'Bolso de playa artesanal con diseño trenzado. Perfecto para el verano.',
          price: 35.99,
          imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500',
          categoryId: categories[3].id, // Playa
          stock: 30,
          featured: false
        },
        {
          name: 'Portafolio Ejecutivo',
          description: 'Portafolio de cuero premium para documentos y laptop. Diseño profesional.',
          price: 129.99,
          imageUrl: 'https://images.unsplash.com/photo-1559563458-527698bf5295?w=500',
          categoryId: categories[0].id, // Ejecutivos
          stock: 10,
          featured: true
        },
        {
          name: 'Bolso Cruzado Casual',
          description: 'Bolso cruzado casual perfecto para el día a día. Ajustable y cómodo.',
          price: 39.99,
          imageUrl: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=500',
          categoryId: categories[4].id, // Casuales
          stock: 40,
          featured: false
        }
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
