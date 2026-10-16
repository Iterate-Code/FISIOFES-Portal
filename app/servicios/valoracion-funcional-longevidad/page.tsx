import { ServicePage } from '@/components/service-page'
export default function Page() {
  return (
    <ServicePage
      eyebrow="TU LÍNEA BASE"
      title={
        <>
          Valoración funcional y longevidad <em>con propósito.</em>
        </>
      }
      intro="Datos claros para saber dónde estás, qué priorizar y cómo medir tu progreso."
      price="Por confirmar"
      duration="60–75 min"
      bullets={[
        'Composición corporal con InBody',
        'Fuerza, equilibrio y movilidad',
        'Capacidad funcional y resistencia',
        'Semáforo funcional y plan personalizado',
      ]}
    >
      <p>
        La valoración convierte información sobre tu cuerpo en decisiones útiles. No es una prueba
        aislada: es el mapa para empezar con seguridad y avanzar con intención.
      </p>
    </ServicePage>
  )
}
