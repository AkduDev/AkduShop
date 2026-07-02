import { getSettings } from '@/lib/settings'
import type { Metadata } from 'next'
import { StoreLayout } from '@/components/store/layout/store-layout'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  return {
    title: `Política de Privacidad - ${settings.siteName}`,
    description: `Política de privacidad y tratamiento de datos de ${settings.siteName}`,
  }
}

export default async function PrivacyPage() {
  const settings = await getSettings()
  const businessName = settings.siteName || 'Mi Tienda'
  const address = settings.address || 'Dirección no especificada'
  const whatsapp = settings.whatsappNumber || ''
  const legalEmail = settings.legalEmail || settings.whatsappNumber || ''
  const legalPhone = settings.legalPhone || settings.whatsappNumber || ''
  const jurisdiction = settings.legalJurisdiction || 'La Habana, Cuba'
  const year = new Date().getFullYear()

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Política de Privacidad</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm sm:text-base leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Responsable del Tratamiento</h2>
            <p className="text-muted-foreground">
              El responsable del tratamiento de los datos personales recopilados a través de este sitio web es:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li><strong>Razón social:</strong> {businessName}</li>
              <li><strong>Domicilio:</strong> {address}</li>
              {legalEmail && <li><strong>Email:</strong> {legalEmail}</li>}
              {legalPhone && <li><strong>Teléfono:</strong> {legalPhone}</li>}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Datos que Recopilamos</h2>
            <p className="text-muted-foreground">
              A través de este sitio web, {businessName} puede recopilar los siguientes datos personales:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li><strong>Nombre completo</strong> — al crear una cuenta o realizar un pedido.</li>
              <li><strong>Dirección de correo electrónico</strong> — para identificación, comunicación y alertas de stock.</li>
              <li><strong>Número de teléfono</strong> — para la gestión y seguimiento de pedidos.</li>
              <li><strong>Dirección física</strong> — para la entrega de productos.</li>
              <li><strong>Datos de navegación</strong> — cookies técnicas necesarias para el funcionamiento del sitio (carrito de compras, sesión de usuario).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Finalidad del Tratamiento</h2>
            <p className="text-muted-foreground">
              Los datos personales recopilados serán utilizados para las siguientes finalidades:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Gestión y procesamiento de pedidos.</li>
              <li>Comunicación sobre el estado del pedido y entregas.</li>
              <li>Gestión de la cuenta de usuario del cliente.</li>
              <li>Envío de notificaciones sobre disponibilidad de productos (cuando el usuario se suscribe a alertas de stock).</li>
              <li>Mejora de la experiencia de compra y del sitio web.</li>
              <li>Cumplimiento de obligaciones legales.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Base Legal del Tratamiento</h2>
            <p className="text-muted-foreground">
              El tratamiento de sus datos personales se fundamenta en:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li><strong>Consentimiento del interesado:</strong> al proporcionar sus datos al registrarse, realizar un pedido o suscribirse a alertas.</li>
              <li><strong>Ejecución de un contrato:</strong> para el procesamiento y entrega de pedidos.</li>
              <li><strong>Interés legítimo:</strong> para la mejora del servicio y prevención de fraude.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Conservación de los Datos</h2>
            <p className="text-muted-foreground">
              Los datos personales se conservarán durante los siguientes períodos:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li><strong>Datos de cuenta:</strong> mientras la cuenta esté activa o hasta que el usuario solicite su eliminación.</li>
              <li><strong>Datos de pedidos:</strong> durante 5 años desde la última transacción, por obligaciones legales y contables.</li>
              <li><strong>Alertas de stock:</strong> hasta que el usuario se desuscriba o el producto vuelva a estar disponible.</li>
              <li><strong>Cookies:</strong> según se describe en la sección de Cookies de esta política.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Cookies</h2>
            <p className="text-muted-foreground">
              Este sitio web utiliza cookies estrictamente necesarias para su funcionamiento:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li><strong>Cookie de sesión:</strong> para mantener al usuario autenticado durante su navegación.</li>
              <li><strong>Almacenamiento local (localStorage):</strong> para persistir el contenido del carrito de compras y la preferencia de tema (claro/oscuro) en el dispositivo del usuario.</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              No se utilizan cookies de rastreo, publicitarias ni de análisis de terceros. Los datos del carrito 
              se almacenan exclusivamente en el navegador del usuario y no se transmiten a servidores externos 
              hasta que se inicie el proceso de compra.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Compartición de Datos con Terceros</h2>
            <p className="text-muted-foreground">
              {businessName} no vende, alquila ni comparte datos personales con terceros para fines comerciales, 
              excepto en los siguientes casos:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li><strong>Proveedores de servicios:</strong> servicios de hosting, infraestructura tecnológica y almacenamiento en la nube necesarios para el funcionamiento del sitio.</li>
              <li><strong>Obligaciones legales:</strong> cuando sea requerido por autoridades competentes o por aplicación de la ley.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Seguridad de los Datos</h2>
            <p className="text-muted-foreground">
              {businessName} implementa medidas de seguridad técnicas y organizativas para proteger los datos 
              personales contra accesos no autorizados, pérdida, alteración o divulgación. Estas medidas incluyen:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Encriptación de contraseñas con algoritmos criptográficos seguros (scrypt).</li>
              <li>Comunicación cifrada mediante HTTPS/TLS.</li>
              <li>Acceso restringido a los datos personales solo al personal autorizado.</li>
              <li>Política de contraseñas seguras.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Derechos del Usuario</h2>
            <p className="text-muted-foreground">
              De conformidad con la legislación vigente en materia de protección de datos, usted tiene derecho a:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li><strong>Acceso:</strong> conocer qué datos personales tenemos sobre usted.</li>
              <li><strong>Rectificación:</strong> solicitar la corrección de datos inexactos.</li>
              <li><strong>Eliminación:</strong> solicitar la supresión de sus datos personales.</li>
              <li><strong>Oposición:</strong> oponerse al tratamiento de sus datos para fines específicos.</li>
              <li><strong>Portabilidad:</strong> recibir sus datos en un formato estructurado y de uso común.</li>
              <li><strong>Revocación del consentimiento:</strong> en cualquier momento, sin que ello afecte la licitud del tratamiento anterior.</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Para ejercer cualquiera de estos derechos, puede contactarnos a través de los canales indicados 
              en esta política. Responderemos a su solicitud en un plazo máximo de 30 días.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Menores de Edad</h2>
            <p className="text-muted-foreground">
              Este sitio web no está dirigido a menores de 16 años. {businessName} no recopila intencionadamente 
              datos personales de menores de edad. Si usted es padre o tutor y tiene conocimiento de que su hijo 
              nos ha proporcionado datos personales, por favor contáctenos para que podamos tomar las medidas 
              necesarias.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Transferencias Internacionales de Datos</h2>
            <p className="text-muted-foreground">
              En caso de que los datos se transfieran a servidores ubicados fuera de {jurisdiction}, 
              {businessName} se asegurará de que dichas transferencias se realicen con las garantías adecuadas 
              y de conformidad con la legislación vigente en materia de protección de datos personales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Cambios en esta Política</h2>
            <p className="text-muted-foreground">
              {businessName} se reserva el derecho de modificar esta Política de Privacidad en cualquier momento. 
              Los cambios serán publicados en esta página con la fecha de la última actualización. Le recomendamos 
              revisar periódicamente esta política para estar informado sobre cómo protegemos sus datos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">13. Contacto</h2>
            <p className="text-muted-foreground">
              Si tiene alguna pregunta, inquietud o desea ejercer sus derechos sobre el tratamiento de sus datos 
              personales, puede contactarnos:
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
