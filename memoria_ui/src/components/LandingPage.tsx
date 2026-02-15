import { motion } from 'framer-motion';

function Sparkle({
  size,
  className,
  style,
}: {
  size: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={style}
      animate={{ rotate: [0, 15, -10, 0], scale: [1, 1.1, 0.95, 1] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    >
      <path
        d="M12 0C12 0 14 8 12 12C12 12 8 12 0 12C0 12 8 12 12 12C12 12 12 16 12 24C12 24 12 16 12 12C12 12 16 12 24 12C24 12 16 12 12 12C12 12 12 8 12 0Z"
        fill="currentColor"
      />
    </motion.svg>
  );
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const smoothEase = [0.2, 0, 0, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: smoothEase },
  },
};

const fadeLine = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 1, ease: smoothEase },
  },
};

export default function LandingPage({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="h-screen w-full overflow-hidden relative bg-landing-bg flex items-center justify-center">
      {/* Radial gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(42,33,24,0.8) 0%, transparent 100%)',
        }}
      />

      {/* Subtle grain texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Curved arc decoration - left side */}
      <motion.svg
        className="absolute pointer-events-none"
        style={{ top: '10%', left: '8%' }}
        width="200"
        height="300"
        viewBox="0 0 200 300"
        fill="none"
        initial={{ opacity: 0, pathLength: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 2, delay: 1 }}
      >
        <motion.path
          d="M 180 10 Q 20 80 60 280"
          stroke="var(--color-landing-muted)"
          strokeWidth="0.8"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, delay: 1, ease: 'easeInOut' }}
        />
      </motion.svg>

      {/* Circular decoration - right side */}
      <motion.svg
        className="absolute pointer-events-none"
        style={{ bottom: '8%', right: '5%' }}
        width="180"
        height="180"
        viewBox="0 0 180 180"
        fill="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ duration: 2, delay: 1.5 }}
      >
        <circle
          cx="90"
          cy="90"
          r="80"
          stroke="var(--color-landing-muted)"
          strokeWidth="0.6"
        />
        <circle
          cx="90"
          cy="90"
          r="60"
          stroke="var(--color-landing-muted)"
          strokeWidth="0.4"
          strokeDasharray="4 6"
        />
      </motion.svg>

      {/* Sparkle decorations */}
      <Sparkle
        size={28}
        className="absolute text-landing-accent"
        style={{ top: '18%', right: '22%' }}
      />
      <Sparkle
        size={14}
        className="absolute text-landing-accent/60"
        style={{ top: '25%', right: '18%' }}
      />
      <Sparkle
        size={10}
        className="absolute text-landing-muted/40"
        style={{ bottom: '30%', left: '15%' }}
      />

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-[2px] h-[2px] rounded-full bg-landing-muted/30"
          style={{
            top: `${15 + i * 14}%`,
            left: `${10 + i * 15}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            delay: i * 0.5,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Main content */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-3xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Small label */}
        <motion.p
          className="text-xs font-sans tracking-[0.3em] uppercase text-landing-muted/70 mb-6"
          variants={fadeUp}
        >
          AI-Powered Memory
        </motion.p>

        {/* Hero heading */}
        <motion.h1
          className="text-7xl sm:text-8xl md:text-9xl font-normal text-landing-text leading-[0.9] tracking-tight"
          variants={fadeUp}
        >
          Neural Map
        </motion.h1>

        {/* Decorative underline */}
        <motion.div
          className="w-80 sm:w-96 h-[2px] mt-3 origin-left"
          style={{
            background:
              'linear-gradient(90deg, transparent, var(--color-landing-accent), var(--color-sienna), transparent)',
          }}
          variants={fadeLine}
        />

        {/* Quote + description */}
        <motion.div className="mt-8 flex items-start gap-2" variants={fadeUp}>
          <span className="text-landing-accent/50 text-3xl font-serif leading-none -mt-1">
            ❝
          </span>
          <p className="text-lg sm:text-xl font-sans font-light italic text-landing-muted leading-relaxed max-w-lg">
            Your AI-powered second brain — remembering, connecting, and
            surfacing your thoughts exactly when you need them.
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.button
          className="mt-12 px-10 py-4 border border-landing-text/80 text-landing-text font-sans text-sm tracking-[0.15em] uppercase cursor-pointer bg-transparent transition-all duration-500 hover:bg-landing-text/10 hover:border-landing-text hover:tracking-[0.2em]"
          variants={fadeUp}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onEnter}
        >
          Enter the Map
        </motion.button>
      </motion.div>
    </div>
  );
}
