
import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { LEVEL_THRESHOLDS, SKINS } from '../constants';
import { FloatingText, Particle } from '../types';
import { Zap, X } from 'lucide-react';

const Exchange: React.FC = () => {
  const { state, handleTap, equipSkin, buySkin } = useGame();
  
  // Effect States
  const [clicks, setClicks] = useState<FloatingText[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [shockwaves, setShockwaves] = useState<{id: number, x: number, y: number}[]>([]);
  
  // 3D Rotation States
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isPressed, setIsPressed] = useState(false);
  
  // UI States
  const [showSkins, setShowSkins] = useState(false);
  
  const coinRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const currentSkin = SKINS.find(s => s.id === state.activeSkin) || SKINS[0];
  const currentLevelName = LEVEL_THRESHOLDS[Math.min(state.level - 1, LEVEL_THRESHOLDS.length - 1)].name;
  
  // Progress calc
  const nextLevelThreshold = LEVEL_THRESHOLDS[Math.min(state.level, LEVEL_THRESHOLDS.length - 1)].threshold;
  const currentThreshold = LEVEL_THRESHOLDS[Math.min(state.level - 1, LEVEL_THRESHOLDS.length - 1)].threshold;
  const progressPercent = nextLevelThreshold === currentThreshold 
    ? 100 
    : Math.min(100, Math.max(0, ((state.balance - currentThreshold) / (nextLevelThreshold - currentThreshold)) * 100));

  // --- 3D & INTERACTION LOGIC ---

  useEffect(() => {
    // Mouse Movement Handler (Desktop)
    const handleMouseMove = (e: MouseEvent) => {
        if (!containerRef.current) return;
        
        const { left, top, width, height } = containerRef.current.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        
        // Calculate distance from center normalized -1 to 1
        const mouseX = (e.clientX - centerX) / (width / 2);
        const mouseY = (e.clientY - centerY) / (height / 2);
        
        // Limit rotation to 25 degrees
        setRotation({
            x: -mouseY * 25,
            y: mouseX * 25
        });
    };

    // Device Orientation Handler (Mobile)
    const handleOrientation = (e: DeviceOrientationEvent) => {
        if (!e.beta || !e.gamma) return;
        
        // Beta is front/back tilt (-180 to 180). We clamp to +/- 45
        // Gamma is left/right tilt (-90 to 90). We clamp to +/- 45
        const x = Math.min(Math.max(e.beta - 45, -25), 25); // Offset by 45deg for comfortable holding angle
        const y = Math.min(Math.max(e.gamma, -25), 25);
        
        setRotation({ x: -x, y: y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const spawnEffects = (x: number, y: number) => {
     // Floating Text
     const id = Date.now() + Math.random();
     setClicks(prev => [...prev, { id, x, y, value: state.level }]);

     // Shockwave
     setShockwaves(prev => [...prev, { id, x, y }]);

     // Spawn Particles
     const newParticles: Particle[] = [];
     const particleCount = 6;
     for (let i = 0; i < particleCount; i++) {
       const angle = (Math.PI * 2 * i) / particleCount;
       const velocity = 60 + Math.random() * 40;
       const tx = Math.cos(angle) * velocity;
       const ty = Math.sin(angle) * velocity;
       const rotation = Math.random() * 360;
       
       newParticles.push({
           id: Math.random(),
           x,
           y,
           tx,
           ty,
           tr: rotation,
           color: currentSkin.colors[0]
       });
     }
     setParticles(prev => [...prev, ...newParticles]);
  }

  const handleTouch = (e: React.TouchEvent) => {
    // e.preventDefault(); // Handled by CSS touch-action: none
    setIsPressed(true);
    const touches = Array.from(e.changedTouches) as any[];
    
    // Add extra "punch" to rotation based on tap location
    if (touches.length > 0 && coinRef.current) {
        const rect = coinRef.current.getBoundingClientRect();
        const touch = touches[0];
        const x = touch.clientX - rect.left - rect.width / 2;
        const y = touch.clientY - rect.top - rect.height / 2;
        
        setRotation(prev => ({
            x: prev.x - (y / 5), // Add impulse
            y: prev.y + (x / 5)
        }));
    }

    let tapCount = 0;
    touches.forEach(touch => {
        const success = handleTap(state.level);
        if (success) {
            tapCount++;
            spawnEffects(touch.clientX, touch.clientY);
        }
    });

    if (tapCount > 0 && navigator.vibrate) {
        navigator.vibrate(tapCount * 15);
    }
    
    setTimeout(() => setIsPressed(false), 150);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
      setIsPressed(true);
      const success = handleTap(state.level);
      if (!success) return;
      
      // Add click impulse
      if (coinRef.current) {
          const rect = coinRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          setRotation(prev => ({
            x: prev.x - (y / 5),
            y: prev.y + (x / 5)
          }));
      }
      
      spawnEffects(e.clientX, e.clientY);
      setTimeout(() => setIsPressed(false), 150);
  };

  // Cleanup Effects
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setClicks(prev => prev.filter(c => now - c.id < 800));
      setParticles(prev => prev.length > 20 ? prev.slice(10) : prev);
      setShockwaves(prev => prev.filter(s => now - s.id < 500));
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full pb-24 pt-4 px-4 overflow-hidden relative select-none" ref={containerRef}>
      
      {/* FIXED OVERLAY FOR EFFECTS */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {particles.map(p => (
            <div 
                key={p.id}
                className="particle w-2 h-2 rounded-full shadow-[0_0_10px_currentColor]"
                style={{
                    left: p.x,
                    top: p.y,
                    backgroundColor: p.color,
                    '--tx': `${p.tx}px`,
                    '--ty': `${p.ty}px`,
                    '--tr': `${p.tr}deg`
                } as React.CSSProperties}
            />
        ))}
        {shockwaves.map(s => (
            <div 
                key={s.id}
                className="absolute rounded-full border-2 border-white shockwave"
                style={{
                    left: s.x - 40,
                    top: s.y - 40,
                    width: 80,
                    height: 80,
                    borderColor: currentSkin.colors[1]
                }}
            />
        ))}
         {clicks.map(click => (
            <div
                key={click.id}
                className="absolute text-5xl font-black text-white pointer-events-none animate-float drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] z-50"
                style={{ 
                    left: click.x, 
                    top: click.y,
                    textShadow: `0 0 10px ${currentSkin.colors[0]}`
                }}
            >
                +{click.value}
            </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 z-20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center font-bold text-black text-xl shadow-lg border border-white/20">
            {state.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white tracking-wide">{state.username}</span>
            <span className="text-xs text-yellow-400 font-mono">{currentLevelName}</span>
          </div>
        </div>
        <button 
          onClick={() => setShowSkins(true)}
          className="bg-[#1c1c1e] border border-white/10 px-4 py-2 rounded-full text-xs font-bold text-white hover:bg-white/10 transition-all active:scale-95 shadow-lg"
        >
          Скины
        </button>
      </div>

      {/* Progress Card */}
      <div className="bg-[#1c1c1e]/80 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-white/5 shadow-xl relative overflow-hidden z-20">
        <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
            <span>Прогресс уровня</span>
            <span>{Math.floor(state.level)} / 10</span>
        </div>
        <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden border border-white/5">
            <div 
                className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 transition-all duration-300 shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                style={{ width: `${progressPercent}%` }}
            />
        </div>
      </div>

      {/* Balance */}
      <div className="flex flex-col items-center mb-6 z-20 relative">
        <div className="absolute inset-0 bg-yellow-500/5 blur-3xl rounded-full transform -translate-y-1/2 pointer-events-none"></div>
        <div className="flex items-center space-x-3 relative">
            <img src="https://cryptologos.cc/logos/tether-usdt-logo.png?v=022" className="w-10 h-10 drop-shadow-lg" alt="USDT" />
            <h1 className="text-5xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 drop-shadow-2xl">
                {Math.floor(state.balance).toLocaleString()}
            </h1>
        </div>
        <div className="text-yellow-400/80 text-sm mt-1 font-mono font-bold tracking-widest uppercase flex items-center space-x-1 bg-yellow-400/5 px-2 py-0.5 rounded-lg border border-yellow-400/10">
            <span>+{state.profitPerHour.toLocaleString()}</span>
            <span>в час</span>
        </div>
      </div>

      {/* 3D COIN CONTAINER */}
      <div className="flex-1 flex items-center justify-center relative min-h-[300px] z-20 perspective-container">
        
        {/* CSS for specific 3D container */}
        <style dangerouslySetInnerHTML={{__html: `
          .perspective-container {
            perspective: 1000px;
          }
          .coin-3d {
            transform-style: preserve-3d;
            transition: transform 0.1s cubic-bezier(0.2, 0, 0.4, 1);
          }
          .coin-layer {
            position: absolute;
            inset: 0;
            border-radius: 50%;
            backface-visibility: hidden;
          }
        `}} />

        {/* Ambient Glow */}
        <div 
            className="absolute w-[280px] h-[280px] rounded-full blur-[80px] transition-colors duration-500 opacity-60 animate-pulse"
            style={{ 
                backgroundColor: currentSkin.colors[0],
                transform: `translate(${rotation.y}px, ${rotation.x}px)` // Glow moves slightly
            }}
        ></div>

        <div 
            ref={coinRef}
            className="coin-3d w-[300px] h-[300px] relative z-10 cursor-pointer touch-none select-none"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouch}
            style={{
                transform: `
                    rotateX(${rotation.x}deg) 
                    rotateY(${rotation.y}deg) 
                    scale(${isPressed ? 0.95 : 1})
                `
            }}
        >
            {/* THICKNESS LAYERS (Simulating edge) */}
            {[...Array(5)].map((_, i) => (
                <div 
                    key={i}
                    className="coin-layer"
                    style={{
                        backgroundColor: '#b45309', // Darker gold/bronze for edge
                        transform: `translateZ(-${i * 2}px)`,
                        width: '100%',
                        height: '100%',
                        boxShadow: '0 0 2px rgba(0,0,0,0.5)'
                    }}
                />
            ))}

            {/* MAIN FACE */}
            <div 
                className="coin-layer flex items-center justify-center border-[8px] border-opacity-30 border-white relative overflow-hidden"
                style={{
                    background: `radial-gradient(circle at 50% 50%, ${currentSkin.colors[0]}, ${currentSkin.colors[1]})`,
                    transform: 'translateZ(0px)',
                    boxShadow: `
                        inset 0 0 30px rgba(0,0,0,0.2),
                        0 10px 30px rgba(0,0,0,0.5)
                    `
                }}
            >
                {/* Dynamic Glare/Shine */}
                <div 
                    className="absolute inset-0 pointer-events-none rounded-full"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%)',
                        transform: `translate(${rotation.y * 2}px, ${rotation.x * 2}px) scale(1.5)`,
                        opacity: 0.6
                    }}
                />

                {/* Inner Ring */}
                <div className="absolute inset-4 rounded-full border-2 border-white/20 border-dashed opacity-70"></div>

                <span className="text-9xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)] select-none pointer-events-none transform transition-transform group-hover:scale-110">
                    {currentSkin.symbol}
                </span>
            </div>
        </div>
      </div>

      {/* Energy Bar */}
      <div className="mt-auto mb-4 z-20">
        <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-1 text-yellow-400">
                <Zap size={20} fill="currentColor" className="animate-pulse" />
                <span className="font-bold text-xl">{Math.floor(state.energy)}</span>
                <span className="text-gray-500 text-sm font-bold">/ {state.maxEnergy}</span>
            </div>
        </div>
        <div className="w-full h-3 bg-[#1c1c1e] rounded-full overflow-hidden border border-white/5">
            <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-200 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                style={{ width: `${(state.energy / state.maxEnergy) * 100}%` }}
            />
        </div>
      </div>

      {/* Skin Selection Modal */}
      {showSkins && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-end">
            <div className="bg-[#1c1c1e] rounded-t-3xl p-6 h-[75vh] flex flex-col animate-slide-up border-t border-white/10 shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-white">Магазин Скинов</h2>
                    <button onClick={() => setShowSkins(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10"><X size={24} /></button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 overflow-y-auto pb-8 no-scrollbar">
                    {SKINS.map(skin => {
                        const isUnlocked = state.unlockedSkins.includes(skin.id);
                        const isActive = state.activeSkin === skin.id;

                        return (
                            <div 
                                key={skin.id} 
                                onClick={() => {
                                    if (isUnlocked) equipSkin(skin.id);
                                    else buySkin(skin);
                                }}
                                className={`p-4 rounded-2xl border-2 flex flex-col items-center relative transition-all active:scale-95 ${isActive ? 'border-yellow-400 bg-yellow-400/5' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                            >
                                <div 
                                    className="w-20 h-20 rounded-full mb-4 shadow-xl flex items-center justify-center text-3xl font-bold text-white border-2 border-white/10"
                                    style={{ background: `linear-gradient(135deg, ${skin.colors[0]}, ${skin.colors[1]})` }}
                                >
                                    {skin.symbol}
                                </div>
                                <h3 className="font-bold text-white mb-2">{skin.name}</h3>
                                {isUnlocked ? (
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isActive ? 'bg-green-500 text-black' : 'bg-white/10 text-gray-400'}`}>
                                        {isActive ? 'Выбрано' : 'Куплено'}
                                    </div>
                                ) : (
                                    <div className="flex items-center text-yellow-400 text-sm font-mono font-bold bg-yellow-400/10 px-3 py-1 rounded-full">
                                        <span>{skin.price.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default Exchange;
