import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                casino: {
                    gold: '#FFD700',
                    'gold-dark': '#FFA500',
                    red: '#DC143C',
                    'red-dark': '#B22222',
                    green: '#228B22',
                    'green-dark': '#006400',
                    'dark-green': '#0F4C3A',
                    burgundy: '#800020',
                    black: '#1a1a1a',
                    white: '#FFFFFF',
                    dark: '#0a0a0a',
                },
                background: "var(--background)",
                foreground: "var(--foreground)",
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                serif: ['Georgia', 'serif'],
                mono: ['Monaco', 'Consolas', 'monospace'],
            },
            animation: {
                'float': 'float 3s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'spin-slow': 'spin 3s linear infinite',
                'pulse-slow': 'pulse 3s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                glow: {
                    '0%': {
                        boxShadow: '0 0 5px #FFD700, 0 0 10px #FFD700'
                    },
                    '100%': {
                        boxShadow: '0 0 10px #FFD700, 0 0 20px #FFD700, 0 0 30px #FFD700'
                    },
                },
            },
            boxShadow: {
                'casino-glow': '0 0 20px rgba(255, 215, 0, 0.3)',
                'casino-shadow': '0 4px 20px rgba(0, 0, 0, 0.3)',
                'casino-inset': 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
            },
            backgroundImage: {
                'casino-gold-gradient': 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                'casino-red-gradient': 'linear-gradient(135deg, #DC143C 0%, #B22222 100%)',
                'casino-green-gradient': 'linear-gradient(135deg, #228B22 0%, #006400 100%)',
                'casino-dark': 'linear-gradient(135deg, #1a1a1a 0%, #0F4C3A 100%)',
            },
            screens: {
                'xs': '475px',
                'sm': '640px',
                'md': '768px',
                'lg': '1024px',
                'xl': '1280px',
                '2xl': '1536px',
                '3xl': '1600px',
                // Mobile-first breakpoints
                'mobile': { 'max': '767px' },
                'tablet': { 'min': '768px', 'max': '1023px' },
                'desktop': { 'min': '1024px' },
                // Touch-specific breakpoints
                'touch': { 'raw': '(hover: none) and (pointer: coarse)' },
                'no-touch': { 'raw': '(hover: hover) and (pointer: fine)' },
                // Orientation breakpoints
                'portrait': { 'raw': '(orientation: portrait)' },
                'landscape': { 'raw': '(orientation: landscape)' },
                // High DPI breakpoints
                'retina': { 'raw': '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)' },
                // Device-specific breakpoints
                'iphone': { 'raw': '(max-width: 428px)' },
                'ipad': { 'raw': '(min-width: 768px) and (max-width: 1024px)' },
                // Performance-based breakpoints
                'low-end': { 'raw': '(max-width: 640px) and (max-height: 800px)' },
                'high-end': { 'raw': '(min-width: 1280px) and (min-height: 800px)' },
            },
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '128': '32rem',
                // Touch-friendly spacing
                'touch-target': '44px', // Minimum touch target size
                'touch-target-lg': '48px', // Large touch target
                'touch-target-xl': '56px', // Extra large touch target
                // Safe area spacing
                'safe-top': 'env(safe-area-inset-top)',
                'safe-bottom': 'env(safe-area-inset-bottom)',
                'safe-left': 'env(safe-area-inset-left)',
                'safe-right': 'env(safe-area-inset-right)',
                // Mobile-specific spacing
                'mobile-padding': '1rem',
                'mobile-margin': '0.75rem',
                'tablet-padding': '1.5rem',
                'desktop-padding': '2rem',
            },
        },
    },
    plugins: [],
};

export default config;