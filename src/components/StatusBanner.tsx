interface StatusBannerProps {
  estado?: string | null;
  tiempoEspera?: number | null;
  // Si se proporciona `message`, se muestra tal cual y anula la lógica.
  message?: string;
}

const StatusBanner = ({ estado, tiempoEspera, message }: StatusBannerProps) => {
  // Si el caller pasó un mensaje específico, usarlo.
  if (message) {
    return (
      <div className="bg-warning text-warning-foreground px-6 py-4 rounded-lg mb-6 shadow-sm">
        <p className="text-sm md:text-base leading-relaxed">{message}</p>
      </div>
    )
  }

  // Lógica por defecto según `estado` y `tiempoEspera`:
  let bgClass = 'bg-green-100 text-green-900'
  let msg = 'Lista de espera, manténgase atento para presentarse a tiempo.'

  if (estado === 'en_atencion') {
    bgClass = 'bg-red-100 text-red-900'
    msg = 'Usted ya ha sido llamado, acérquese inmediatamente.'
  } else if (estado === 'pendiente') {
    if (typeof tiempoEspera === 'number') {
      if (tiempoEspera <= 30) {
        bgClass = 'bg-yellow-100 text-yellow-900'
        msg = 'Lista de espera, su turno está próximo.'
      } else {
        bgClass = 'bg-green-100 text-green-900'
        msg = 'Lista de espera, manténgase atento para presentarse a tiempo.'
      }
    } else {
      // sin tiempo estimado
      bgClass = 'bg-yellow-100 text-yellow-900'
      msg = 'Lista de espera, su turno está próximo.'
    }
  }

  return (
    <div className={`${bgClass} px-6 py-4 rounded-lg mb-6 shadow-sm`}>
      <p className="text-sm md:text-base leading-relaxed">{msg}</p>
    </div>
  )
}

export default StatusBanner;
