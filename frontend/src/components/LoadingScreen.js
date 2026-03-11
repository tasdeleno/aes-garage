import React, { useEffect, useState } from 'react';
import './LoadingScreen.css';
import carImage from '../assets/car-topdown.png';

export default function LoadingScreen({ onComplete }) {
    const [isVisible, setIsVisible] = useState(true);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        // Spawn smoke particles continuously for the burnout effect
        const spawnInterval = setInterval(() => {
            setParticles(prev => {
                // Keep enough particles for dense dual smoke
                const current = prev.length > 30 ? prev.slice(prev.length - 30) : prev;

                // Base distance backward and laterally
                const backwardForce = Math.random() * 100 + 50;  // Shoots backward (left)
                const lateralForce = Math.random() * 80 + 30;   // Shoots outward (up/down)

                // Tire 1: Top-Left (Rear Left) - shoots Left and UP
                const p1 = {
                    id: Date.now() + Math.random(),
                    x: `calc(50% - 100px)`,    // Rear of car (100px left of center)
                    y: `calc(50% - 160px)`,    // Top tire (relative to car center at Y-120px)
                    tx: `${-backwardForce}px`, // Go Left
                    ty: `${-lateralForce}px`,  // Go Up
                    size: 40 + Math.random() * 40,
                };

                // Tire 2: Bottom-Left (Rear Right) - shoots Left and DOWN
                const p2 = {
                    id: Date.now() + Math.random() * 2,
                    x: `calc(50% - 100px)`,    // Rear of car
                    y: `calc(50% - 80px)`,     // Bottom tire
                    tx: `${-backwardForce}px`, // Go Left
                    ty: `${lateralForce}px`,   // Go Down
                    size: 40 + Math.random() * 40,
                };
                return [...current, p1, p2];
            });
        }, 100); // Spawn every 100ms (optimized smoke)

        const timer = setTimeout(() => {
            completeLoading();
        }, 3500);

        return () => {
            clearInterval(spawnInterval);
            clearTimeout(timer);
        };
    }, []);

    const completeLoading = () => {
        if (isFadingOut) return;
        setIsFadingOut(true);
        setTimeout(() => {
            setIsVisible(false);
            if (onComplete) onComplete();
        }, 800);
    };

    if (!isVisible) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-red-900 to-[#0a0000] overflow-hidden transition-opacity duration-800 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}
            onClick={completeLoading}
        >
            {/* Background radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.15)_0%,transparent_70%)] z-0"></div>

            {/* Loading Text */}
            <div className="absolute top-[calc(50%+40px)] left-1/2 -translate-x-1/2 z-10 pointer-events-none select-none flex flex-col items-center">
                <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-[0.2em] md:tracking-[0.4em] text-white/90 drop-shadow-[0_0_30px_rgba(255,0,0,0.5)]">
                    YÜKLENİYOR
                </h1>
                <div className="mt-4 flex space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>

            {/* Smoke Particles */}
            {particles.map(p => (
                <div
                    key={p.id}
                    className="smoke-particle"
                    style={{
                        left: p.x,
                        top: p.y,
                        width: p.size,
                        height: p.size,
                        '--tx': p.tx,
                        '--ty': p.ty
                    }}
                />
            ))}

            {/* Centered Car Figure for Burnout - POSITIONED ABOVE TEXT */}
            <img
                src={carImage}
                alt="BMW E36 Burnout"
                className="absolute top-[calc(50%-120px)] left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-80 md:h-80 object-contain pointer-events-none loading-car-image"
            />

            {/* Click to skip hint */}
            <div className="absolute bottom-8 text-white/40 text-xs sm:text-sm font-light tracking-widest pointer-events-none animate-pulse z-30">
                Geçmek için tıklayın
            </div>
        </div>
    );
}
