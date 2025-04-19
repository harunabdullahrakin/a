import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Atom, Beaker, TestTube, Microscope, ZoomIn } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";

// Scientific SVG component
const MoleculeAnimation = () => (
  <svg 
    width="120" 
    height="120" 
    viewBox="0 0 120 120" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="animate-spin-slow" // Custom animation class
  >
    <circle cx="60" cy="60" r="40" stroke="#6366F1" strokeWidth="2" fill="none" />
    <circle cx="60" cy="60" r="2" fill="#6366F1" className="animate-pulse" />
    <circle cx="30" cy="60" r="4" fill="#F43F5E" className="animate-bounce" />
    <circle cx="90" cy="60" r="4" fill="#0EA5E9" className="animate-pulse" />
    <circle cx="60" cy="30" r="4" fill="#10B981" className="animate-bounce" />
    <circle cx="60" cy="90" r="4" fill="#FB7185" className="animate-pulse" />
    <line x1="60" y1="60" x2="30" y2="60" stroke="#6366F1" strokeWidth="1.5" />
    <line x1="60" y1="60" x2="90" y2="60" stroke="#6366F1" strokeWidth="1.5" />
    <line x1="60" y1="60" x2="60" y2="30" stroke="#6366F1" strokeWidth="1.5" />
    <line x1="60" y1="60" x2="60" y2="90" stroke="#6366F1" strokeWidth="1.5" />
  </svg>
);

// Error equation animation
const ErrorEquation = () => {
  const [highlight, setHighlight] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setHighlight(prev => (prev + 1) % 3);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex items-center justify-center font-mono text-xl mt-4 mb-6 text-gray-800 overflow-x-auto p-2">
      <span className={highlight === 0 ? "text-primary font-bold" : ""}>URL</span>
      <span className="mx-2">+</span>
      <span className={highlight === 1 ? "text-primary font-bold" : ""}>Browser</span>
      <span className="mx-2">→</span>
      <span className={highlight === 2 ? "text-red-500 font-bold" : ""}>404</span>
    </div>
  );
};

// Random floating scientific icons
const FloatingIcons = () => {
  const icons = [
    { Icon: Atom, color: "text-blue-500", size: "h-8 w-8", animation: "animate-float", delay: "0s" },
    { Icon: Beaker, color: "text-green-500", size: "h-6 w-6", animation: "animate-float", delay: "0.5s" },
    { Icon: TestTube, color: "text-purple-500", size: "h-7 w-7", animation: "animate-float", delay: "1s" },
    { Icon: Microscope, color: "text-red-400", size: "h-9 w-9", animation: "animate-float", delay: "1.5s" },
    { Icon: ZoomIn, color: "text-yellow-500", size: "h-6 w-6", animation: "animate-float", delay: "2s" },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {icons.map((item, index) => {
        const { Icon, color, size, animation, delay } = item;
        const randomX = Math.floor(Math.random() * 80) + 10; // 10-90%
        const randomY = Math.floor(Math.random() * 80) + 10; // 10-90%
        
        return (
          <div 
            key={index}
            className={`absolute ${color} ${size} ${animation}`} 
            style={{ 
              left: `${randomX}%`, 
              top: `${randomY}%`,
              animationDelay: delay,
              opacity: 0.5
            }}
          >
            <Icon />
          </div>
        );
      })}
    </div>
  );
};

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 relative overflow-hidden">
      <FloatingIcons />
      <Card className="w-full max-w-md mx-4 relative z-10 backdrop-blur-sm bg-white/90 border-2 border-indigo-200">
        <CardContent className="pt-6 flex flex-col items-center">
          <MoleculeAnimation />
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mt-4">
              <span className="text-blue-500 animate-pulse inline-block">4</span>
              <span className="text-red-500 animate-ping inline-block">0</span>
              <span className="text-blue-500 animate-pulse inline-block">4</span>
            </h1>
            <h2 className="text-xl font-medium text-gray-700 mt-2">Scientific Anomaly Detected</h2>
            
            <ErrorEquation />

            <p className="mt-2 text-gray-600">
              Our scientific instruments couldn't detect the page you're looking for. It may have been moved to another dimension or never existed in our universe.
            </p>
          </div>
          
          <Link href="/">
            <Button className="mt-6 animate-pulse" size="lg">
              Return to Laboratory
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
