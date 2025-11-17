import TurnDisplay from "@/components/TurnDisplay";
import StatusBanner from "@/components/StatusBanner";
import AppointmentInfo from "@/components/AppointmentInfo";
import RemindersCard from "@/components/RemindersCard";
import SocialFooter from "@/components/SocialFooter";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        {/* Logo placeholder */}
        <div className="bg-secondary rounded-lg h-16 flex items-center justify-center mb-8 shadow-sm">
          <span className="text-muted-foreground text-sm font-medium">LOGO</span>
        </div>

        {/* Turn Display */}
        <TurnDisplay turnNumber="A - 121" />

        {/* Status Banner */}
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

export default Index;
