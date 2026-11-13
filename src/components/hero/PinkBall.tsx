import { motion, useReducedMotion } from "motion/react";

/** The pink ball of day-night cricket, drawn with its stitched seam: the hero's signature element. */
export function PinkBall({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  const draw = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: 1, opacity: 1 },
          transition: { duration: 1.4, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 600 600"
      className={className}
      initial={reduce ? false : { opacity: 0, scale: 0.94, rotate: -8 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <defs>
        <radialGradient id="ball-shade" cx="34%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#F37DB0" />
          <stop offset="45%" stopColor="#E84B91" />
          <stop offset="100%" stopColor="#8F2156" />
        </radialGradient>
        <clipPath id="ball-clip">
          <circle cx="300" cy="300" r="290" />
        </clipPath>
      </defs>
      <circle cx="300" cy="300" r="290" fill="url(#ball-shade)" />
      <g clipPath="url(#ball-clip)" fill="none">
        <motion.path d="M262 4 C 420 150 420 450 262 596" stroke="#7D1A4A" strokeWidth="4" {...draw(0.3)} />
        <motion.path d="M292 4 C 450 150 450 450 292 596" stroke="#7D1A4A" strokeWidth="4" {...draw(0.4)} />
        <motion.path d="M248 4 C 406 150 406 450 248 596" stroke="#FFF4F8" strokeOpacity="0.8" strokeWidth="9" strokeDasharray="2.5 10" {...draw(0.5)} />
        <motion.path d="M306 4 C 464 150 464 450 306 596" stroke="#FFF4F8" strokeOpacity="0.8" strokeWidth="9" strokeDasharray="2.5 10" {...draw(0.6)} />
      </g>
      <ellipse cx="200" cy="160" rx="120" ry="70" fill="#fff" opacity="0.12" transform="rotate(-30 200 160)" />
    </motion.svg>
  );
}
