'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedBackgroundProps {
  children: ReactNode;
}

const AnimatedBackground = ({ children }: AnimatedBackgroundProps) => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Main gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-100 via-pink-50 to-sky-100 -z-20" />
      
      {/* Animated gradient orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="fixed top-20 right-20 w-[500px] h-[500px] bg-gradient-to-r from-purple-300/30 to-pink-300/30 rounded-full blur-3xl -z-10"
      />
      
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -100, 0],
          y: [0, 100, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="fixed bottom-20 left-20 w-[600px] h-[600px] bg-gradient-to-r from-blue-300/30 to-teal-300/30 rounded-full blur-3xl -z-10"
      />
      
      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          x: [0, 150, 0],
          y: [0, 150, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
        className="fixed top-1/2 left-1/3 w-[400px] h-[400px] bg-gradient-to-r from-indigo-300/30 to-violet-300/30 rounded-full blur-3xl -z-10"
      />

      {/* Glassmorphism grid pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] -z-10" />

      {/* Content */}
      <div className="relative">{children}</div>
    </div>
  );
};

export default AnimatedBackground; 