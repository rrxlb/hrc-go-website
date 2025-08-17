import { gsap } from 'gsap';
import { AnimationConfig, CameraTransition } from '@/lib/types';

// GSAP configuration
gsap.config({
  force3D: true,
  nullTargetWarn: false
});

export const createTimeline = (config?: AnimationConfig) => {
  return gsap.timeline({
    duration: config?.duration || 1,
    ease: config?.ease || 'power2.out',
    delay: config?.delay || 0,
    repeat: config?.repeat || 0,
    yoyo: config?.yoyo || false
  });
};

export const animateCamera = (
  camera: any,
  transition: CameraTransition,
  onComplete?: () => void
) => {
  const tl = gsap.timeline({ onComplete });
  
  tl.to(camera.position, {
    x: transition.to.position[0],
    y: transition.to.position[1],
    z: transition.to.position[2],
    duration: transition.duration,
    ease: transition.ease
  });
  
  // If camera has a target (like OrbitControls) and transition has target
  if (camera.target && transition.to.target) {
    tl.to(camera.target, {
      x: transition.to.target[0],
      y: transition.to.target[1],
      z: transition.to.target[2],
      duration: transition.duration,
      ease: transition.ease
    }, 0);
  }
  
  if (transition.to.fov && camera.fov !== undefined) {
    tl.to(camera, {
      fov: transition.to.fov,
      duration: transition.duration,
      ease: transition.ease,
      onUpdate: () => camera.updateProjectionMatrix?.()
    }, 0);
  }
  
  return tl;
};

export const createHoverAnimation = (
  target: any,
  scale = 1.1,
  duration = 0.3,
  ease = 'power2.out'
) => {
  const originalScale = { x: target.scale.x, y: target.scale.y, z: target.scale.z };
  
  const hoverIn = () => {
    gsap.to(target.scale, {
      x: originalScale.x * scale,
      y: originalScale.y * scale,
      z: originalScale.z * scale,
      duration,
      ease
    });
  };
  
  const hoverOut = () => {
    gsap.to(target.scale, {
      x: originalScale.x,
      y: originalScale.y,
      z: originalScale.z,
      duration,
      ease
    });
  };
  
  return { hoverIn, hoverOut };
};

export const createLoadingAnimation = (
  target: any,
  type: 'spin' | 'bounce' | 'pulse' = 'spin'
) => {
  switch (type) {
    case 'spin':
      return gsap.to(target.rotation, {
        y: Math.PI * 2,
        duration: 2,
        ease: 'none',
        repeat: -1
      });
    
    case 'bounce':
      return gsap.to(target.position, {
        y: '+=0.5',
        duration: 1,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: -1
      });
    
    case 'pulse':
      return gsap.to(target.scale, {
        x: 1.2,
        y: 1.2,
        z: 1.2,
        duration: 1,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: -1
      });
    
    default:
      return gsap.to(target.rotation, {
        y: Math.PI * 2,
        duration: 2,
        ease: 'none',
        repeat: -1
      });
  }
};

export const killAllAnimations = (target?: any) => {
  if (target) {
    gsap.killTweensOf(target);
  } else {
    gsap.killTweensOf('*');
  }
};