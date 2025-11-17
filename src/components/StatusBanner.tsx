interface StatusBannerProps {
  message: string;
}

const StatusBanner = ({ message }: StatusBannerProps) => {
  return (
    <div className="bg-warning text-warning-foreground px-6 py-4 rounded-lg mb-6 shadow-sm">
      <p className="text-sm md:text-base leading-relaxed">{message}</p>
    </div>
  );
};

export default StatusBanner;
