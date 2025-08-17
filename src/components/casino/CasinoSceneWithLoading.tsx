'use client';

import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Html } from '@react-three/drei';
import { Suspense, useState } from 'react';
import { Vector3 } from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import CasinoEnvironment from './CasinoEnvironment';
import CasinoLighting from './CasinoLighting';
import CameraController from './CameraController';
import CameraNavigation from './CameraNavigation';
import KeyboardControls, { KeyboardShortcutsHelp } from './KeyboardControls';
import SpinningChips from '../loading/SpinningChips';
import LODSystem from './LODSystem';
import { useDeviceCapabilities, getOptimalQualitySettings } from '@/lib/utils/deviceDetection';

interface CasinoSceneWithLoadingProps {
  className?: string;
  onCameraChange?: (position: Vector3, target: Vector3) => void;
  showNavigation?: boolean;
  showKeyboardHelp?: boolean;
}

// 3D Loading fallback component
function Scene3DLoading() {
  return (
    <Html center>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-8 bg-casino-black/80 rounded-lg backdrop-blur-sm"
      >
        <div className="scale-75 mb-4">
          <SpinningChips />
        </div>
        <p className="text-casino-white/80 text-sm">
          Loading 3D casino environment...
        </p>
      </motion.div>
    </Html>
  );
}

// Error boundary for 3D content
function Scene3DError() {
  return (
    <Html center>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center p-8 bg-red-900/80 rounded-lg backdrop-blur-sm max-w-md text-center"
      >
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-white font-semibold mb-2">3D Loading Error</h3>
        <p className="text-white/80 text-sm mb-4">
          Unable to load the 3D casino environment. This might be due to:
        </p>
        <ul className="text-white/70 text-xs text-left space-y-1 mb-4">
          <li>• WebGL not supported on your device</li>
          <li>• Insufficient graphics capabilities</li>
          <li>• Network connectivity issues</li>
        </ul>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-casino-gold text-casino-black rounded font-medium text-sm hover:bg-casino-gold/90 transition-colors"
        >
          Retry Loading
        </button>
      </motion.div>
    </Html>
  );
}

export default function CasinoSceneWithLoading({ 
  className = '', 
  onCameraChange,
  showNavigation = true,
  showKeyboardHelp = false
}: CasinoSceneWithLoadingProps) {
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [showHelp, setShowHelp] = useState(showKeyboardHelp);
  const [hasError, setHasError] = useState(false);
  
  const capabilities = useDeviceCapabilities();
  const qualitySettings = getOptimalQualitySettings(capabilities);

  const handleCameraChange = (position: Vector3, target: Vector3) => {
    if (onCameraChange) {
      onCameraChange(position, target);
    }
  };

  const handleWebGLError = () => {
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className={`w-full h-full bg-casino-dark flex items-center justify-center ${className}`}>
        <Scene3DError />
      </div>
    );
  }

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        shadows={qualitySettings.enableLOD ? false : true}
        camera={{ position: [0, 1.6, 3], fov: 75 }}
        dpr={qualitySettings.pixelRatio}
        gl={{ 
          antialias: qualitySettings.antialias,
          alpha: false,
          powerPreference: capabilities.isMobile ? 'default' : 'high-performance'
        }}
        onCreated={({ gl }) => {
          // Check for WebGL support
          if (!gl.getContext()) {
            handleWebGLError();
          }
          
          // Shadow map configuration is handled by individual lights
        }}
        onError={handleWebGLError}
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

        {/* Casino environment with LOD system and loading fallback */}
        <Suspense fallback={<Scene3DLoading />}>
          <LODSystem 
            enabled={qualitySettings.enableLOD}
            maxDistance={qualitySettings.lodDistance}
            levels={qualitySettings.maxLODLevel}
          >
            <CasinoEnvironment />
          </LODSystem>
        </Suspense>
      </Canvas>
      
      {/* Keyboard controls for accessibility */}
      <KeyboardControls enabled={cameraEnabled} />
      
      {/* Camera navigation panel - desktop only */}
      {showNavigation && !capabilities.isMobile && (
        <CameraNavigation 
          onNavigate={(gameId) => console.log(`Navigated to ${gameId}`)}
        />
      )}

      {/* Instructions overlay for first-time users */}
      {!capabilities.isMobile && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="absolute top-4 left-4 bg-black/70 text-white p-3 rounded-lg text-sm max-w-xs pointer-events-none"
        >
          <p className="mb-1">🖱️ Click to look around</p>
          <p className="mb-1">🎯 Navigate between game tables</p>
          <button 
            className="text-yellow-400 hover:text-yellow-300 text-xs pointer-events-auto transition-colors"
            onClick={() => setShowHelp(!showHelp)}
          >
            ⌨️ Show keyboard shortcuts
          </button>
        </motion.div>
      )}
      
      {/* Mobile instructions */}
      {capabilities.isMobile && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="absolute top-4 left-4 right-4 bg-black/70 text-white p-3 rounded-lg text-sm pointer-events-none"
        >
          <p className="text-center">📱 Touch and drag to look around • Tap menu to select games</p>
        </motion.div>
      )}

      {/* Keyboard shortcuts help - desktop only */}
      <AnimatePresence>
        {showHelp && !capabilities.isMobile && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-4 left-80 max-w-sm"
          >
            <KeyboardShortcutsHelp />
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
              onClick={() => setShowHelp(false)}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Performance indicator for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 left-4 bg-black/70 text-white p-2 rounded text-xs">
          <div>Device: {capabilities.isMobile ? 'Mobile' : capabilities.isTablet ? 'Tablet' : 'Desktop'}</div>
          <div>Screen: {capabilities.screenSize}</div>
          <div>LOD: {qualitySettings.enableLOD ? 'Enabled' : 'Disabled'}</div>
          <div>Shadows: {qualitySettings.enableLOD ? 'Disabled' : 'Enabled'}</div>
          <div>Target FPS: {qualitySettings.targetFPS}</div>
        </div>
      )}
    </div>
  );
}