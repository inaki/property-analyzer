import { useEffect, useRef, useState } from "react";

type AnimatedNumberProps = {
  value: number;
  durationMs?: number;
  format?: (value: number) => string;
};

export function AnimatedNumber({
  value,
  durationMs = 450,
  format,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(value);

  useEffect(() => {
    const startValue = fromRef.current;
    const delta = value - startValue;
    if (!Number.isFinite(value) || !Number.isFinite(startValue) || delta === 0) {
      fromRef.current = value;
      setDisplayValue(value);
      return;
    }

    const step = (timestamp: number) => {
      if (startRef.current === null) {
        startRef.current = timestamp;
      }
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(startValue + delta * eased);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        fromRef.current = value;
        startRef.current = null;
      }
    };

    requestAnimationFrame(step);
    return () => {
      startRef.current = null;
    };
  }, [durationMs, value]);

  const shown = format ? format(displayValue) : Math.round(displayValue).toString();
  return <span>{shown}</span>;
}
