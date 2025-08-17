import { MotionVariants, TransitionConfig } from '@/lib/types';

export const fadeInUp: MotionVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.5, ease: 'easeOut' }
};

export const fadeInDown: MotionVariants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.5, ease: 'easeOut' }
};

export const slideInLeft: MotionVariants = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 },
  transition: { duration: 0.4, ease: 'easeOut' }
};

export const slideInRight: MotionVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
  transition: { duration: 0.4, ease: 'easeOut' }
};

export const scaleIn: MotionVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

export const rotateIn: MotionVariants = {
  initial: { opacity: 0, rotate: -10 },
  animate: { opacity: 1, rotate: 0 },
  exit: { opacity: 0, rotate: 10 },
  transition: { duration: 0.5, ease: 'easeOut' }
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const staggerItem: MotionVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeOut' }
};

export const createTransition = (config: TransitionConfig) => {
  const baseTransition = {
    duration: config.duration,
    ease: config.ease
  };

  switch (config.type) {
    case 'fade':
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: baseTransition
      };

    case 'slide':
      const slideDirection = config.direction || 'up';
      const slideDistance = 50;
      
      let slideInitial: any = { opacity: 0 };
      let slideExit: any = { opacity: 0 };
      
      switch (slideDirection) {
        case 'up':
          slideInitial.y = slideDistance;
          slideExit.y = -slideDistance;
          break;
        case 'down':
          slideInitial.y = -slideDistance;
          slideExit.y = slideDistance;
          break;
        case 'left':
          slideInitial.x = slideDistance;
          slideExit.x = -slideDistance;
          break;
        case 'right':
          slideInitial.x = -slideDistance;
          slideExit.x = slideDistance;
          break;
      }
      
      return {
        initial: slideInitial,
        animate: { opacity: 1, x: 0, y: 0 },
        exit: slideExit,
        transition: baseTransition
      };

    case 'scale':
      return {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.8 },
        transition: baseTransition
      };

    case 'rotate':
      return {
        initial: { opacity: 0, rotate: -10 },
        animate: { opacity: 1, rotate: 0 },
        exit: { opacity: 0, rotate: 10 },
        transition: baseTransition
      };

    default:
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: baseTransition
      };
  }
};

export const hoverScale = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { duration: 0.2, ease: 'easeOut' }
};

export const buttonHover = {
  whileHover: { 
    scale: 1.05,
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
  },
  whileTap: { scale: 0.95 },
  transition: { duration: 0.2, ease: 'easeOut' }
};