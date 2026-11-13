import { useState } from "react";
import { photoFocus, photoFor } from "../../lib/photos";
import { initials } from "../../lib/format";

type Size = "sm" | "md" | "lg";

interface Props {
  playerId: number;
  name: string;
  className?: string;
  /** Visual size of the placeholder initials. */
  size?: Size;
  eager?: boolean;
  alt?: string;
}

/** A player's photo, matched strictly by verified ID, or a designed placeholder when none exists. */
export function PlayerPhoto({ playerId, name, className = "", size = "md", eager = false, alt }: Props) {
  const src = photoFor(playerId);
  const [failed, setFailed] = useState(false);

  if (!src || failed) return <PhotoPlaceholder name={name} className={className} size={size} />;
  return (
    <img
      src={src}
      alt={alt ?? `Photo of ${name}`}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
      className={`h-full w-full bg-white object-cover ${className}`}
      style={{ objectPosition: photoFocus(playerId) }}
    />
  );
}

const INITIAL_SIZE: Record<Size, string> = { sm: "text-base", md: "text-6xl", lg: "text-7xl sm:text-8xl" };

export function PhotoPlaceholder({ name, className = "", size = "md" }: { name: string; className?: string; size?: Size }) {
  return (
    <div
      role="img"
      aria-label={`${name}: photo to be added`}
      className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-navy-soft ${className}`}
    >
      <svg aria-hidden viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <circle cx="200" cy="250" r="150" fill="#E84B91" opacity="0.16" />
        <path d="M118 104 C 172 150 202 205 207 262" fill="none" stroke="#E84B91" strokeOpacity="0.4" strokeWidth="2" />
        <path d="M106 116 C 160 162 188 215 192 264" fill="none" stroke="#D7B66D" strokeOpacity="0.5" strokeWidth="5" strokeDasharray="1.5 6" />
      </svg>
      <span className={`display relative text-gold ${INITIAL_SIZE[size]}`}>{initials(name)}</span>
      {size !== "sm" && (
        <span className="absolute left-0 right-0 top-[7%] text-center text-[11px] font-semibold text-white/60">Photo to be added</span>
      )}
    </div>
  );
}
