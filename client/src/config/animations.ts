/**
 * animations.ts — Framer Motion variant library for Futrix AI
 * All reusable animation variants in one place.
 */

// ─── Page transitions ─────────────────────────────────────────────────────────
export const pageVariants = {
    initial:  { opacity: 0, y: 18 },
    animate:  { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
    exit:     { opacity: 0, y: -10, transition: { duration: 0.25 } },
};

// ─── Staggered list container ─────────────────────────────────────────────────
export const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.07,
            delayChildren:   0.1,
        },
    },
};

// ─── Individual item in a staggered list ──────────────────────────────────────
export const staggerItem = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.4, 0, 0.2, 1] } },
};

// ─── Fade in ──────────────────────────────────────────────────────────────────
export const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
    exit:    { opacity: 0, transition: { duration: 0.2 } },
};

// ─── Slide in from left ───────────────────────────────────────────────────────
export const slideInLeft = {
    initial: { opacity: 0, x: -24 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
};

// ─── Slide in from right ──────────────────────────────────────────────────────
export const slideInRight = {
    initial: { opacity: 0, x: 24 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
};

// ─── Card hover ───────────────────────────────────────────────────────────────
export const cardHover = {
    rest:  { scale: 1,    y: 0,  transition: { duration: 0.22, ease: 'easeOut' } },
    hover: { scale: 1.01, y: -3, transition: { duration: 0.22, ease: 'easeOut' } },
};

// ─── Score ring draw ──────────────────────────────────────────────────────────
export const ringDraw = (target: number) => ({
    initial: { pathLength: 0, opacity: 0 },
    animate: {
        pathLength: target / 100,
        opacity: 1,
        transition: { duration: 1.6, ease: [0.4, 0, 0.2, 1], delay: 0.2 },
    },
});

// ─── Pulse glow ───────────────────────────────────────────────────────────────
export const pulseGlow = {
    animate: {
        opacity: [0.4, 0.9, 0.4],
        scale:   [1,   1.04, 1],
        transition: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' },
    },
};

// ─── Float up/down ────────────────────────────────────────────────────────────
export const floatUpDown = {
    animate: {
        y: [0, -8, 0],
        transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
    },
};

// ─── Number counter (used with useMotionValue + useSpring) ───────────────────
export const counterSpring = { stiffness: 60, damping: 18 };
