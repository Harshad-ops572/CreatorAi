import React, { useRef, useState, useEffect, Suspense, Component, ErrorInfo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

// 3D Error Boundary
export class ThreeErrorBoundary extends Component<{ children: React.ReactNode; fallback?: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('3D Canvas encountered an error, showing fallback:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-brand-900/20 via-dark-card to-dark-bg border border-brand-500/20 rounded-2xl p-6">
            <div className="w-48 h-48 rounded-full bg-brand-500/20 blur-3xl animate-pulse" />
          </div>
        )
      );
    }
    return this.props.children;
  }
}

// Floating low-poly creator card cluster
function CardMesh({ position, rotation, color, label }: { position: [number, number, number]; rotation: [number, number, number]; color: string; label: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <Float speed={2} rotationIntensity={0.6} floatIntensity={0.8}>
      <mesh ref={meshRef} position={position} rotation={rotation} castShadow receiveShadow>
        <boxGeometry args={[1.5, 2.2, 0.08]} />
        <meshStandardMaterial
          color={color}
          roughness={0.2}
          metalness={0.7}
          transparent
          opacity={0.88}
        />
      </mesh>
    </Float>
  );
}

// Scene with mouse reaction
function SceneCluster() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ pointer }) => {
    if (groupRef.current) {
      // Smoothly tilt towards mouse coordinates
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, pointer.x * 0.4, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -pointer.y * 0.3, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Center glowing core orb */}
      <mesh position={[0, 0, -0.5]}>
        <sphereGeometry args={[0.9, 16, 16]} />
        <meshStandardMaterial
          color="#6366f1"
          emissive="#4f46e5"
          emissiveIntensity={0.8}
          roughness={0.3}
          metalness={0.8}
          wireframe
        />
      </mesh>

      {/* Floating creator cards (Script, Video, Analytics) */}
      <CardMesh position={[-1.3, 0.4, 0.4]} rotation={[0.1, 0.3, -0.1]} color="#4f46e5" label="Script" />
      <CardMesh position={[1.2, -0.3, 0.6]} rotation={[-0.1, -0.3, 0.1]} color="#06b6d4" label="Footage" />
      <CardMesh position={[0.2, 1.1, 0.2]} rotation={[0.2, 0.1, -0.05]} color="#8b5cf6" label="Timeline" />
      <CardMesh position={[-0.2, -1.2, 0.5]} rotation={[-0.2, -0.1, 0.15]} color="#ec4899" label="Export" />
    </group>
  );
}

export const Hero3DScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileOrReducedMotion, setIsMobileOrReducedMotion] = useState(false);

  useEffect(() => {
    // Check mobile or reduced motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;
    if (prefersReducedMotion || isMobile) {
      setIsMobileOrReducedMotion(true);
    }

    // IntersectionObserver to pause rendering when off-screen
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // Page visibility event to pause when tab hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsVisible(false);
      } else if (containerRef.current) {
        setIsVisible(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Simplified lightweight CSS fallback for mobile / reduced-motion
  if (isMobileOrReducedMotion) {
    return (
      <div
        ref={containerRef}
        className="w-full h-[360px] md:h-[450px] flex items-center justify-center relative select-none"
      >
        <div className="relative w-64 h-64 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-600 to-brand-cyan opacity-30 blur-2xl animate-pulse-slow" />
          <div className="glass-panel w-44 h-56 rounded-2xl border border-brand-400/40 p-4 shadow-glow-md flex flex-col justify-between transform -rotate-6">
            <div className="w-8 h-8 rounded-lg bg-brand-500/30 flex items-center justify-center text-xs font-bold text-brand-300">
              AI
            </div>
            <div className="space-y-2">
              <div className="h-2.5 bg-brand-400/30 rounded w-3/4" />
              <div className="h-2 bg-slate-700 rounded w-full" />
              <div className="h-2 bg-slate-700 rounded w-2/3" />
            </div>
          </div>
          <div className="glass-panel absolute w-44 h-56 rounded-2xl border border-cyan-400/40 p-4 shadow-glow-cyan flex flex-col justify-between transform rotate-6 translate-x-6 translate-y-4">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/30 flex items-center justify-center text-xs font-bold text-cyan-300">
              9:16
            </div>
            <div className="space-y-2">
              <div className="h-2.5 bg-cyan-400/30 rounded w-2/3" />
              <div className="h-2 bg-slate-700 rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-[400px] md:h-[480px] lg:h-[540px] relative select-none"
      aria-label="Interactive 3D representation of CreatorAi workflows"
    >
      <ThreeErrorBoundary>
        {isVisible && (
          <Canvas
            dpr={[1, 1.5]} // Capped pixel ratio as mandated
            camera={{ position: [0, 0, 5], fov: 45 }}
            gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
            onCreated={({ gl }) => {
              gl.setClearColor(0x000000, 0);
            }}
          >
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} />
            <pointLight position={[-4, -3, -2]} color="#06b6d4" intensity={0.8} />
            <pointLight position={[3, 3, 2]} color="#6366f1" intensity={1.5} />
            <Suspense fallback={null}>
              <SceneCluster />
            </Suspense>
          </Canvas>
        )}
      </ThreeErrorBoundary>
    </div>
  );
};

export default Hero3DScene;
