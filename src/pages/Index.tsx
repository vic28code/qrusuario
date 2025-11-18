import React, { useEffect, useState } from 'react'
import TurnDisplay from "@/components/TurnDisplay";
import StatusBanner from "@/components/StatusBanner";
import AppointmentInfo from "@/components/AppointmentInfo";
import RemindersCard from "@/components/RemindersCard";
import SocialFooter from "@/components/SocialFooter";

const Index = () => {
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

        {/* Turn Display: ahora la obtención del turno está en `src/lib/supabaseQueries.ts` */}
        <TurnDisplay />
        <StatusBanner 
          message="Aún se encuentra en lista de espera, no ha sido llamado pero su turno está próximo."
        />

        {/* Appointment Info */}
        <AppointmentInfo 
          estimatedTime="20 minutos"
          appointmentTime="10:01 AM"
          location="{Área designada}"
        />

        {/* Reminders */}
        <RemindersCard 
          reminders={[
            "Favor acercarse a su cita con al menos 10 minutos de anticipación.",
            "Recuerde en caso de haber sido solicitado.",
            "{Otro recordatorio}",
            "{Otro recordatorio}",
            "{Otro recordatorio}"
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
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      // Intentamos obtener el logo del sitio (si está configurado en settings)
      // y caemos al placeholder si no hay nada.
      try {
        const { getSiteLogoUrl } = await import('@/lib/supabaseQueries')
        const url = await getSiteLogoUrl()
        if (mounted) setLogoUrl(url)
      } catch (err) {
        // Si la importación o la consulta fallan, mantenemos el placeholder
        console.warn('No se pudo cargar el logo desde Supabase, usando placeholder', err)
        if (mounted) setLogoUrl(null)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="bg-secondary rounded-lg h-16 flex items-center justify-center shadow-sm">
      {logoUrl ? (
        <img src={logoUrl} alt="Logo" className="h-12 w-auto rounded-full" />
      ) : (
        <span className="text-muted-foreground text-sm font-medium">LOGO</span>
      )}
    </div>
  )
}

export default Index;
