import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

// Importamos la función y el tipo desde tu archivo centralizado
import { getTurnByNumber, TurnData } from "@/lib/supabaseQueries";

// Importamos tus componentes visuales
import StatusBanner from "@/components/StatusBanner";
import TurnDisplay from "@/components/TurnDisplay";
import AppointmentInfo from "@/components/AppointmentInfo";

const ConsultaTurno = () => {
  // Capturamos el ID de la URL (ej: SAMPLE-100)
  const { id } = useParams<{ id: string }>();
  
  const [loading, setLoading] = useState(true);
  const [turno, setTurno] = useState<TurnData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchTurno = async () => {
      if (!id) return;
      
      try {
        // Usamos la función centralizada que definimos antes
        const data = await getTurnByNumber(id);

        if (isMounted) {
          if (data) {
            setTurno(data);
            setError(false);
          } else {
            setError(true);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("Error al obtener turno:", err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    fetchTurno();

    // Polling: Actualizar datos cada 15 segundos para ver si cambió de estado (opcional)
    const interval = setInterval(fetchTurno, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [id]);

  // --- Renderizado de Estados de Carga y Error ---

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !turno) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="text-center space-y-4">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
             <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Turno no encontrado</h1>
          <p className="text-gray-500 max-w-xs mx-auto">
            No pudimos encontrar el turno <strong>{id}</strong>. Verifique que el enlace o el código QR sean correctos.
          </p>
        </div>
      </div>
    );
  }

  // --- Lógica de visualización de datos ---

  // 1. Texto de tiempo estimado
  const tiempoEstimadoTexto = turno.categoria_tiempo 
    ? `${turno.categoria_tiempo} minutos` 
    : "unos minutos";

  // 2. Cálculo de la hora de la cita
  // Si tenemos fecha_creacion, le sumamos el tiempo estimado. Si no, usamos hora actual.
  let horaCita = "---";
  if (turno.fecha_creacion) {
    const fechaBase = new Date(turno.fecha_creacion);
    const minutosASumar = turno.categoria_tiempo || 15; // Default 15 min si no hay dato
    fechaBase.setMinutes(fechaBase.getMinutes() + minutosASumar);
    horaCita = fechaBase.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-6 px-4 md:py-12">
      
      {/* Header Falso (Estilo App Movil) */}
      <div className="w-full max-w-md bg-white rounded-t-2xl border-b p-4 flex justify-between items-center shadow-sm">
        <div className="font-bold text-xl text-slate-800 tracking-tight">Mi Turno</div>
        <div className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded">
          {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Contenedor Principal */}
      <div className="w-full max-w-md bg-white p-6 rounded-b-2xl shadow-xl space-y-6">
        
        {/* Componente 1: TurnDisplay (Muestra el número grande) */}
        <TurnDisplay turnNumber={turno.numero || "---"} />

        {/* Componente 2: StatusBanner (El "Semáforo") 
            Este cambia de color solo basado en el estado que viene de la BD */}
        <StatusBanner 
          estado={turno.estado} 
          tiempoEspera={turno.tiempo_espera || turno.categoria_tiempo}
        />

        {/* Componente 3: AppointmentInfo (Iconos y Datos) */}
        <AppointmentInfo 
          estimatedTime={tiempoEstimadoTexto}
          appointmentTime={horaCita}
          location={turno.categoria_nombre || "Atención General"} 
        />

        {/* Sección Informativa (Footer de la tarjeta) */}
        <div className="mt-8 bg-slate-50 p-5 rounded-xl text-sm text-slate-600 border border-slate-100">
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              Favor acercarse a su cita con al menos 10 minutos de anticipación.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              Recuerde traer su documento de identidad si fue solicitado.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              Si el semáforo cambia a <strong className="text-red-600">Rojo</strong>, su atención es inmediata.
            </li>
          </ul>
        </div>

      </div>

      {/* Footer fuera de la tarjeta */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-400">Sistema de Gestión de Turnos</p>
      </div>
    </div>
  );
};

export default ConsultaTurno;