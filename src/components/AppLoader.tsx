import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone } from 'lucide-react';

export default function AppLoader({ isLoading }: { isLoading: boolean }) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #0B3D2E 0%, #1B4332 50%, #0B3D2E 100%)',
          }}
        >
          {/* Animated background orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-600/20 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ scale: [1.3, 1, 1.3], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.15, 0.4, 0.15] }}
              transition={{ duration: 6, repeat: Infinity, delay: 1 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"
            />
          </div>

          {/* Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: [0.175, 0.885, 0.32, 1.275] }}
            className="relative mb-8"
          >
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-glow-green"
              style={{
                background: 'linear-gradient(135deg, #1B4332, #10B981)',
              }}
            >
              <Smartphone className="w-12 h-12 text-white" strokeWidth={1.5} />
            </div>
            {/* Rotating ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-2 rounded-[2rem] border-2 border-dashed border-emerald-500/40"
            />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-center mb-10 z-10"
          >
            <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">
              ZAMZAM
            </h1>
            <p className="text-sm text-emerald-300/70 tracking-[0.3em] uppercase">
              Mobile Center
            </p>
          </motion.div>

          {/* Loading bar */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="w-48 h-1 bg-white/10 rounded-full overflow-hidden z-10"
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
              className="h-full w-1/2 rounded-full"
              style={{ background: 'linear-gradient(90deg, transparent, #10B981, #34D399, transparent)' }}
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ delay: 1, duration: 2, repeat: Infinity }}
            className="mt-4 text-xs text-white/30 z-10"
          >
            Loading your shop...
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
