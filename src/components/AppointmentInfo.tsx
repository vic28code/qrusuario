import { Clock, Building2 } from "lucide-react";

interface AppointmentInfoProps {
  estimatedTime: string;
  appointmentTime: string;
  location: string;
}

const AppointmentInfo = ({ estimatedTime, appointmentTime, location }: AppointmentInfoProps) => {
  return (
    <div className="space-y-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          <Clock className="w-12 h-12 text-foreground" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm md:text-base text-foreground mb-1">
            Su cita es en aproximadamente {estimatedTime} a las
          </p>
          <p className="text-3xl md:text-4xl font-bold text-alert">{appointmentTime}</p>
        </div>
      </div>

      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <Building2 className="w-12 h-12 text-foreground" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm md:text-base text-foreground">
            Acercarse a
          </p>
          <p className="text-base md:text-lg font-semibold text-foreground">
            {location}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppointmentInfo;
