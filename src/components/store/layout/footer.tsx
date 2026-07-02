'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Clock, MessageCircle, Mail, MapPin, Send, Check } from 'lucide-react'
import { useSettings } from '@/lib/settings-context'
import { useToast } from '@/hooks/use-toast'

export function Footer() {
  const { settings } = useSettings()
  const { toast } = useToast()
  const router = useRouter()
  const pathname = usePathname()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [emailError, setEmailError] = useState('')

  useEffect(() => {
    if (subscribed) return
    const dismissed = localStorage.getItem('newsletter-dismissed')
    if (dismissed) setSubscribed(true)
  }, [subscribed])

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    if (!validateEmail(email)) {
      setEmailError('Ingresa un email válido')
      return
    }
    setEmailError('')

    setLoading(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok) {
        setSubscribed(true)
        setEmail('')
        localStorage.setItem('newsletter-dismissed', '1')
        toast({ title: data.message || '¡Suscripción exitosa!' })
      } else {
        toast({ title: data.error || 'Error al suscribirse', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error al conectar con el servidor', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleNavClick = (href: string, isAnchor: boolean) => {
    if (isAnchor && pathname !== '/') {
      router.push('/' + href)
    } else if (isAnchor) {
      const el = document.querySelector(href)
      el?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold mb-3">{settings.siteName}</h3>
            <p className="text-sm text-primary-foreground/70 leading-relaxed mb-4">
              {settings.siteDescription}
            </p>

            <div>
              <h4 className="text-sm font-semibold mb-2 uppercase tracking-wider text-primary-foreground/80">Newsletter</h4>
              {subscribed ? (
                <div className="flex items-center gap-2 text-sm text-primary-foreground/80">
                  <Check className="h-4 w-4" />
                  <span>¡Gracias por suscribirte!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
                      placeholder="Tu email"
                      required
                      className={`flex-1 px-3 py-2 rounded-full bg-primary-foreground/10 border text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-foreground/30 ${emailError ? 'border-red-400' : 'border-primary-foreground/20'}`}
                      aria-label="Email para newsletter"
                      aria-invalid={!!emailError}
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-3 py-2 rounded-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-colors disabled:opacity-50"
                      aria-label="Suscribirse al newsletter"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                  {emailError && <p className="text-xs text-red-400 ml-3">{emailError}</p>}
                </form>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider text-primary-foreground/80">Enlaces</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>
                <button
                  onClick={() => handleNavClick('#productos', true)}
                  className="hover:text-primary-foreground transition-colors"
                >
                  Productos
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('#contacto', true)}
                  className="hover:text-primary-foreground transition-colors"
                >
                  Contacto
                </button>
              </li>
              <li>
                <Link href="/profile" className="hover:text-primary-foreground transition-colors">
                  Mi Cuenta
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary-foreground transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary-foreground transition-colors">
                  Política de Privacidad
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider text-primary-foreground/80">Contacto</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{settings.schedule}</span>
              </li>
              {settings.scheduleNote && (
                <li className="text-xs text-primary-foreground/50 ml-6">{settings.scheduleNote}</li>
              )}
              {settings.legalEmail && (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <a href={`mailto:${settings.legalEmail}`} className="hover:text-primary-foreground transition-colors">
                    {settings.legalEmail}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-primary-foreground/50">
            © {new Date().getFullYear()} {settings.siteName}. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-3">
            <a
              href={`https://wa.me/${settings.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-colors text-sm font-medium"
              aria-label="Contactar por WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
