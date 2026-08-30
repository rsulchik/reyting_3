import { Star } from "lucide-react";

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  const rounded = Math.round(value);
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={
            i <= rounded
              ? "fill-brand text-brand"
              : "fill-transparent text-zinc-300"
          }
        />
      ))}
    </div>
  );
}

export function StarDots({ value }: { value: number }) {
  const rounded = Math.round(value);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={
            "size-1.5 rounded-full " + (i <= rounded ? "bg-brand" : "bg-zinc-200 dark:bg-zinc-700")
          }
        />
      ))}
    </div>
  );
}