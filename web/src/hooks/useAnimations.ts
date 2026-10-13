import { useMemo } from "react";
import type { Variants } from "framer-motion";

interface AnimationConfig {
  page: Variants;
  button: Variants;
  list: Variants;
  modal: Variants;
}

export function useAnimations(): AnimationConfig {
  return useMemo<AnimationConfig>(
    () => ({
      page: {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
      },
      button: {
        whileHover: { scale: 1.05 },
        whileTap: { scale: 0.95 },
      },
      list: {
        initial: { opacity: 0 },
        animate: {
          opacity: 1,
          transition: { staggerChildren: 0.05 },
        },
      },
      modal: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
      },
    }),
    [],
  );
}
