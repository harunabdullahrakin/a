import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Settings } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [eventStarted, setEventStarted] = useState(false);

  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });
  if (!isLoading && settings && !settings.countdownSettings.enabled) {
    return null;
  }

  useEffect(() => {
    if (!settings?.carnivalDate) return;

    const calculateTimeLeft = () => {
      const targetDate = new Date(settings.carnivalDate);
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setEventStarted(true);
        return;
      } else {
        setEventStarted(false);
      }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [settings?.carnivalDate]);

  if (isLoading) {
    return (
      <div className="w-full py-8 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-64 bg-gray-700 mb-4" />
          <div className="flex justify-center space-x-4 mb-6">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-24 bg-gray-700" />
            ))}
          </div>
          <Skeleton className="h-10 w-32 bg-gray-700 mx-auto" />
        </div>
      </div>
    );
  }
  if (!settings?.countdownSettings) {
    return null;
  }

  const {
    title,
    subtitle,
    buttonText,
    buttonLink,
    backgroundColor,
    textColor,
  } = settings.countdownSettings;

  return (
    <div 
      className="w-full py-8 text-center"
      style={{ 
        backgroundColor: backgroundColor || "#0f172a", 
        color: textColor || "#ffffff"
      }}
    >
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-2">{title}</h2>
        <p className="mb-6 opacity-90">{subtitle}</p>
        
        {eventStarted ? (
          <div className="text-center mb-8">
            <h3 className="text-4xl font-bold mb-4 animate-pulse">{title.replace("Countdown", "").trim()} is going on!</h3>
            {buttonText && buttonLink && (
              <Button 
                size="lg"
                onClick={() => window.open(buttonLink, "_blank")}
                className="transition-all"
              >
                {buttonText}
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <CountdownUnit value={String(timeLeft.days).padStart(2, "0")} label="Days" />
            <CountdownUnit value={String(timeLeft.hours).padStart(2, "0")} label="Hours" />
            <CountdownUnit value={String(timeLeft.minutes).padStart(2, "0")} label="Minutes" />
            <CountdownUnit value={String(timeLeft.seconds).padStart(2, "0")} label="Seconds" />
          </div>
        )}
        
        {!eventStarted && buttonText && buttonLink && (
          <Button 
            size="lg"
            onClick={() => window.open(buttonLink, "_blank")}
            className="animate-pulse hover:animate-none transition-all"
          >
            {buttonText}
          </Button>
        )}
      </div>
    </div>
  );
};

const CountdownUnit = ({ value, label }: { value: string; label: string }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="countdown-value bg-black/30 w-20 h-20 rounded-lg flex items-center justify-center text-3xl font-bold mb-2">
        {value}
      </div>
      <span className="text-sm uppercase">{label}</span>
    </div>
  );
};

export default CountdownTimer;