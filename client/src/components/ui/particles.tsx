import { useEffect, useRef } from "react";

type ParticleProps = {
  count?: number;
  className?: string;
};

const Particles = ({ count = 20, className = "" }: ParticleProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    
    // Clear any existing particles
    container.innerHTML = "";
    
    // Create particles
    for (let i = 0; i < count; i++) {
      const size = Math.random() * 60 + 20; // 20-80px
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.background = `rgba(255, 255, 255, ${Math.random() * 0.1 + 0.05})`;
      
      // Random starting position
      const startX = Math.random() * 100;
      const startY = Math.random() * 100;
      particle.style.left = `${startX}%`;
      particle.style.top = `${startY}%`;
      
      // Random animation transformation
      const translateX = (Math.random() - 0.5) * 200; // -100px to 100px
      const translateY = (Math.random() - 0.5) * 200; // -100px to 100px
      particle.style.setProperty("--tx", `${translateX}px`);
      particle.style.setProperty("--ty", `${translateY}px`);
      
      // Random animation duration
      particle.style.animationDuration = `${Math.random() * 20 + 10}s`; // 10-30s
      
      container.appendChild(particle);
    }
  }, [count]);

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 ${className}`}
      aria-hidden="true"
    />
  );
};

export default Particles;
