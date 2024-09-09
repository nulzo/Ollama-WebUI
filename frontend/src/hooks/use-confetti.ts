import { useCallback, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  dx: number;
  dy: number;
  color: string;
}

const COLORS = [
  '#00008B', // DarkBlue
  '#1E3A8A', // Rabies Blue
  '#295BD6', // Dodger Blue
  '#3C73E9', // Medium Blue
  '#4682B4', // SteelBlue
  '#5B9BD5', // Powder Blue
  '#A9C7E1', // Pale Blue
  '#D6EFFF', // Light Cyan
  '#F0FFFF', // Azure
  '#FFFFFF', // White
];

const generateColors = () => {
  const idx = Math.floor(Math.random() * COLORS.length);
  return COLORS[idx];
};

const createParticleElements = (container: HTMLDivElement, particles: Particle[]) => {
  particles.forEach((particle: Particle) => {
    const particleElement = document.createElement('div');
    particleElement.className = 'confetti explode absolute overflow-hidden';
    // particleElement.style.backgroundColor = particle.color;
    particleElement.style.width = `${particle.size}px`;
    particleElement.style.height = `${particle.size}px`;
    particleElement.style.opacity = `${particle.opacity}`;
    particleElement.style.position = 'absolute';
    particleElement.style.left = `${particle.x}px`;
    particleElement.style.top = `${particle.y}px`;
    particleElement.style.background = `${particle.color}`;

    container.appendChild(particleElement);

    const animation = particleElement.animate(
      [
        {
          opacity: 1,
          transformOrigin: '50% 50%',
          filter: 'blur(0px)',
        },
        {
          transform: `translate(${particle.dy * Math.random() * 0.95}px, ${particle.dx * Math.random() * 0.95}px)`,
          transformOrigin: '50% 50%',
          filter: 'blur(0.5px)',
          opacity: 0,
        },
      ],
      {
        duration: 1000,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
      }
    );

    // Remove particle element after animation
    animation.onfinish = () => {
      container.removeChild(particleElement);
    };
  });
};

export const useConfetti = () => {
  const [isActive, setIsActive] = useState(false);
  const ref = useRef<HTMLCanvasElement | null>(null);

  const createParticles = useCallback(
    (centerX: number, centerY: number, offsetLeft: number, offsetTop: number) => {
      const particles = [];
      for (let i = 0; i < 100; i++) {
        const angle = Math.random() * (2 * Math.PI);
        const r = Math.random() * 50; // Adjust range for broader spread
        const dx = Math.cos(angle) * r;
        const dy = Math.sin(angle) * r;
        const size = Math.random() * 0.95 + 2;
        const color = generateColors();
        particles.push({
          x: centerX + offsetLeft,
          y: centerY + offsetTop,
          size,
          dx,
          dy,
          opacity: 1,
          color,
        });
      }
      return particles;
    },
    []
  );

  const showConfetti = useCallback(
    (centerX: number, centerY: number, offsetX: number, offsetY: number) => {
      const confettiContainer = ref.current;
      if (!confettiContainer) return;
      const particles = createParticles(centerX, centerY, offsetX, offsetY);
      createParticleElements(confettiContainer, particles);
      setIsActive(true);
      setTimeout(() => {
        setIsActive(false);
      }, 1500); // Match the animation duration for cleanup
    },
    [createParticles]
  );

  return { showConfetti, isActive, ref };
};
