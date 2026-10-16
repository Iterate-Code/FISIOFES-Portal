import { ServicePage } from '@/components/service-page'
export default function Page() {
  return (
    <ServicePage
      eyebrow="MOVIMIENTO CON CONTROL"
      title={
        <>
          Pilates para sentirte <em>fuerte y capaz.</em>
        </>
      }
      intro="Sesiones guiadas en grupos reducidos para mejorar control, movilidad y fuerza a cualquier edad."
      categorySlug="pilates"
      duration="50 min"
      bullets={[
        'Primera clase como oferta de entrada',
        'Grupos reducidos y atención cercana',
        'Ejercicios adaptados a tu nivel',
        'Progresión medible y segura',
      ]}
    >
      <p>
        Más que una clase, es una práctica para habitar mejor tu cuerpo. Te acompañamos a construir
        fuerza sin perder movilidad ni disfrute.
      </p>
    </ServicePage>
  )
}
