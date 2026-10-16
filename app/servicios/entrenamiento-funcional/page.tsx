import { ServicePage } from '@/components/service-page'
export default function Page() {
  return (
    <ServicePage
      eyebrow="FUERZA PARA TU VIDA"
      title={
        <>
          Entrenamiento funcional para <em>seguir haciendo.</em>
        </>
      }
      intro="Construye capacidad, equilibrio y potencia para moverte con más libertad hoy y en el futuro."
      categorySlug="entrenamiento-funcional"
      duration="50 min"
      bullets={[
        'Entrenamiento adaptado a tu punto de partida',
        'Fuerza, equilibrio y resistencia',
        'Progresiones claras y alcanzables',
        'Acompañamiento profesional',
      ]}
    >
      <p>
        Entrenamos para vivir mejor, no solo para hacer ejercicio. Cada sesión tiene un propósito
        que se conecta con tu vida real.
      </p>
    </ServicePage>
  )
}
