import React, { useEffect, useRef, useState } from 'react';
import './LoadingScreen.css';
import carImage from '../assets/car-topdown.png';

export default function LoadingScreen({ onComplete }) {
    const [isVisible, setIsVisible] = useState(true);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const containerRef = useRef(null);
    const carRef = useRef(null);

    // Physics state
    const mouse = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const carPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight + 200, angle: -Math.PI / 2 });
    const rafId = useRef(null);

    useEffect(() => {
        // Handle mouse move
        const handleMouseMove = (e) => {
            mouse.current = { x: e.clientX, y: e.clientY };
        };

        // For touch devices
        const handleTouchMove = (e) => {
            if (e.touches.length > 0) {
                mouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove);

        // Animation Loop
        const update = () => {
            if (!carRef.current) return;

            const speed = 0.05; // Lerp factor for position
            const dx = mouse.current.x - carPos.current.x;
            const dy = mouse.current.y - carPos.current.y;

            // Update position
            carPos.current.x += dx * speed;
            carPos.current.y += dy * speed;

            // Calculate target angle
            let targetAngle = Math.atan2(dy, dx);

            // Normalize angle difference to avoid spinning 360 degrees when crossing Math.PI
            let angleDiff = targetAngle - carPos.current.angle;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

            // Smooth rotation (drift effect - slow rotation interpolation)
            carPos.current.angle += angleDiff * 0.08;

            // Apply transform
            // Note: Math.atan2 returns angle in radians, 0 is right. 
            // Our top-down car image might be facing UP or RIGHT by default.
            // If the image faces RIGHT, we don't need to add offset. If it faces UP, we add Math.PI/2 (90deg).
            // Assuming it faces right initially (or we can tweak this offset later):
            const rotationDeg = (carPos.current.angle * 180) / Math.PI;

            // Center the image based on its width/height (approx 100px)
            carRef.current.style.transform = `translate(${carPos.current.x}px, ${carPos.current.y}px) translate(-50%, -50%) rotate(${rotationDeg + 90}deg)`;

            rafId.current = requestAnimationFrame(update);
        };

        rafId.current = requestAnimationFrame(update);

        // Auto complete after 3.5 seconds to ensure user isn't stuck if they don't click
        const timer = setTimeout(() => {
            completeLoading();
        }, 3500);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            cancelAnimationFrame(rafId.current);
            clearTimeout(timer);
        };
    }, []);

    const completeLoading = () => {
        if (isFadingOut) return;
        setIsFadingOut(true);
        setTimeout(() => {
            setIsVisible(false);
            if (onComplete) onComplete();
        }, 800); // 800ms fade out duration
    };

    if (!isVisible) return null;

    return (
        <div
            ref={containerRef}
            className={`fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-red-900 to-[#0a0000] overflow-hidden cursor-crosshair transition-opacity duration-800 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}
            onClick={completeLoading}
        >
            {/* Background radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.15)_0%,transparent_70%)]"></div>

            {/* Loading Text */}
            <div className="relative z-10 pointer-events-none select-none flex flex-col items-center">
                <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-[0.2em] md:tracking-[0.4em] text-white/90 drop-shadow-2xl">
                    YÜKLENİYOR
                </h1>
                <div className="mt-4 flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>

            {/* Car Figure */}
            <img
                ref={carRef}
                src={carImage}
                alt="BMW E36 Drift"
                className="absolute top-0 left-0 w-32 h-32 md:w-48 md:h-48 object-contain pointer-events-none loading-car-image"
                style={{ transformOrigin: 'center center' }}
            />

            {/* Click to skip hint */}
            <div className="absolute bottom-8 text-white/40 text-xs sm:text-sm font-light tracking-widest pointer-events-none animate-pulse">
                Geçmek için tıklayın
            </div>
        </div>
    );
}
