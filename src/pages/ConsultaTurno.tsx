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
          // Si no existe data o si el turno está cancelado, mostramos error
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
    const interval = setInterval(fetchTurno, 10000); // Actualiza cada 10 seg
    return () => { isMounted = false; clearInterval(interval); };
  }, [id]);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
    </div>
  );

  // --- VISTA ESPECIAL: TURNO PERDIDO ---
  // Si el turno está perdido, mostramos solo la franja negra y ocultamos el resto.
  if (turno?.estado === 'perdido') {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
             {/* Header del Turno (Solo el número) */}
             <div className="pt-10 pb-6 text-center">
                <p className="text-gray-400 uppercase tracking-widest text-sm mb-2">Su turno era</p>
                <h1 className="text-6xl font-black text-gray-300">{turno.numero}</h1>
             </div>
             
             {/* Franja Negra */}
             <div className="bg-black text-white py-12 px-6 text-center">
                <h2 className="text-3xl font-bold uppercase tracking-widest mb-2">Turno Perdido</h2>
                <p className="text-gray-400 text-sm">No se presentó al llamado.</p>
             </div>

             {/* Rayas / Vacio abajo */}
             <div className="h-32 bg-gray-50 flex items-center justify-center opacity-20">
                <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)', backgroundSize: '10px 10px' }}></div>
             </div>
        </div>
      </div>
    );
  }

  // --- VISTA ERROR / NO ENCONTRADO ---
  if (error || !turno) return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Turno no disponible</h1>
        </div>
      </div>
  );

  // --- VISTA NORMAL (Verde, Amarillo, Rojo) ---

  // El tiempo ya viene en minutos gracias al fix en supabaseQueries
  const tiempoMinutos = turno.tiempo_espera || 0;
  const tiempoEstimadoTexto = `${tiempoMinutos} minutos`;

  // Cálculo de hora cita
  let horaCita = "---";
  if (turno.fecha_creacion) {
    const fechaBase = new Date(turno.fecha_creacion);
    // Sumamos los minutos
    fechaBase.setMinutes(fechaBase.getMinutes() + tiempoMinutos);
    horaCita = fechaBase.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-6 px-4 md:py-12">
      {/* Header Estilo App */}
      <div className="w-full max-w-md bg-white rounded-t-2xl border-b p-4 flex justify-between items-center shadow-sm z-10">
        <div className="font-bold text-xl text-slate-800 tracking-tight">Mi Turno</div>
        <div className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded">
          {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="w-full max-w-md bg-white p-6 rounded-b-2xl shadow-xl space-y-6">
        <TurnDisplay turnNumber={turno.numero || "---"} />

        <StatusBanner 
          estado={turno.estado} 
          tiempoEspera={turno.tiempo_espera}
        />

        <AppointmentInfo 
          estimatedTime={tiempoEstimadoTexto}
          appointmentTime={horaCita}
          location={turno.categoria_nombre || "Atención General"} 
        />

        {/* Footer condicional: Si está en rojo, cambiamos el mensaje */}
        <div className="mt-8 bg-slate-50 p-5 rounded-xl text-sm text-slate-600 border border-slate-100">
          {turno.estado === 'llamado' ? (
             <p className="font-bold text-red-600 text-center text-lg">
                ⚠️ ¡Por favor acérquese ya!
             </p>
          ) : (
            <ul className="space-y-3">
                <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                Favor estar atento a la pantalla.
                </li>
                <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                Mantenga su código QR a la mano.
                </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsultaTurno;