# High Roller Club Website

An immersive, first-person casino experience built with Next.js 14, showcasing the High Roller Club Discord bot.

## 🎰 Features

- **Immersive 3D Casino Environment** - First-person view using Three.js and React Three Fiber
- **Seven Casino Games** - Blackjack, Three Card Poker, Roulette, Slots, Craps, Higher or Lower, Horse Racing
- **Smooth Animations** - GSAP and Framer Motion for fluid interactions
- **Responsive Design** - Optimized for desktop and mobile devices
- **Performance Optimized** - Built-in monitoring and device capability detection

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **3D Graphics**: Three.js + React Three Fiber + Drei
- **Animations**: GSAP + Framer Motion
- **Styling**: Tailwind CSS with custom casino theme
- **Performance**: Built-in FPS monitoring and device optimization

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with casino theme
│   └── page.tsx           # Landing page
├── components/
│   ├── casino/            # 3D casino environment components
│   ├── games/             # Game-specific showcase components
│   ├── ui/                # Reusable UI components
│   └── animations/        # Animation wrapper components
├── lib/
│   ├── types/             # TypeScript interfaces
│   ├── data/              # Game configuration data
│   ├── three/             # Three.js utilities
│   ├── animations/        # GSAP and Framer Motion configs
│   └── utils/             # General utilities
└── styles/                # Global styles and Tailwind config
```

## 🎨 Casino Theme

The project includes a custom casino color palette:

- **Gold**: `#FFD700` - Primary accent color
- **Red**: `#DC143C` - Casino red for highlights
- **Green**: `#228B22` - Table green
- **Black**: `#1a1a1a` - Background
- **Dark Green**: `#0F4C3A` - Secondary background

## 🎮 Games Included

1. **Blackjack** - Classic 21 with AI strategy hints
2. **Three Card Poker** - Fast-paced poker variant
3. **Roulette** - European roulette with realistic physics
4. **Slot Machines** - Multiple themed slots with progressive jackpots
5. **Craps** - Dice game with realistic physics
6. **Higher or Lower** - Card prediction with multiplier chains
7. **Horse Racing** - Virtual racing with AI commentary

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file for environment-specific settings:

```env
NEXT_PUBLIC_DISCORD_INVITE_URL=your_discord_invite_url
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

### Performance Settings

The app includes automatic performance optimization:

- Device capability detection
- Automatic quality adjustment based on FPS
- Memory usage monitoring
- Progressive asset loading

## 📱 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

WebGL 2.0 support recommended for optimal performance.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is private and proprietary to High Roller Club.