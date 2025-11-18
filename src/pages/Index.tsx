import React, { useState, useEffect } from 'react'
import TurnDisplay from "@/components/TurnDisplay";
import StatusBanner from "@/components/StatusBanner";
import AppointmentInfo from "@/components/AppointmentInfo";
import RemindersCard from "@/components/RemindersCard";
import SocialFooter from "@/components/SocialFooter";

import { getActiveTurn, getRandomTurn } from '@/lib/supabaseQueries'

const Index = () => {
  const [numero, setNumero] = useState<string | null>(null)
  const [estado, setEstado] = useState<string | null>(null)
  const [tiempoEspera, setTiempoEspera] = useState<number | null>(null)
  const [fechaLlamado, setFechaLlamado] = useState<string | null>(null)
  const [location, setLocation] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        // *** MODIFICACIÓN AQUÍ ***
        // Siempre llama a getRandomTurn() y elimina la verificación de VITE_USE_RANDOM_TURN
        const data = await getRandomTurn() // ¡Llama directamente a la función aleatoria!

        if (!data) return
        if (mounted) {
          setNumero(data.numero)
          setEstado(data.estado)
          setTiempoEspera(data.tiempo_espera ?? null)
          setFechaLlamado(data.fecha_llamado ?? null)
          setLocation((data as any).categoria_nombre ?? null)
        }
      } catch (err) {
        console.error('Error cargando datos de turno', err)
      }
    }
    load()
    // El cleanup sigue siendo solo para evitar actualizaciones de estado no deseadas.
    return () => { mounted = false }
  }, []) // Las dependencias vacías aseguran que se ejecute en cada carga (F5)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        {/* Logo: intenta mostrar la imagen del usuario / sitio desde Supabase.
            El código real para consultar Supabase está comentado y hay un
            fallback (placeholder) mientras no exista el proyecto.
        */}
        <div className="mb-8">
          {/* Componente Logo: ver notas dentro del componente */}
          <Logo />
        </div>

        {/* Turn Display: ahora la obtención del turno se hace al cargar la página */}
        <TurnDisplay turnNumber={numero} />
        <StatusBanner estado={estado} tiempoEspera={tiempoEspera} />

        {/* Appointment Info */}
        <AppointmentInfo
          estimatedTime={tiempoEspera ? `${tiempoEspera} minutos` : '---'}
          appointmentTime={fechaLlamado ? new Date(fechaLlamado).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }) : '---'}
          location={location ?? '---'}
        />

        {/* Reminders */}
        <RemindersCard
          reminders={[
            "Favor acercarse a su cita con al menos 10 minutos de anticipación.",
            "Recuerde traer su documento de identidad en caso de haber sido solicitado.",
            "Si no puede asistir, cancele su turno con al menos 2 horas de anticipación.",
            "Mantenga su celular en silencio o vibrador mientras es atendido.",
            "Anote lo más importante de su cita para futuras referencias.",
          ]}
        />
      </main>

      {/* Social Footer */}
      <SocialFooter />
    </div>
  );
};

/**
 * Logo component
 * - Muestra la imagen pública del logo (si existe) o un placeholder.
 * - Contiene ejemplos comentados sobre cómo obtener la URL desde Supabase
 *   usando las funciones de `src/lib/supabaseQueries.ts`.
 *
 * Para activar la integración: descomentar las llamadas reales y asegurarse
 * de reactivar el cliente en `src/lib/supabase.ts`.
 */
const Logo = () => {
  // El logo se obtiene en este orden:
  // 1) URL guardada por el usuario en localStorage (`SITE_LOGO_URL`)
  // 2) variable de entorno `VITE_SITE_LOGO_URL`
  // 3) `/logo.png` en la carpeta public
  const saved = (typeof window !== 'undefined') ? localStorage.getItem('SITE_LOGO_URL') : null
  const envLogo = (import.meta.env.VITE_SITE_LOGO_URL as string | undefined)
  const defaultSrc = envLogo && envLogo.length ? envLogo : 'https://upload.wikimedia.org/wikipedia/commons/9/92/Espol_Logo_2023.png'

  const initialSrc = saved && saved.length ? saved : defaultSrc
  const [logoSrc, setLogoSrc] = useState<string>(initialSrc)
  const [showImage, setShowImage] = useState(true)
  const [editing, setEditing] = useState(false)
  const [inputValue, setInputValue] = useState<string>(saved ?? '')

  const save = () => {
    try {
      localStorage.setItem('SITE_LOGO_URL', inputValue)
      setLogoSrc(inputValue || defaultSrc)
      setShowImage(true)
      setEditing(false)
    } catch (err) {
      console.error('No se pudo guardar la URL del logo', err)
    }
  }

  const reset = () => {
    try {
      localStorage.removeItem('SITE_LOGO_URL')
    } catch (err) {
      /* ignore */
    }
    setInputValue('')
    setLogoSrc(defaultSrc)
    setShowImage(true)
    setEditing(false)
  }

  return (
    <div className="bg-secondary rounded-lg h-20 flex flex-col items-center justify-center shadow-sm p-2">
      <div className="flex items-center gap-4">
        {showImage ? (
          <img
            src={logoSrc}
            alt="Logo"
            className="h-12 w-auto rounded-full"
            onError={() => setShowImage(false)}
          />
        ) : (
          <span className="text-muted-foreground text-sm font-medium">LOGO</span>
        )}

        <button
          type="button"
          className="text-sm text-muted-foreground underline"
          onClick={() => setEditing(v => !v)}
        >
          {editing ? 'Cerrar' : 'Editar'}
        </button>
      </div>

      {editing && (
        <div className="mt-2 w-full flex gap-2">
          <input
            className="flex-1 rounded-md border px-2 py-1 text-sm"
            placeholder="Pega la URL del logo aquí"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button className="btn btn-primary px-3 py-1 text-sm" onClick={save}>Guardar</button>
          <button className="px-3 py-1 text-sm" onClick={reset}>Restablecer</button>
        </div>
      )}
    </div>
  )
}

export default Index;
