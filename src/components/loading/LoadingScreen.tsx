'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SpinningChips from './SpinningChips';
import LoadingProgress from './LoadingProgress';
import { useStandaloneAssetLoader } from '@/lib/hooks/useAssetLoader';

interface LoadingScreenProps {
    onLoadingComplete: () => void;
    minLoadingTime?: number; // Minimum time to show loading screen (for UX)
}

export default function LoadingScreen({
    onLoadingComplete,
    minLoadingTime = 2000
}: LoadingScreenProps) {
    const [showTransition, setShowTransition] = useState(false);
    const { progress, isComplete, currentAsset } = useStandaloneAssetLoader();

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (isComplete) {
            // Ensure minimum loading time for better UX
            timeoutId = setTimeout(() => {
                setShowTransition(true);
                // Wait for exit animation to complete
                setTimeout(onLoadingComplete, 800);
            }, Math.max(0, minLoadingTime - Date.now()));
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [isComplete, minLoadingTime, onLoadingComplete]);

    return (
        <AnimatePresence>
            {!showTransition && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{
                        opacity: 0,
                        scale: 1.1,
                        transition: {
                            duration: 0.8,
                            ease: [0.4, 0, 0.2, 1]
                        }
                    }}
                    className="fixed inset-0 z-50 bg-gradient-to-br from-casino-black via-casino-dark to-black flex flex-col items-center justify-center"
                >
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.1),transparent_70%)]" />
                        <div className="absolute inset-0 bg-[url('/patterns/casino-pattern.svg')] opacity-20" />
                    </div>

                    {/* Main loading content */}
                    <div className="relative z-10 text-center">
                        {/* Logo/Title */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="mb-12"
                        >
                            <h1 className="text-6xl md:text-8xl font-bold bg-casino-gold-gradient bg-clip-text text-transparent mb-4">
                                High Roller Club
                            </h1>
                            <p className="text-casino-white/60 text-lg md:text-xl">
                                Preparing your exclusive casino experience...
                            </p>
                        </motion.div>

                        {/* Spinning chips animation */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="mb-12"
                        >
                            <SpinningChips />
                        </motion.div>

                        {/* Loading progress */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.8 }}
                            className="w-full max-w-md mx-auto"
                        >
                            <LoadingProgress
                                progress={progress}
                                currentAsset={currentAsset}
                            />
                        </motion.div>

                        {/* Loading tips */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 1.2 }}
                            className="mt-8 text-casino-white/40 text-sm"
                        >
                            <p>💎 Loading premium 3D casino environment</p>
                            <p className="mt-1">🎰 Preparing interactive game tables</p>
                        </motion.div>
                    </div>

                    {/* Ambient particles */}
                    <div className="absolute inset-0 pointer-events-none">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-1 h-1 bg-casino-gold/30 rounded-full"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                }}
                                animate={{
                                    opacity: [0.3, 0.8, 0.3],
                                    scale: [1, 1.5, 1],
                                }}
                                transition={{
                                    duration: 2 + Math.random() * 2,
                                    repeat: Infinity,
                                    delay: Math.random() * 2,
                                }}
                            />
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}