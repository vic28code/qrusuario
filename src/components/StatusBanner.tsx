interface StatusBannerProps {
  estado?: string | null;
  tiempoEspera?: number | null;
}

const StatusBanner = ({ estado }: StatusBannerProps) => {
  // Configuración de colores según tu pedido
  let bgClass = 'bg-gray-100 text-gray-800';
  let msg = 'Cargando estado...';

  if (estado === 'llamado') {
    // ROJO (Urgente)
    bgClass = 'bg-red-500 text-white font-bold animate-pulse shadow-md';
    msg = '¡SU TURNO HA SIDO LLAMADO! ACÉRQUESE INMEDIATAMENTE.';
  } else if (estado === 'en_espera') {
    // AMARILLO (Próximo)
    bgClass = 'bg-yellow-100 text-yellow-900 border-l-4 border-yellow-500';
    msg = 'Su turno está próximo. Manténgase atento.';
  } else if (estado === 'emitido') {
    // VERDE (Calma/Esperando)
    bgClass = 'bg-green-100 text-green-900 border-l-4 border-green-500';
    msg = 'En lista de espera. Aún faltan turnos por atender.';
  } else {
    // Default
    bgClass = 'bg-green-50 text-green-800';
    msg = 'En espera.';
  }

  return (
    <div className={`${bgClass} px-6 py-5 rounded-lg mb-6 shadow-sm text-center transition-all duration-300`}>
      <p className="text-sm md:text-base">{msg}</p>
    </div>
  );
};

export default StatusBanner;