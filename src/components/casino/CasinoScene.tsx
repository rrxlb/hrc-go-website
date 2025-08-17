'use client';

import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { Suspense, useState } from 'react';
import { Vector3 } from 'three';
import CasinoEnvironment from './CasinoEnvironment';
import CasinoLighting from './CasinoLighting';
import CameraController from './CameraController';
import CameraNavigation from './CameraNavigation';
import KeyboardControls, { KeyboardShortcutsHelp } from './KeyboardControls';

interface CasinoSceneProps {
  className?: string;
  onCameraChange?: (position: Vector3, target: Vector3) => void;
  showNavigation?: boolean;
  showKeyboardHelp?: boolean;
}

export default function CasinoScene({ 
  className = '', 
  onCameraChange,
  showNavigation = true,
  showKeyboardHelp = false
}: CasinoSceneProps) {
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [showHelp, setShowHelp] = useState(showKeyboardHelp);

  const handleCameraChange = (position: Vector3, target: Vector3) => {
    if (onCameraChange) {
      onCameraChange(position, target);
    }
  };

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        shadows
        camera={{ position: [0, 1.6, 3], fov: 75 }}
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance'
        }}
      >
        {/* First-person camera positioned at table level */}
        <PerspectiveCamera
          makeDefault
          position={[0, 1.6, 3]}
          fov={75}
          near={0.1}
          far={100}
        />
        
        {/* Advanced camera controller with smooth transitions */}
        <CameraController
          enabled={cameraEnabled}
          sensitivity={0.002}
          smoothness={0.1}
          onCameraChange={handleCameraChange}
        />

        {/* Casino lighting system */}
        <CasinoLighting />

        {/* Casino environment and floor */}
        <Suspense fallback={null}>
          <CasinoEnvironment />
        </Suspense>
      </Canvas>
      
      {/* Keyboard controls for accessibility */}
      <KeyboardControls enabled={cameraEnabled} />
      
      {/* Camera navigation panel */}
      {showNavigation && (
        <CameraNavigation 
          onNavigate={(gameId) => console.log(`Navigated to ${gameId}`)}
        />
      )}

      {/* Instructions overlay for first-time users */}
      <div className="absolute top-4 left-4 bg-black/70 text-white p-3 rounded-lg text-sm max-w-xs pointer-events-none">
        <p className="mb-1">🖱️ Click to look around</p>
        <p className="mb-1">📱 Touch and drag on mobile</p>
        <p className="mb-1">🎯 Navigate between game tables</p>
        <button 
          className="text-yellow-400 hover:text-yellow-300 text-xs pointer-events-auto"
          onClick={() => setShowHelp(!showHelp)}
        >
          ⌨️ Show keyboard shortcuts
        </button>
      </div>

      {/* Keyboard shortcuts help */}
      {showHelp && (
        <div className="absolute top-4 left-80 max-w-sm">
          <KeyboardShortcutsHelp />
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-white"
            onClick={() => setShowHelp(false)}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}