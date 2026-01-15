interface StatusBannerProps {
  estado?: string | null;
  tiempoEspera?: number | null;
}

const StatusBanner = ({ estado, tiempoEspera }: StatusBannerProps) => {
  // Lógica por defecto (Verde / Emitido)
  // "emitido" significa que el ticket existe pero falta mucho.
  let bgClass = 'bg-green-100 text-green-900 border border-green-200';
  let msg = 'Su turno aún está en lista de espera, manténgase atento.';

  // --- LÓGICA DE ESTADOS ---

  if (estado === 'llamado') {
    // ROJO: Urgencia
    bgClass = 'bg-red-500 text-white animate-pulse font-bold';
    msg = 'Usted ya ha sido llamado, por favor acercarse inmediatamente caso contrario perderá su turno.';
  
  } else if (estado === 'en_espera') {
    // AMARILLO: Próximo
    bgClass = 'bg-yellow-100 text-yellow-900 border border-yellow-200 font-medium';
    msg = 'Aún se encuentra en lista de espera, pero su turno está próximo.';
  
  } else if (estado === 'emitido') {
    // VERDE: Normal (Sobrescribe el default para ser explícitos)
    bgClass = 'bg-green-100 text-green-800 border border-green-200';
    msg = 'Su turno aún está en lista de espera, manténgase atento para presentarse a tiempo.';

  } else if (estado === 'perdido') {
    // NEGRO: Este estado lo manejaremos principalmente ocultando la info en la página,
    // pero si el banner se renderiza, se verá así:
    bgClass = 'bg-black text-white font-bold tracking-widest uppercase';
    msg = 'TURNO PERDIDO';
  }

  return (
    <div className={`${bgClass} px-6 py-6 rounded-xl mb-6 shadow-sm text-center transition-colors duration-300`}>
      <p className="text-sm md:text-base leading-relaxed">{msg}</p>
    </div>
  );
};

export default StatusBanner;