import confetti from "canvas-confetti";

export function useConfetti() {
  const fireConfetti = (options?: confetti.Options) => {
    const defaults: confetti.Options = {
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#10b981", "#3b82f6", "#f59e0b", "#ec4899"],
    };

    confetti({
      ...defaults,
      ...options,
    });
  };

  const fireworksConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#10b981", "#14b8a6", "#06b6d4"],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#3b82f6", "#6366f1", "#8b5cf6"],
      });
    }, 250);
  };

  const explosionConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 180,
      origin: { y: 0.5 },
      colors: ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#14b8a6"],
      ticks: 200,
      gravity: 1,
      decay: 0.94,
      startVelocity: 30,
      shapes: ["circle", "square"],
      scalar: 1.2,
    });
  };

  return {
    fireConfetti,
    fireworksConfetti,
    explosionConfetti,
  };
}
