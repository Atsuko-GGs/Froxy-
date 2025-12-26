import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Box, Torus, Cylinder, Float, Environment, ContactShadows, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { CharacterState } from '../types';

// Augment the JSX namespace to accept React Three Fiber elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      meshStandardMaterial: any;
      meshBasicMaterial: any;
      pointLight: any;
      ambientLight: any;
      spotLight: any;
      fog: any;
    }
  }
}

interface RobotProps {
  state: CharacterState;
}

const Robot: React.FC<RobotProps> = ({ state }) => {
  const group = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Mesh>(null);

  // Mouse tracking state
  const mouse = useRef(new THREE.Vector2());

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((stateThree) => {
    const t = stateThree.clock.getElapsedTime();

    // Idle floating animation (handled by <Float> mostly, but we add subtle rotation)
    if (group.current) {
      // Look at mouse logic (smooth lerp)
      const targetRotationX = mouse.current.y * 0.2;
      const targetRotationY = mouse.current.x * 0.2;
      
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetRotationX, 0.1);
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRotationY, 0.1);
    }

    // Thinking Animation: Fast spin or bob
    if (state.isThinking && bodyRef.current) {
      bodyRef.current.rotation.z = Math.sin(t * 10) * 0.1;
      if (headRef.current) {
        headRef.current.rotation.y += 0.1; // Spin head while thinking
      }
    } else if (headRef.current) {
       // Reset head rotation smoothly
       headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, 0, 0.1);
    }

    // Speaking Animation: Modulate mouth scale
    if (mouthRef.current) {
      if (state.isSpeaking) {
        // Randomize mouth height to simulate speech
        const speechIntensity = Math.sin(t * 20) * 0.5 + 0.5; // 0 to 1
        mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, 0.2 + speechIntensity * 0.8, 0.4);
      } else {
        // Idle mouth
        mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, 0.1, 0.1);
      }
    }

    // Blinking logic
    if (leftEyeRef.current && rightEyeRef.current) {
      // Blink every ~3 seconds
      const isBlinking = Math.sin(t * 1.5) > 0.98; 
      const scaleY = isBlinking ? 0.1 : 1;
      leftEyeRef.current.scale.y = THREE.MathUtils.lerp(leftEyeRef.current.scale.y, scaleY, 0.4);
      rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, scaleY, 0.4);
    }
  });

  const glowColor = state.isThinking ? "#fbbf24" : state.isSpeaking ? "#38bdf8" : "#22d3ee";
  const eyeColor = state.isThinking ? "#ef4444" : "#00ff00";

  return (
    <group ref={group}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        {/* HEAD */}
        <group ref={headRef} position={[0, 1.2, 0]}>
          {/* Main Helmet */}
          <Sphere args={[0.8, 32, 32]}>
            <meshStandardMaterial color="#ffffff" metalness={0.6} roughness={0.2} />
          </Sphere>
          
          {/* Visor (Face) */}
          <Sphere args={[0.7, 32, 32]} position={[0, 0, 0.15]} scale={[0.9, 0.8, 0.9]}>
            <meshStandardMaterial color="#111827" roughness={0.2} metalness={0.8} />
          </Sphere>

          {/* Eyes */}
          <Sphere ref={leftEyeRef} args={[0.12, 32, 32]} position={[-0.25, 0.1, 0.75]}>
            <meshBasicMaterial color={eyeColor} toneMapped={false} />
            <pointLight distance={1} intensity={2} color={eyeColor} />
          </Sphere>
          <Sphere ref={rightEyeRef} args={[0.12, 32, 32]} position={[0.25, 0.1, 0.75]}>
            <meshBasicMaterial color={eyeColor} toneMapped={false} />
            <pointLight distance={1} intensity={2} color={eyeColor} />
          </Sphere>

          {/* Mouth */}
          <Box ref={mouthRef} args={[0.3, 0.1, 0.1]} position={[0, -0.25, 0.8]} rx={0.5} ry={0.5}>
            <meshBasicMaterial color={glowColor} toneMapped={false} />
          </Box>

          {/* Antenna */}
          <Cylinder args={[0.02, 0.02, 0.5]} position={[0, 0.9, 0]}>
            <meshStandardMaterial color="#94a3b8" />
          </Cylinder>
          <Sphere args={[0.08]} position={[0, 1.15, 0]}>
             <meshStandardMaterial color={state.isThinking ? "#f472b6" : "#e2e8f0"} emissive={state.isThinking ? "#f472b6" : "#000000"} emissiveIntensity={2} />
          </Sphere>
        </group>

        {/* BODY */}
        <group ref={bodyRef} position={[0, -0.2, 0]}>
           <Sphere args={[0.6, 32, 32]} scale={[1, 1.2, 1]}>
             <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.2} />
           </Sphere>
           {/* Chest Light */}
           <Cylinder args={[0.2, 0.2, 0.1]} rotation={[Math.PI/2, 0, 0]} position={[0, 0.2, 0.55]}>
             <meshBasicMaterial color={glowColor} toneMapped={false} opacity={0.8} transparent />
           </Cylinder>
        </group>

        {/* ARMS */}
        <group position={[-0.7, 0, 0]}>
          <Sphere args={[0.2]}>
            <meshStandardMaterial color="#334155" />
          </Sphere>
           <Cylinder args={[0.05, 0.08, 0.6]} position={[0, -0.4, 0]}>
             <meshStandardMaterial color="#ffffff" />
           </Cylinder>
           <Sphere args={[0.15]} position={[0, -0.8, 0]}>
              <meshStandardMaterial color="#334155" />
           </Sphere>
        </group>

        <group position={[0.7, 0, 0]}>
          <Sphere args={[0.2]}>
            <meshStandardMaterial color="#334155" />
          </Sphere>
           <Cylinder args={[0.05, 0.08, 0.6]} position={[0, -0.4, 0]}>
             <meshStandardMaterial color="#ffffff" />
           </Cylinder>
           <Sphere args={[0.15]} position={[0, -0.8, 0]}>
              <meshStandardMaterial color="#334155" />
           </Sphere>
        </group>

        {/* Rings/Holo Effect */}
        <Torus args={[1.2, 0.02, 16, 100]} rotation={[Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.3} />
        </Torus>
      </Float>
      
      <ContactShadows opacity={0.4} scale={10} blur={2.5} far={4} color="#0c4a6e" />
    </group>
  );
};

export const ThreeScene: React.FC<RobotProps> = ({ state }) => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas shadows camera={{ position: [0, 0, 6], fov: 45 }}>
        <fog attach="fog" args={['#0f172a', 5, 20]} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#38bdf8" />
        
        {/* Background Environment */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <Robot state={state} />
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
};