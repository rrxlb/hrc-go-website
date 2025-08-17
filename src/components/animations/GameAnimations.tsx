'use client';

import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh, BoxGeometry, MeshStandardMaterial } from 'three';
import * as THREE from 'three';
import { gsap } from 'gsap';

interface GameAnimationProps {
  isActive?: boolean;
  onComplete?: () => void;
}

// Blackjack Card Dealing Animation
export function BlackjackCardDealing({ isActive = false, onComplete }: GameAnimationProps) {
  const cardsRef = useRef<Group>(null);
  const [cards, setCards] = useState<Mesh[]>([]);

  useEffect(() => {
    if (isActive && cardsRef.current) {
      // Clear previous cards
      cardsRef.current.clear();
      
      // Create card dealing animation
      const dealCards = () => {
        const tl = gsap.timeline({ onComplete });
        
        // Deal 4 cards (2 to player, 2 to dealer)
        for (let i = 0; i < 4; i++) {
          const isPlayerCard = i % 2 === 0;
          const cardIndex = Math.floor(i / 2);
          
          // Create card mesh
          const cardGeometry = new THREE.BoxGeometry(0.06, 0.001, 0.09);
          const cardMaterial = new THREE.MeshStandardMaterial({ 
            color: '#ffffff',
            roughness: 0.1,
            metalness: 0.1
          });
          const card = new THREE.Mesh(cardGeometry, cardMaterial);
          
          // Starting position (deck)
          card.position.set(-1.5, 0.2, -0.8);
          card.rotation.set(0, 0, 0);
          
          // Target position
          const targetX = isPlayerCard ? -0.3 + cardIndex * 0.15 : 0.3 + cardIndex * 0.15;
          const targetZ = isPlayerCard ? 0.8 : -0.8;
          
          cardsRef.current?.add(card);
          
          // Animate card dealing
          tl.to(card.position, {
            x: targetX,
            y: 0.07,
            z: targetZ,
            duration: 0.5,
            ease: 'power2.out'
          }, i * 0.3)
          .to(card.rotation, {
            z: (Math.random() - 0.5) * 0.1, // Slight random rotation
            duration: 0.2,
            ease: 'power1.out'
          }, i * 0.3 + 0.3);
        }
      };
      
      dealCards();
    }
  }, [isActive, onComplete]);

  return (
    <group ref={cardsRef} />
  );
}

// Roulette Wheel Spinning Animation
export function RouletteWheelSpin({ isActive = false, onComplete }: GameAnimationProps) {
  const wheelRef = useRef<Group>(null);
  const ballRef = useRef<Mesh>(null);

  useEffect(() => {
    if (isActive && wheelRef.current && ballRef.current) {
      const tl = gsap.timeline({ onComplete });
      
      // Spin the wheel
      tl.to(wheelRef.current.rotation, {
        y: Math.PI * 8, // 4 full rotations
        duration: 4,
        ease: 'power2.out'
      });
      
      // Ball spinning animation
      const ballRadius = 0.55;
      let ballAngle = 0;
      
      const ballSpin = gsap.to({}, {
        duration: 3.5,
        ease: 'power3.out',
        onUpdate: function() {
          if (ballRef.current) {
            const progress = this.progress();
            ballAngle += (1 - progress) * 0.3; // Slow down over time
            const currentRadius = ballRadius * (1 - progress * 0.1); // Spiral inward slightly
            
            ballRef.current.position.x = Math.cos(ballAngle) * currentRadius;
            ballRef.current.position.z = Math.sin(ballAngle) * currentRadius;
            ballRef.current.position.y = 0.15 + Math.sin(progress * Math.PI) * 0.05; // Bounce effect
          }
        }
      });
      
      tl.add(ballSpin, 0);
      
      // Final ball settle
      tl.to(ballRef.current.position, {
        x: Math.cos(Math.random() * Math.PI * 2) * 0.45,
        z: Math.sin(Math.random() * Math.PI * 2) * 0.45,
        y: 0.12,
        duration: 0.5,
        ease: 'bounce.out'
      });
    }
  }, [isActive, onComplete]);

  return (
    <group>
      {/* Spinning wheel group */}
      <group ref={wheelRef}>
        {/* Wheel segments - alternating red/black */}
        {Array.from({ length: 37 }, (_, i) => {
          const angle = (i * Math.PI * 2) / 37;
          const isRed = i > 0 && (i <= 10 || (i >= 19 && i <= 28)) ? i % 2 === 1 : i % 2 === 0;
          const color = i === 0 ? '#00ff00' : isRed ? '#ff0000' : '#000000';
          
          return (
            <mesh key={i} position={[Math.cos(angle) * 0.5, 0.05, Math.sin(angle) * 0.5]}>
              <boxGeometry args={[0.08, 0.02, 0.15]} />
              <meshStandardMaterial color={color} />
            </mesh>
          );
        })}
      </group>
      
      {/* Roulette ball */}
      <mesh ref={ballRef} position={[0.55, 0.15, 0]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshStandardMaterial 
          color="#ffffff"
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
    </group>
  );
}

// Slot Machine Reel Spinning Animation
export function SlotReelSpin({ isActive = false, onComplete }: GameAnimationProps) {
  const reelsRef = useRef<Group[]>([]);
  const [symbols] = useState(['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '7️⃣']);

  useEffect(() => {
    if (isActive && reelsRef.current.length === 3) {
      const tl = gsap.timeline({ onComplete });
      
      reelsRef.current.forEach((reel, index) => {
        if (reel) {
          // Each reel spins for different durations to create staggered stop effect
          const spinDuration = 2 + index * 0.5;
          const rotations = 10 + index * 2;
          
          tl.to(reel.rotation, {
            y: Math.PI * 2 * rotations,
            duration: spinDuration,
            ease: 'power3.out'
          }, index * 0.2);
        }
      });
    }
  }, [isActive, onComplete]);

  return (
    <group>
      {[-0.25, 0, 0.25].map((x, index) => (
        <group 
          key={index} 
          ref={(el) => { if (el) reelsRef.current[index] = el; }}
          position={[x, 0.7, 0.42]}
        >
          {/* Reel symbols */}
          {symbols.map((symbol, symbolIndex) => {
            const angle = (symbolIndex * Math.PI * 2) / symbols.length;
            return (
              <group 
                key={symbolIndex}
                position={[0, Math.sin(angle) * 0.15, Math.cos(angle) * 0.15]}
                rotation={[-angle, 0, 0]}
              >
                <mesh>
                  <planeGeometry args={[0.15, 0.15]} />
                  <meshStandardMaterial 
                    color="#ffffff"
                    transparent
                    opacity={0.9}
                  />
                </mesh>
                {/* Symbol would be rendered as texture in real implementation */}
              </group>
            );
          })}
        </group>
      ))}
    </group>
  );
}

// Craps Dice Rolling Animation
export function CrapsDiceRoll({ isActive = false, onComplete }: GameAnimationProps) {
  const dice1Ref = useRef<Mesh>(null);
  const dice2Ref = useRef<Mesh>(null);

  useEffect(() => {
    if (isActive && dice1Ref.current && dice2Ref.current) {
      const tl = gsap.timeline({ onComplete });
      
      // Starting positions
      const startPos1: [number, number, number] = [-1.5, 0.5, 0];
      const startPos2: [number, number, number] = [-1.3, 0.5, 0.2];
      
      // Target positions
      const endPos1: [number, number, number] = [0.3, 0.15, 0];
      const endPos2: [number, number, number] = [-0.3, 0.15, 0];
      
      // Set starting positions
      dice1Ref.current.position.set(...startPos1);
      dice2Ref.current.position.set(...startPos2);
      
      // Dice 1 animation
      tl.to(dice1Ref.current.position, {
        x: endPos1[0],
        y: endPos1[1],
        z: endPos1[2],
        duration: 1.5,
        ease: 'power2.out'
      })
      .to(dice1Ref.current.rotation, {
        x: Math.PI * 4 + Math.random() * Math.PI,
        y: Math.PI * 3 + Math.random() * Math.PI,
        z: Math.PI * 2 + Math.random() * Math.PI,
        duration: 1.5,
        ease: 'power2.out'
      }, 0);
      
      // Dice 2 animation (slightly delayed)
      tl.to(dice2Ref.current.position, {
        x: endPos2[0],
        y: endPos2[1],
        z: endPos2[2],
        duration: 1.6,
        ease: 'power2.out'
      }, 0.1)
      .to(dice2Ref.current.rotation, {
        x: Math.PI * 3 + Math.random() * Math.PI,
        y: Math.PI * 4 + Math.random() * Math.PI,
        z: Math.PI * 3 + Math.random() * Math.PI,
        duration: 1.6,
        ease: 'power2.out'
      }, 0.1);
      
      // Bounce effect when dice land
      tl.to([dice1Ref.current.position, dice2Ref.current.position], {
        y: 0.25,
        duration: 0.2,
        ease: 'power2.out',
        yoyo: true,
        repeat: 2
      }, 1.3);
    }
  }, [isActive, onComplete]);

  return (
    <group>
      {/* Dice 1 */}
      <mesh ref={dice1Ref} castShadow>
        <boxGeometry args={[0.08, 0.08, 0.08]} />
        <meshStandardMaterial 
          color="#ffffff"
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>
      
      {/* Dice 2 */}
      <mesh ref={dice2Ref} castShadow>
        <boxGeometry args={[0.08, 0.08, 0.08]} />
        <meshStandardMaterial 
          color="#ffffff"
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}