import { getSettings } from '@/lib/settings'
import type { Metadata } from 'next'
import { StoreLayout } from '@/components/store/layout/store-layout'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  return {
    title: `Términos y Condiciones - ${settings.siteName}`,
    description: `Términos y condiciones de uso de ${settings.siteName}`,
  }
}

export default async function TermsPage() {
  const settings = await getSettings()
  const businessName = settings.siteName || 'Mi Tienda'
  const address = settings.address || 'Dirección no especificada'
  const whatsapp = settings.whatsappNumber || ''
  const legalEmail = settings.legalEmail || settings.whatsappNumber || ''
  const legalPhone = settings.legalPhone || settings.whatsappNumber || ''
  const jurisdiction = settings.legalJurisdiction || 'La Habana, Cuba'
  const currency = settings.currency || 'USD'
  const year = new Date().getFullYear()

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Términos y Condiciones</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm sm:text-base leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Identificación del Vendedor</h2>
            <p className="text-muted-foreground">
              En adelante, <strong>{businessName}</strong>, con domicilio en <strong>{address}</strong>, 
              pone a disposición de los usuarios el presente sitio web con el fin de facilitar la compra de productos 
              a través de medios digitales.
            </p>
            <p className="text-muted-foreground mt-2">
              Para consultas o reclamaciones, puede contactarnos a través de:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              {legalEmail && <li>Correo electrónico: <strong>{legalEmail}</strong></li>}
              {legalPhone && <li>Teléfono: <strong>{legalPhone}</strong></li>}
              {whatsapp && <li>WhatsApp: <strong>{whatsapp}</strong></li>}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Objeto</h2>
            <p className="text-muted-foreground">
              Los presentes Términos y Condiciones regulan el uso del sitio web de {businessName} y las 
              transacciones realizadas a través del mismo. Al acceder o utilizar este sitio web, el usuario 
              declara haber leído, comprendido y aceptado estos términos en su totalidad.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Productos y Precios</h2>
            <p className="text-muted-foreground">
              Todos los precios mostrados en el sitio están expresados en <strong>{currency}</strong>. Los precios 
              pueden cambiar sin previo aviso, aunque los cambios no afectarán a los pedidos ya confirmados.
            </p>
            <p className="text-muted-foreground mt-2">
              Las imágenes de los productos son ilustrativas y pueden diferir ligeramente del producto real en cuanto 
              a color, dimensiones o detalles de acabado.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Proceso de Compra</h2>
            <p className="text-muted-foreground">
              El proceso de compra se realiza a través del carrito de compras y se finaliza mediante contacto por 
              WhatsApp. El usuario realiza los siguientes pasos:
            </p>
            <ol className="list-decimal list-inside text-muted-foreground mt-2 space-y-1">
              <li>Selección de productos y añadido al carrito.</li>
              <li>Revisión del carrito y confirmación de cantidades.</li>
              <li>Inicio del proceso de envío del pedido por WhatsApp.</li>
              <li>Confirmación del pedido por parte de {businessName}.</li>
              <li>Entrega y pago contra entrega.</li>
            </ol>
            <p className="text-muted-foreground mt-2">
              El envío del pedido por WhatsApp no constituye una confirmación definitiva. {businessName} se reserva 
              el derecho de confirmar o rechazar el pedido, especialmente en caso de errores de precios o 
              disponibilidad de stock.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Forma de Pago</h2>
            <p className="text-muted-foreground">
              El pago se realiza contra entrega del producto. No se requiere pago anticipado ni información 
              de tarjetas de crédito o débito a través de este sitio web. El monto total se cancela en el momento 
              de recibir el producto.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Envíos y Entregas</h2>
            <p className="text-muted-foreground">
              {businessName} realiza envíos según la zona de cobertura indicada. Los tiempos de entrega son 
              estimados y pueden variar según la ubicación y disponibilidad del producto.
            </p>
            <p className="text-muted-foreground mt-2">
              El usuario es responsable de proporcionar datos de contacto y dirección correctos. {businessName} no 
              se hace responsable por demoras o fallos en la entrega derivados de información incorrecta 
              proporcionada por el usuario.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Derecho de Desistimiento y Devoluciones</h2>
            <p className="text-muted-foreground">
              El usuario tiene derecho a desistir de la compra dentro de los <strong>7 días naturales</strong> 
              siguientes a la recepción del producto, siempre que este se encuentre en las mismas condiciones 
              en que fue entregado, sin usar y con su embalaje original.
            </p>
            <p className="text-muted-foreground mt-2">
              Para gestionar una devolución, el usuario deberá contactar a {businessName} a través de los canales 
              de comunicación disponibles (WhatsApp, teléfono o correo electrónico).
            </p>
            <p className="text-muted-foreground mt-2">
              No se aceptarán devoluciones de productos que:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-1 space-y-1">
              <li>Hayan sido utilizados o manipulados.</li>
              <li>No incluyan el embalaje original.</li>
              <li>Presenten daños causados por el usuario.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Limitación de Responsabilidad</h2>
            <p className="text-muted-foreground">
              {businessName} no será responsable por:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Daños derivados del uso indebido de los productos.</li>
              <li>Pérdidas o daños indirectos.</li>
              <li>Interrupciones del servicio o errores del sitio web.</li>
              <li>Daños causados por virus o código malicioso.</li>
              <li>Reclamaciones derivadas del uso de terceros del sitio web.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Propiedad Intelectual</h2>
            <p className="text-muted-foreground">
              Todo el contenido del sitio web, incluyendo pero no limitado a textos, imágenes, logotipos, 
              diseños, gráficos y código fuente, es propiedad de {businessName} o de terceros con licencia, 
              y está protegido por las leyes de propiedad intelectual vigentes.
            </p>
            <p className="text-muted-foreground mt-2">
              Queda prohibida la reproducción, distribución, modificación o cualquier otro uso no autorizado 
              del contenido sin el consentimiento previo y por escrito de {businessName}.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Protección de Datos Personales</h2>
            <p className="text-muted-foreground">
              {businessName} recopila y trata los datos personales del usuario de conformidad con nuestra 
              <a href="/privacy" className="text-primary hover:underline"> Política de Privacidad</a>, 
              que forma parte integral de estos términos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Modificaciones</h2>
            <p className="text-muted-foreground">
              {businessName} se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. 
              Las modificaciones entrarán en vigor desde su publicación en el sitio web. El uso continuado del 
              sitio después de dichas modificaciones constituye la aceptación de los mismos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Jurisdicción Aplicable y Legislación</h2>
            <p className="text-muted-foreground">
              Los presentes Términos y Condiciones se rigen por la legislación vigente en <strong>{jurisdiction}</strong>. 
              Cualquier controversia derivada de la interpretación o ejecución de estos términos será sometida a los 
              tribunales competentes de <strong>{jurisdiction}</strong>, renunciando expresamente a cualquier otro fuero 
              que pudiera corresponderles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">13. Contacto</h2>
            <p className="text-muted-foreground">
              Si tiene alguna pregunta sobre estos Términos y Condiciones, puede contactarnos:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              {legalEmail && <li>Email: <strong>{legalEmail}</strong></li>}
              {legalPhone && <li>Teléfono: <strong>{legalPhone}</strong></li>}
              {whatsapp && <li>WhatsApp: <strong>{whatsapp}</strong></li>}
              <li>Dirección: <strong>{address}</strong></li>
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-border/50 text-center">
          <p className="text-xs text-muted-foreground">
            © {year} {businessName}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </StoreLayout>
  )
}
