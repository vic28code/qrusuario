interface RemindersCardProps {
  reminders: string[];
}

const RemindersCard = ({ reminders }: RemindersCardProps) => {
  return (
    <div className="bg-card text-card-foreground rounded-lg px-6 py-5 shadow-sm mb-6">
      <ul className="space-y-3">
        {reminders.map((reminder, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-foreground font-bold mt-0.5">•</span>
            <span className="text-sm md:text-base text-foreground">{reminder}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RemindersCard;
