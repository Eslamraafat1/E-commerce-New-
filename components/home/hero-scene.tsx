"use client";

import { Environment, Float, Lightformer, MeshDistortMaterial, PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/** Signature hero object: a liquid, chrome-like orb with orbiting rings. Colours follow brand tokens. */
function Orb({ accent }: { accent: string }) {
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const { x, y } = state.pointer;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, x * 0.6, 3, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -y * 0.4, 3, dt);
    if (ring.current) ring.current.rotation.z += dt * 0.35;
    if (ring2.current) ring2.current.rotation.x += dt * 0.22;
  });
  return (
    <group ref={group}>
      <Float speed={1.4} rotationIntensity={0.5} floatIntensity={0.9}>
        <mesh>
          <icosahedronGeometry args={[1.35, 48]} />
          <MeshDistortMaterial color={accent} roughness={0.12} metalness={0.95} distort={0.38} speed={1.6} envMapIntensity={1.4} />
        </mesh>
        <mesh ref={ring} rotation={[1.1, 0.2, 0]}>
          <torusGeometry args={[2.1, 0.018, 16, 160]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
        </mesh>
        <mesh ref={ring2} rotation={[0.3, 0.9, 0.4]}>
          <torusGeometry args={[2.55, 0.012, 16, 160]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.9} />
        </mesh>
        <mesh position={[2.1, 0.5, 0.2]}><sphereGeometry args={[0.11, 24, 24]} /><meshStandardMaterial color="#ff5b2e" emissive="#ff5b2e" emissiveIntensity={1.2} /></mesh>
      </Float>
    </group>
  );
}

export default function HeroScene({ accent = "#d4ff3a" }: { accent?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [dpr, setDpr] = useState(1.25);

  // Pause rendering while the hero is off-screen or the tab is hidden.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.01 });
    io.observe(el);
    const vis = () => setVisible((v) => v && !document.hidden);
    document.addEventListener("visibilitychange", vis);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", vis); };
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0" aria-hidden>
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={[1, dpr]}
        camera={{ position: [0, 0, 6.2], fov: 38 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        performance={{ min: 0.5 }}
        style={{ pointerEvents: "none" }}
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 5, 3]} intensity={1.6} />
        <Orb accent={accent} />
        {/* Local studio lighting: no HDR download needed */}
        <Environment resolution={128}>
          <Lightformer form="rect" intensity={4} position={[0, 4, -3]} scale={[10, 2, 1]} />
          <Lightformer form="rect" intensity={2} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} />
          <Lightformer form="ring" color="#ff5b2e" intensity={3} position={[4, -1, 3]} scale={3} />
        </Environment>
      </Canvas>
    </div>
  );
}
