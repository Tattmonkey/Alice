import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  className?: string;
  size?: number;
  isAnimating?: boolean;
}

export default function Logo({ className = '', size = 40, isAnimating = false }: Props) {
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 2,
        ease: "easeInOut",
        repeat: isAnimating ? Infinity : 0,
        repeatType: "reverse" as const,
      }
    }
  };

  const rotateVariants = {
    animate: {
      rotate: isAnimating ? 360 : 0,
      transition: {
        duration: 4,
        ease: "linear",
        repeat: Infinity
      }
    }
  };

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 500 500"
      className={className}
      animate="animate"
      variants={rotateVariants}
    >
      <motion.path
        d="M100 100 L400 100 L400 400 L100 400 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="40"
        initial="hidden"
        animate="visible"
        variants={pathVariants}
      />
      <motion.path
        d="M150 150 L350 150 M150 250 L350 250 M150 350 L350 350"
        fill="none"
        stroke="currentColor"
        strokeWidth="40"
        initial="hidden"
        animate="visible"
        variants={pathVariants}
      />
      <motion.path
        d="M250 150 L250 350"
        fill="none"
        stroke="currentColor"
        strokeWidth="40"
        initial="hidden"
        animate="visible"
        variants={pathVariants}
      />
    </motion.svg>
  );
}