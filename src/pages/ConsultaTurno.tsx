import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { getTurnByNumber, TurnData } from "@/lib/supabaseQueries";
import StatusBanner from "@/components/StatusBanner";
import TurnDisplay from "@/components/TurnDisplay";
import AppointmentInfo from "@/components/AppointmentInfo";

const ConsultaTurno = () => {
  const { id } = useParams<{ id: string }>();
  
  const [loading, setLoading] = useState(true);
  const [turno, setTurno] = useState<TurnData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchTurno = async () => {
      if (!id) return;
      try {
        const data = await getTurnByNumber(id);
        if (isMounted) {
          // Si es cancelado, mostramos error. Si existe, lo mostramos.
          if (data && data.estado !== 'cancelado') {
            setTurno(data);
            setError(false);
          } else {
            setError(true);
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) { setError(true); setLoading(false); }
      }
    };
    fetchTurno();
    const interval = setInterval(fetchTurno, 5000); // Polling más rápido (5s)
    return () => { isMounted = false; clearInterval(interval); };
  }, [id]);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
    </div>
  );

  // --- PANTALLA NEGRA: TURNO PERDIDO ---
  if (turno?.estado === 'perdido') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white text-center">
         <h1 className="text-4xl font-bold uppercase tracking-widest mb-4">Turno Perdido</h1>
         <p className="text-gray-400 text-lg mb-8">No se presentó al llamado.</p>
         <div className="text-6xl font-black text-gray-800">{turno.numero}</div>
      </div>
    );
  }

  // --- PANTALLA ERROR ---
  if (error || !turno) return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <h1 className="text-2xl font-bold text-gray-800">Turno no encontrado</h1>
      </div>
  );

  // --- CÁLCULO DE HORA ---
  // turno.tiempo_espera YA VIENE DIVIDIDO (ej: 5 minutos)
  const minutosEspera = turno.tiempo_espera || 0;
  
  let horaCita = "---";
  if (turno.fecha_creacion) {
    const fechaBase = new Date(turno.fecha_creacion);
    // Sumamos los minutos correctos (ej: +5 min, no +300 min)
    fechaBase.setMinutes(fechaBase.getMinutes() + minutosEspera);
    horaCita = fechaBase.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-6 px-4 md:py-12">
      {/* Header */}
      <div className="w-full max-w-md bg-white rounded-t-2xl border-b p-4 flex justify-between items-center shadow-sm">
        <div className="font-bold text-xl text-slate-800 tracking-tight">Mi Turno</div>
        <div className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded">
          {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="w-full max-w-md bg-white p-6 rounded-b-2xl shadow-xl space-y-6">
        <TurnDisplay turnNumber={turno.numero || "---"} />

        <StatusBanner 
          estado={turno.estado} 
          tiempoEspera={minutosEspera}
        />

        <AppointmentInfo 
          estimatedTime={`${minutosEspera} minutos`} // Muestra "5 minutos"
          appointmentTime={horaCita}
          location={turno.categoria_nombre || "Atención General"} 
        />
        
        {/* Footer condicional */}
        <div className="mt-8 bg-slate-50 p-5 rounded-xl text-sm text-slate-600 border border-slate-100 text-center">
            {turno.estado === 'llamado' ? (
                <p className="text-red-600 font-bold text-lg animate-pulse">
                    ⚠️ ¡Acérquese inmediatamente!
                </p>
            ) : (
                <ul className="space-y-2 text-left pl-4">
                    <li className="list-disc">Esté atento a la pantalla.</li>
                    <li className="list-disc">Tenga su documento listo.</li>
                </ul>
            )}
        </div>
      </div>
    </div>
  );
};

export default ConsultaTurno;