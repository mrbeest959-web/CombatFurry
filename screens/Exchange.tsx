
import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { LEVEL_THRESHOLDS, SKINS } from '../constants';
import { FloatingText, Particle } from '../types';
import { Zap, X, Flame } from 'lucide-react';

const Exchange: React.FC = () => {
  const { state, handleTap, equipSkin, buySkin } = useGame();
  
  // Effect States
  const [clicks, setClicks] = useState<FloatingText[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [shockwaves, setShockwaves] = useState<{id: number, x: number, y: number}[]>([]);
  const [combo, setCombo] = useState(0);
  const comboTimeoutRef = useRef<any>(null);
  
  // 3D Rotation States
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [shake, setShake] = useState(false);
  
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
        
        // Limit rotation
        setRotation({
            x: -mouseY * 20,
            y: mouseX * 20
        });
    };

    // Device Orientation Handler (Mobile)
    const handleOrientation = (e: DeviceOrientationEvent) => {
        if (!e.beta || !e.gamma) return;
        const x = Math.min(Math.max(e.beta - 45, -20), 20);
        const y = Math.min(Math.max(e.gamma, -20), 20);
        setRotation({ x: -x, y: y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const triggerShake = () => {
      setShake(true);
      setTimeout(() => setShake(false), 200);
  };

  const incrementCombo = () => {
      setCombo(prev => prev + 1);
      if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
      comboTimeoutRef.current = setTimeout(() => setCombo(0), 1000);
  };

  const spawnEffects = (x: number, y: number) => {
     // Floating Text
     const id = Date.now() + Math.random();
     const randomRot = (Math.random() - 0.5) * 30; // Random rotation for text
     setClicks(prev => [...prev, { id, x, y, value: state.level }]);

     // Shockwave
     setShockwaves(prev => [...prev, { id, x, y }]);

     // Spawn Particles
     const newParticles: Particle[] = [];
     const particleCount = combo > 10 ? 12 : 6; // More particles on high combo
     for (let i = 0; i < particleCount; i++) {
       const angle = (Math.PI * 2 * i) / particleCount;
       const velocity = 80 + Math.random() * 60;
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
           color: i % 2 === 0 ? currentSkin.colors[0] : '#ffffff'
       });
     }
     setParticles(prev => [...prev, ...newParticles]);
  }

  const handleInteraction = (clientX: number, clientY: number) => {
      const success = handleTap(state.level);
      if (!success) return;

      incrementCombo();
      if (combo > 5) triggerShake(); // Shake screen on combo

      // Add impulse to rotation
      if (coinRef.current) {
          const rect = coinRef.current.getBoundingClientRect();
          const x = clientX - rect.left - rect.width / 2;
          const y = clientY - rect.top - rect.height / 2;
          
          setRotation(prev => ({
              x: prev.x - (y / 8),
              y: prev.y + (x / 8)
          }));
          
          // Squash effect
          setScale(0.9);
          setTimeout(() => setScale(1), 100);
      }

      spawnEffects(clientX, clientY);

      if (navigator.vibrate) {
          navigator.vibrate(combo > 10 ? 30 : 15);
      }
  };

  const handleTouch = (e: React.TouchEvent) => {
    // e.preventDefault();
    const touches = Array.from(e.changedTouches) as any[];
    touches.forEach(touch => {
        handleInteraction(touch.clientX, touch.clientY);
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
      handleInteraction(e.clientX, e.clientY);
  };

  // Cleanup Effects
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setClicks(prev => prev.filter(c => now - c.id < 800));
      setParticles(prev => prev.length > 30 ? prev.slice(15) : prev);
      setShockwaves(prev => prev.filter(s => now - s.id < 500));
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`flex flex-col h-full pb-24 pt-4 px-4 overflow-hidden relative select-none ${shake ? 'animate-shake' : ''}`} ref={containerRef}>
      
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
                className="absolute rounded-full border-4 border-white shockwave"
                style={{
                    left: s.x - 50,
                    top: s.y - 50,
                    width: 100,
                    height: 100,
                    borderColor: currentSkin.colors[1]
                }}
            />
        ))}
         {clicks.map(click => (
            <div
                key={click.id}
                className="absolute text-6xl font-black text-white pointer-events-none animate-float drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] z-50"
                style={{ 
                    left: click.x, 
                    top: click.y,
                    textShadow: `0 0 20px ${currentSkin.colors[0]}`,
                    '--rot': `${(Math.random() - 0.5) * 40}deg`
                } as React.CSSProperties}
            >
                +{click.value}
            </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-2 z-20">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center font-bold text-black text-2xl shadow-[0_0_15px_rgba(250,204,21,0.5)] border-2 border-white/20">
            {state.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white tracking-wide">{state.username}</span>
            <div className="flex items-center space-x-1">
                <span className="text-xs text-yellow-400 font-mono bg-yellow-400/10 px-2 py-0.5 rounded">{currentLevelName}</span>
                {combo > 1 && (
                    <span className="text-xs text-orange-400 font-bold font-mono animate-pulse">COMBO x{combo}</span>
                )}
            </div>
          </div>
        </div>
        <button 
          onClick={() => setShowSkins(true)}
          className="bg-[#1c1c1e] border border-white/10 px-4 py-2 rounded-full text-xs font-bold text-white hover:bg-white/10 transition-all active:scale-95 shadow-lg flex items-center space-x-2"
        >
          <Flame size={16} className="text-orange-500" />
          <span>Скины</span>
        </button>
      </div>

      {/* Progress Card */}
      <div className="bg-[#1c1c1e]/80 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-white/5 shadow-xl relative overflow-hidden z-20">
        <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
            <span>Level {Math.floor(state.level)}</span>
            <span>{Math.floor(state.balance).toLocaleString()} / {nextLevelThreshold.toLocaleString()}</span>
        </div>
        <div className="w-full h-4 bg-black/50 rounded-full overflow-hidden border border-white/5 relative">
            <div 
                className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 transition-all duration-300 shadow-[0_0_15px_rgba(234,179,8,0.6)] relative"
                style={{ width: `${progressPercent}%` }}
            >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
        </div>
      </div>

      {/* Balance */}
      <div className="flex flex-col items-center mb-4 z-20 relative">
        <div className="absolute inset-0 bg-yellow-500/10 blur-[60px] rounded-full transform -translate-y-1/2 pointer-events-none"></div>
        <div className="flex items-center space-x-3 relative transform hover:scale-105 transition-transform cursor-default">
            <img src="https://cryptologos.cc/logos/tether-usdt-logo.png?v=022" className="w-12 h-12 drop-shadow-[0_0_10px_rgba(38,161,123,0.5)]" alt="USDT" />
            <h1 className="text-6xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 drop-shadow-2xl">
                {Math.floor(state.balance).toLocaleString()}
            </h1>
        </div>
        <div className="text-yellow-400/90 text-sm mt-2 font-mono font-bold tracking-widest uppercase flex items-center space-x-2 bg-[#1c1c1e] px-4 py-1.5 rounded-full border border-yellow-400/20 shadow-lg">
            <Zap size={14} fill="currentColor" />
            <span>+{state.profitPerHour.toLocaleString()}/ч</span>
        </div>
      </div>

      {/* 3D COIN CONTAINER */}
      <div className="flex-1 flex items-center justify-center relative min-h-[320px] z-20 perspective-container">
        
        <style dangerouslySetInnerHTML={{__html: `
          .perspective-container { perspective: 1000px; }
          .coin-3d { transform-style: preserve-3d; transition: transform 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        `}} />

        {/* Dynamic Glow Background */}
        <div 
            className="absolute w-[320px] h-[320px] rounded-full blur-[90px] transition-all duration-300 opacity-60 animate-pulse"
            style={{ 
                backgroundColor: currentSkin.colors[0],
                transform: `scale(${1 + (combo * 0.05)}) translate(${rotation.y}px, ${rotation.x}px)`
            }}
        ></div>

        <div 
            ref={coinRef}
            className="coin-3d w-[320px] h-[320px] relative z-10 cursor-pointer touch-none select-none active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouch}
            style={{
                transform: `
                    rotateX(${rotation.x}deg) 
                    rotateY(${rotation.y}deg) 
                    scale(${scale})
                `
            }}
        >
            {/* THICKNESS LAYERS */}
            {[...Array(6)].map((_, i) => (
                <div 
                    key={i}
                    className="absolute inset-0 rounded-full backface-hidden"
                    style={{
                        backgroundColor: '#92400e', 
                        transform: `translateZ(-${i * 3}px)`,
                        boxShadow: '0 0 4px rgba(0,0,0,0.8)'
                    }}
                />
            ))}

            {/* MAIN FACE */}
            <div 
                className="absolute inset-0 rounded-full flex items-center justify-center border-[10px] border-white/20 overflow-hidden backface-hidden"
                style={{
                    background: `radial-gradient(circle at 30% 30%, ${currentSkin.colors[0]}, ${currentSkin.colors[1]})`,
                    transform: 'translateZ(0px)',
                    boxShadow: `
                        inset 0 0 40px rgba(0,0,0,0.4),
                        0 20px 50px rgba(0,0,0,0.6),
                        0 0 0 2px rgba(255,255,255,0.1)
                    `
                }}
            >
                {/* Dynamic Glare */}
                <div 
                    className="absolute inset-0 pointer-events-none rounded-full"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 45%)',
                        transform: `translate(${rotation.y * 1.5}px, ${rotation.x * 1.5}px) scale(1.2)`,
                    }}
                />

                {/* Texture Overlay */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay"></div>

                <div className="absolute inset-6 rounded-full border-2 border-white/30 border-dashed opacity-80 animate-[spin_10s_linear_infinite]"></div>

                <span className="text-9xl font-black text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)] select-none pointer-events-none transform transition-transform duration-200">
                    {currentSkin.symbol}
                </span>
            </div>
        </div>
      </div>

      {/* Energy Bar */}
      <div className="mt-auto mb-4 z-20">
        <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-2 text-yellow-400">
                <div className="p-1 bg-yellow-400/10 rounded-full animate-bounce-subtle">
                    <Zap size={18} fill="currentColor" />
                </div>
                <span className="font-bold text-xl tracking-tight">{Math.floor(state.energy)}</span>
                <span className="text-gray-600 text-sm font-bold">/ {state.maxEnergy}</span>
            </div>
        </div>
        <div className="w-full h-4 bg-[#1c1c1e] rounded-full overflow-hidden border border-white/5 relative shadow-inner">
            <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-200 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(250,204,21,0.5)]"
                style={{ width: `${(state.energy / state.maxEnergy) * 100}%` }}
            >
                <div className="absolute top-0 right-0 h-full w-2 bg-white/50 blur-[2px]"></div>
            </div>
        </div>
      </div>

      {/* Skin Selection Modal */}
      {showSkins && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex flex-col justify-end">
            <div className="bg-[#1c1c1e] rounded-t-3xl p-6 h-[80vh] flex flex-col animate-slide-up border-t border-white/10 shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-white tracking-tight">Магазин Скинов</h2>
                    <button onClick={() => setShowSkins(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><X size={24} /></button>
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
                                className={`p-4 rounded-2xl border-2 flex flex-col items-center relative transition-all active:scale-95 group overflow-hidden ${isActive ? 'border-yellow-400 bg-yellow-400/5' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                            >
                                {isActive && <div className="absolute inset-0 bg-yellow-400/10 blur-xl"></div>}
                                
                                <div 
                                    className="w-24 h-24 rounded-full mb-4 shadow-2xl flex items-center justify-center text-4xl font-bold text-white border-4 border-white/10 transform transition-transform group-hover:scale-110 group-hover:rotate-3"
                                    style={{ background: `linear-gradient(135deg, ${skin.colors[0]}, ${skin.colors[1]})` }}
                                >
                                    {skin.symbol}
                                </div>
                                <h3 className="font-bold text-white mb-2 text-lg">{skin.name}</h3>
                                {isUnlocked ? (
                                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center space-x-2 ${isActive ? 'bg-green-500 text-black shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-white/10 text-gray-400'}`}>
                                        {isActive ? <span>ВЫБРАНО</span> : <span>КУПЛЕНО</span>}
                                    </div>
                                ) : (
                                    <div className="flex items-center text-yellow-400 text-sm font-mono font-bold bg-yellow-400/10 px-4 py-1.5 rounded-full border border-yellow-400/20">
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
