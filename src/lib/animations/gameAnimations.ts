import { gsap } from 'gsap';
import * as THREE from 'three';

// Enhanced animation configurations for each game
export const ANIMATION_CONFIGS = {
  blackjack: {
    cardDeal: {
      duration: 0.5,
      stagger: 0.3,
      ease: 'power2.out',
      cardFlipDelay: 0.3
    }
  },
  roulette: {
    wheelSpin: {
      duration: 4,
      rotations: 8,
      ease: 'power2.out',
      ballDuration: 3.5,
      ballEase: 'power3.out'
    }
  },
  slots: {
    reelSpin: {
      baseDuration: 2,
      staggerDelay: 0.5,
      rotations: 10,
      ease: 'power3.out'
    }
  },
  craps: {
    diceRoll: {
      duration: 1.5,
      bounceCount: 2,
      ease: 'power2.out',
      rotationMultiplier: 4
    }
  }
};

// Card dealing animation with realistic physics
export function createCardDealAnimation(
  cards: THREE.Mesh[],
  dealerPosition: THREE.Vector3,
  targetPositions: THREE.Vector3[],
  onComplete?: () => void
) {
  const tl = gsap.timeline({ onComplete });
  const config = ANIMATION_CONFIGS.blackjack.cardDeal;

  cards.forEach((card, index) => {
    // Set initial position at dealer
    card.position.copy(dealerPosition);
    card.rotation.set(0, 0, 0);
    
    const targetPos = targetPositions[index];
    const isPlayerCard = index % 2 === 0;
    
    // Card trajectory animation
    tl.to(card.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: config.duration,
      ease: config.ease,
      onUpdate: function() {
        // Add slight arc to the card movement
        const progress = this.progress();
        const arcHeight = 0.3 * Math.sin(progress * Math.PI);
        card.position.y = targetPos.y + arcHeight;
      }
    }, index * config.stagger);
    
    // Card rotation for natural landing
    tl.to(card.rotation, {
      z: (Math.random() - 0.5) * 0.2,
      duration: config.duration * 0.5,
      ease: 'power1.out'
    }, index * config.stagger + config.cardFlipDelay);
  });

  return tl;
}

// Roulette wheel animation with realistic physics
export function createRouletteAnimation(
  wheel: THREE.Group,
  ball: THREE.Mesh,
  onComplete?: () => void
) {
  const tl = gsap.timeline({ onComplete });
  const config = ANIMATION_CONFIGS.roulette.wheelSpin;
  
  // Wheel spinning
  tl.to(wheel.rotation, {
    y: Math.PI * 2 * config.rotations,
    duration: config.duration,
    ease: config.ease
  });
  
  // Ball physics simulation
  const ballRadius = 0.55;
  let ballAngle = 0;
  let ballSpeed = 0.3;
  
  const ballAnimation = gsap.to({}, {
    duration: config.ballDuration,
    ease: config.ballEase,
    onUpdate: function() {
      const progress = this.progress();
      
      // Decrease speed over time
      ballSpeed = 0.3 * (1 - progress * 0.8);
      ballAngle += ballSpeed;
      
      // Spiral inward as ball loses momentum
      const currentRadius = ballRadius * (1 - progress * 0.15);
      
      // Update ball position
      ball.position.x = Math.cos(ballAngle) * currentRadius;
      ball.position.z = Math.sin(ballAngle) * currentRadius;
      
      // Add vertical bounce effect
      ball.position.y = 0.15 + Math.sin(progress * Math.PI * 3) * 0.02 * (1 - progress);
    }
  });
  
  tl.add(ballAnimation, 0);
  
  // Final ball settlement
  const finalAngle = Math.random() * Math.PI * 2;
  tl.to(ball.position, {
    x: Math.cos(finalAngle) * 0.45,
    z: Math.sin(finalAngle) * 0.45,
    y: 0.12,
    duration: 0.5,
    ease: 'bounce.out'
  });
  
  return tl;
}

// Slot machine reel animation with realistic timing
export function createSlotReelAnimation(
  reels: THREE.Group[],
  onComplete?: () => void
) {
  const tl = gsap.timeline({ onComplete });
  const config = ANIMATION_CONFIGS.slots.reelSpin;
  
  reels.forEach((reel, index) => {
    const spinDuration = config.baseDuration + index * config.staggerDelay;
    const rotations = config.rotations + index * 2;
    
    tl.to(reel.rotation, {
      y: Math.PI * 2 * rotations,
      duration: spinDuration,
      ease: config.ease
    }, index * 0.2);
  });
  
  return tl;
}

// Dice rolling animation with realistic physics
export function createDiceRollAnimation(
  dice: THREE.Mesh[],
  startPositions: THREE.Vector3[],
  endPositions: THREE.Vector3[],
  onComplete?: () => void
) {
  const tl = gsap.timeline({ onComplete });
  const config = ANIMATION_CONFIGS.craps.diceRoll;
  
  dice.forEach((die, index) => {
    // Set starting position
    die.position.copy(startPositions[index]);
    
    const endPos = endPositions[index];
    
    // Trajectory animation with arc
    tl.to(die.position, {
      x: endPos.x,
      y: endPos.y,
      z: endPos.z,
      duration: config.duration,
      ease: config.ease,
      onUpdate: function() {
        // Add parabolic arc
        const progress = this.progress();
        const arcHeight = 0.4 * Math.sin(progress * Math.PI);
        die.position.y = endPos.y + arcHeight;
      }
    }, index * 0.1);
    
    // Rotation animation for tumbling effect
    tl.to(die.rotation, {
      x: Math.PI * config.rotationMultiplier + Math.random() * Math.PI,
      y: Math.PI * (config.rotationMultiplier - 1) + Math.random() * Math.PI,
      z: Math.PI * config.rotationMultiplier + Math.random() * Math.PI,
      duration: config.duration,
      ease: config.ease
    }, index * 0.1);
    
    // Bounce effect when landing
    tl.to(die.position, {
      y: endPos.y + 0.1,
      duration: 0.15,
      ease: 'power2.out',
      yoyo: true,
      repeat: config.bounceCount
    }, config.duration - 0.3);
  });
  
  return tl;
}

// Utility function to create particle effects for enhanced visuals
export function createParticleEffect(
  position: THREE.Vector3,
  count: number = 20,
  color: string = '#ffd700'
) {
  const particles: THREE.Mesh[] = [];
  
  for (let i = 0; i < count; i++) {
    const particle = new THREE.Mesh(
      new THREE.SphereGeometry(0.01, 4, 4),
      new THREE.MeshBasicMaterial({ 
        color,
        transparent: true,
        opacity: 0.8
      })
    );
    
    particle.position.copy(position);
    particles.push(particle);
    
    // Animate particles
    const angle = (i / count) * Math.PI * 2;
    const distance = 0.5 + Math.random() * 0.5;
    
    gsap.to(particle.position, {
      x: position.x + Math.cos(angle) * distance,
      y: position.y + Math.random() * 0.5,
      z: position.z + Math.sin(angle) * distance,
      duration: 1 + Math.random(),
      ease: 'power2.out'
    });
    
    gsap.to(particle.material, {
      opacity: 0,
      duration: 1 + Math.random(),
      ease: 'power2.out',
      onComplete: () => {
        particle.geometry.dispose();
        (particle.material as THREE.Material).dispose();
      }
    });
  }
  
  return particles;
}

// Sound effect triggers (placeholder for future audio integration)
export const SOUND_EFFECTS = {
  cardDeal: 'card_deal.mp3',
  rouletteSpin: 'roulette_spin.mp3',
  slotSpin: 'slot_spin.mp3',
  diceRoll: 'dice_roll.mp3',
  chipPlace: 'chip_place.mp3',
  win: 'win.mp3'
};

export function triggerSoundEffect(effect: keyof typeof SOUND_EFFECTS) {
  // Placeholder for future audio implementation
  console.log(`Playing sound effect: ${SOUND_EFFECTS[effect]}`);
}