"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  end: number;
  suffix?: string;
  duration?: number;
  className?: string;
}

export default function CountUp({
  end,
  suffix = "",
  duration = 2000,
  className,
}: CountUpProps) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;

    const steps = 60;
    const increment = end / steps;
    const stepDuration = duration / steps;
    let current = 0;
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      current = Math.round(eased * end);

      if (frame >= steps) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [started, end, duration]);

  return (
    <span ref={ref} className={className}>
      {started ? count : 0}
      {suffix}
    </span>
  );
}
