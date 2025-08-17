'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingScreen from './LoadingScreen';


interface LoadingWrapperProps {
  children: React.ReactNode;
  minLoadingTime?: number;
  skipLoading?: boolean; // For development/testing
}

export default function LoadingWrapper({ 
  children, 
  minLoadingTime = 2000,
  skipLoading = false 
}: LoadingWrapperProps) {
  const [showContent, setShowContent] = useState(skipLoading);
  const [startTime] = useState(Date.now());
  
  const handleLoadingComplete = () => {
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
    
    setTimeout(() => {
      setShowContent(true);
    }, remainingTime);
  };

  // Skip loading in development if specified
  useEffect(() => {
    if (skipLoading) {
      setShowContent(true);
    }
  }, [skipLoading]);

  return (
    <>
      {/* Loading Screen */}
      {!showContent && (
        <LoadingScreen 
          onLoadingComplete={handleLoadingComplete}
          minLoadingTime={minLoadingTime}
        />
      )}

      {/* Main Content */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ 
              duration: 0.8,
              ease: [0.4, 0, 0.2, 1]
            }}
            className="min-h-screen"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}