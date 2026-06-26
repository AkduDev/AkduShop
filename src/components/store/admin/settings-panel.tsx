'use client'

import { useState, useEffect } from 'react'
import { Save, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { SiteSettings, DEFAULT_SETTINGS } from '@/types'

export function SettingsPanel() {
  const [form, setForm] = useState<SiteSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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

  const sections: { title: string; fields: { key: keyof SiteSettings; label: string; type?: string }[] }[] = [
    {
      title: 'Información General',
      fields: [
        { key: 'siteName', label: 'Nombre de la tienda' },
        { key: 'siteTagline', label: 'Eslogan' },
        { key: 'siteDescription', label: 'Descripción (SEO)' },
      ],
    },
    {
      title: 'Moneda',
      fields: [
        { key: 'currency', label: 'Código de moneda (USD, EUR, CUP...)' },
        { key: 'currencySymbol', label: 'Símbolo ($, €, etc.)' },
      ],
    },
    {
      title: 'Contacto',
      fields: [
        { key: 'whatsappNumber', label: 'Número de WhatsApp (solo dígitos)' },
        { key: 'address', label: 'Dirección' },
        { key: 'schedule', label: 'Horario' },
        { key: 'scheduleNote', label: 'Nota de horario (opcional)' },
      ],
    },
    {
      title: 'Hero Section',
      fields: [
        { key: 'heroBadge', label: 'Badge del Hero (ej: "Nuevos productos")' },
        { key: 'heroTitle', label: 'Título del Hero' },
        { key: 'heroSubtitle', label: 'Subtítulo del Hero' },
        { key: 'heroCtaText', label: 'Texto del botón CTA principal' },
        { key: 'heroCtaContactText', label: 'Texto del botón CTA de contacto' },
      ],
    },
    {
      title: 'Productos & Tienda',
      fields: [
        { key: 'featuredTitle', label: 'Título de sección Destacados' },
        { key: 'shippingText', label: 'Texto de envío (badge)' },
        { key: 'searchPlaceholder', label: 'Placeholder del buscador' },
        { key: 'noProductsText', label: 'Mensaje cuando no hay productos' },
        { key: 'noSearchResultsText', label: 'Mensaje cuando no hay resultados' },
      ],
    },
    {
      title: 'Contacto',
      fields: [
        { key: 'whatsappNumber', label: 'Número de WhatsApp (solo dígitos)' },
        { key: 'address', label: 'Dirección' },
        { key: 'schedule', label: 'Horario' },
        { key: 'scheduleNote', label: 'Nota de horario (opcional)' },
        { key: 'contactTitle', label: 'Título de la sección de contacto' },
        { key: 'contactSubtitle', label: 'Subtítulo de contacto' },
        { key: 'cartTitle', label: 'Título del carrito de compras' },
      ],
    },
    {
      title: 'Personalización Visual',
      fields: [
        { key: 'primaryColor', label: 'Color primario (ej: #3b82f6)' },
        { key: 'logoUrl', label: 'URL del logo' },
        { key: 'faviconUrl', label: 'URL del favicon' },
      ],
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/5">
            <Settings className="h-5 w-5 text-[var(--gold)]" />
          </div>
          <div>
            <CardTitle>Configuración de la Tienda</CardTitle>
            <CardDescription>
              Personaliza toda la información de tu tienda
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="text-lg font-semibold mb-4 text-foreground/80 border-b pb-2">
              {section.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.fields.map(({ key, label, type }) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>{label}</Label>
                  {key === 'address' || key === 'heroSubtitle' || key === 'contactSubtitle' ? (
                    <Textarea
                      id={key}
                      value={form[key]}
                      onChange={(e) => handleChange(key, e.target.value)}
                      rows={2}
                    />
                  ) : (
                    <Input
                      id={key}
                      type={type || 'text'}
                      value={form[key]}
                      onChange={(e) => handleChange(key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={saving} className="px-8">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
