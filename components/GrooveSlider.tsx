type Props = {
  value: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
  step?: number | "any";
  className?: string;
};

export default function GrooveSlider({
  value,
  max,
  onChange,
  label,
  step = "any",
  className = "",
}: Props) {
  const percent = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  return (
    <input
      type="range"
      aria-label={label}
      min={0}
      max={max}
      step={step}
      value={Math.min(value, max)}
      disabled={!max}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ "--progress": `${percent}%` } as React.CSSProperties}
      className={`groove ${className}`}
    />
  );
}
