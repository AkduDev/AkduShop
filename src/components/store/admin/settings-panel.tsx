'use client'

import { useState, useEffect } from 'react'
import { Save, Settings, Store, Phone, Palette, Layout, Tag, Globe, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { SiteSettings, DEFAULT_SETTINGS } from '@/types'

interface SectionConfig {
  title: string
  description: string
  icon: React.ReactNode
  color: string
  bgColor: string
  fields: { key: keyof SiteSettings; label: string; type?: string; placeholder?: string }[]
}

export function SettingsPanel() {
  const [form, setForm] = useState<SiteSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings')
        if (res.ok) {
          setForm(await res.json())
        }
      } catch {
        // fallback
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleChange = (key: keyof SiteSettings, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        toast({
          title: 'Configuración guardada',
          description: 'Los cambios se aplicarán inmediatamente.',
        })
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo guardar la configuración.',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Error de conexión al guardar.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Cargando configuración...
        </CardContent>
      </Card>
    )
  }

  const sections: SectionConfig[] = [
    {
      title: 'Información General',
      description: 'Nombre y descripción de tu tienda',
      icon: <Store className="h-5 w-5" />,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10',
      fields: [
        { key: 'siteName', label: 'Nombre de la tienda', placeholder: 'Mi Tienda Online' },
        { key: 'siteTagline', label: 'Eslogan', placeholder: 'Los mejores productos para ti' },
        { key: 'siteDescription', label: 'Descripción (SEO)', placeholder: 'Descripción para buscadores...' },
      ],
    },
    {
      title: 'Moneda',
      description: 'Configuración de precios y moneda',
      icon: <Globe className="h-5 w-5" />,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      fields: [
        { key: 'currency', label: 'Código de moneda', placeholder: 'USD, EUR, CUP...' },
        { key: 'currencySymbol', label: 'Símbolo', placeholder: '$, €, etc.' },
      ],
    },
    {
      title: 'Contacto',
      description: 'Datos de contacto y WhatsApp',
      icon: <Phone className="h-5 w-5" />,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-500/10',
      fields: [
        { key: 'whatsappNumber', label: 'Número de WhatsApp (solo dígitos)', placeholder: '5351234567' },
        { key: 'address', label: 'Dirección', placeholder: 'Calle Principal #123' },
        { key: 'schedule', label: 'Horario', placeholder: 'Lun - Vie: 9am - 6pm' },
        { key: 'scheduleNote', label: 'Nota de horario (opcional)', placeholder: 'Sábado solo con cita previa' },
      ],
    },
    {
      title: 'Hero Section',
      description: 'Sección principal de la página',
      icon: <Layout className="h-5 w-5" />,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-500/10',
      fields: [
        { key: 'heroBadge', label: 'Badge del Hero', placeholder: 'Nuevos productos' },
        { key: 'heroTitle', label: 'Título del Hero', placeholder: 'Descubre lo mejor' },
        { key: 'heroSubtitle', label: 'Subtítulo del Hero', placeholder: 'Explora nuestra colección...' },
        { key: 'heroCtaText', label: 'Texto del botón CTA principal', placeholder: 'Ver productos' },
        { key: 'heroCtaContactText', label: 'Texto del botón de contacto', placeholder: 'Contáctanos' },
      ],
    },
    {
      title: 'Productos & Tienda',
      description: 'Textos de la sección de productos',
      icon: <Tag className="h-5 w-5" />,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-500/10',
      fields: [
        { key: 'featuredTitle', label: 'Título de sección Destacados', placeholder: 'Productos Destacados' },
        { key: 'shippingText', label: 'Texto de envío (badge)', placeholder: 'Envío gratis' },
        { key: 'searchPlaceholder', label: 'Placeholder del buscador', placeholder: 'Buscar productos...' },
        { key: 'noProductsText', label: 'Mensaje sin productos', placeholder: 'No hay productos disponibles' },
        { key: 'noSearchResultsText', label: 'Sin resultados de búsqueda', placeholder: 'No encontramos resultados' },
      ],
    },
    {
      title: 'Sección de Contacto',
      description: 'Textos del footer y contacto',
      icon: <ShoppingBag className="h-5 w-5" />,
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-500/10',
      fields: [
        { key: 'contactTitle', label: 'Título de contacto', placeholder: '¿Necesitas ayuda?' },
        { key: 'contactSubtitle', label: 'Subtítulo de contacto', placeholder: 'Estamos para servirte' },
        { key: 'cartTitle', label: 'Título del carrito', placeholder: 'Tu Carrito' },
      ],
    },
    {
      title: 'Personalización Visual',
      description: 'Colores y branding de la tienda',
      icon: <Palette className="h-5 w-5" />,
      color: 'text-pink-600 dark:text-pink-400',
      bgColor: 'bg-pink-500/10',
      fields: [
        { key: 'primaryColor', label: 'Color primario (hex)', placeholder: '#3b82f6' },
        { key: 'logoUrl', label: 'URL del logo', placeholder: 'https://...' },
        { key: 'faviconUrl', label: 'URL del favicon', placeholder: 'https://...' },
      ],
    },
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border-border/50 overflow-hidden">
        <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Configuración de la Tienda</h2>
              <p className="text-sm text-muted-foreground">
                Personaliza toda la información de tu tienda
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Section Tabs - Mobile scroll */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {sections.map((section) => (
          <button
            key={section.title}
            onClick={() => setActiveSection(activeSection === section.title ? null : section.title)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeSection === section.title
                ? `${section.bgColor} ${section.color} ring-1 ring-current/20`
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {section.icon}
            <span className="hidden sm:inline">{section.title}</span>
          </button>
        ))}
      </div>

      {/* Sections */}
      {sections.map((section, index) => {
        const isOpen = activeSection === null || activeSection === section.title

        return (
          <Card
            key={section.title}
            className={`border-border/50 overflow-hidden transition-all duration-200 ${
              !isOpen ? 'opacity-50' : ''
            }`}
          >
            <button
              onClick={() => setActiveSection(activeSection === section.title ? null : section.title)}
              className="w-full"
            >
              <CardHeader className="pb-3 cursor-pointer hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${section.bgColor} ${section.color}`}>
                    {section.icon}
                  </div>
                  <div className="text-left flex-1">
                    <CardTitle className="text-base">{section.title}</CardTitle>
                    <CardDescription className="text-xs">{section.description}</CardDescription>
                  </div>
                  <div className={`text-xs font-medium ${section.color}`}>
                    {isOpen ? '−' : '+'}
                  </div>
                </div>
              </CardHeader>
            </button>

            {isOpen && (
              <CardContent className="pt-0">
                <Separator className="mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.fields.map(({ key, label, type, placeholder }) => (
                    <div key={key} className="space-y-1.5">
                      <Label htmlFor={key} className="text-xs font-medium text-muted-foreground">
                        {label}
                      </Label>
                      {key === 'address' || key === 'heroSubtitle' || key === 'contactSubtitle' ? (
                        <Textarea
                          id={key}
                          value={form[key]}
                          onChange={(e) => handleChange(key, e.target.value)}
                          rows={2}
                          placeholder={placeholder}
                          className="text-sm resize-none"
                        />
                      ) : (
                        <Input
                          id={key}
                          type={type || 'text'}
                          value={form[key]}
                          onChange={(e) => handleChange(key, e.target.value)}
                          placeholder={placeholder}
                          className="text-sm"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}

      {/* Save Button */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Los cambios se aplicarán inmediatamente
            </p>
            <Button onClick={handleSave} disabled={saving} className="px-6">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
