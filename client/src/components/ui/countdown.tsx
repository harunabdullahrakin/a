import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type CountdownProps = {
  targetDate: string | Date;
  className?: string;
};

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const CountdownTimer = ({ targetDate, className = "" }: CountdownProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        // If the target date is passed, set all values to 0
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const formatNumber = (num: number) => {
    return num.toString().padStart(2, "0");
  };

  return (
    <div className={`text-center ${className}`}>
      <h2 className="text-2xl font-bold text-white font-mono mb-2">Countdown to Carnival</h2>
      <div className="flex justify-center space-x-4 mt-4">
        <CountdownUnit value={formatNumber(timeLeft.days)} label="Days" />
        <CountdownUnit value={formatNumber(timeLeft.hours)} label="Hours" />
        <CountdownUnit value={formatNumber(timeLeft.minutes)} label="Minutes" />
        <CountdownUnit value={formatNumber(timeLeft.seconds)} label="Seconds" />
      </div>
      <p className="text-blue-100 mt-6 font-medium">
        Join us on {new Date(targetDate).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </p>
    </div>
  );
};

type CountdownUnitProps = {
  value: string;
  label: string;
};

const CountdownUnit = ({ value, label }: CountdownUnitProps) => {
  return (
    <div className="flex flex-col items-center">
      <motion.div 
        className="countdown-value bg-white/20 w-20 h-20 rounded-lg flex items-center justify-center"
        key={value}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <span className="text-4xl font-bold text-white">{value}</span>
      </motion.div>
      <span className="text-sm text-blue-100 mt-2">{label}</span>
    </div>
  );
};

export default CountdownTimer;
