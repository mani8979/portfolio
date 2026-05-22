'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer, Html } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';

// 🧩 Ganti import glb menjadi path dari public/
const cardGLB = '/models/card.glb';
import maniImg from '../../assets/images/mani-babu.jpg';
// 🧩 Tetap bisa pakai png dari src
import lanyard from '../../assets/Lanyard/lanyard.png';

extend({ MeshLineGeometry, MeshLineMaterial });

export default function Lanyard({ position = [0, 0, 30], gravity = [0, -40, 0], fov = 20, transparent = true }) {
  return (
    <div className="relative z-0 w-full h-screen flex justify-center items-center transform scale-100 origin-center">
      <Canvas
        camera={{ position: position, fov: fov }}
        gl={{ alpha: transparent }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={1 / 60}>
          <Band />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
        </Environment>
      </Canvas>
    </div>
  );
}

function Band({ maxSpeed = 50, minSpeed = 0 }) {
  const band = useRef(), fixed = useRef(), j1 = useRef(), j2 = useRef(), j3 = useRef(), card = useRef();
  const vec = new THREE.Vector3(), ang = new THREE.Vector3(), rot = new THREE.Vector3(), dir = new THREE.Vector3();
  const segmentProps = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 4, linearDamping: 4 };

  const { nodes, materials } = useGLTF(cardGLB);
  const texture = useTexture(lanyard);
  const [curve] = useState(() => new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]));
  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);
  const [isSmall, setIsSmall] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.50, 0]]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
  }, [hovered, dragged]);

  useEffect(() => {
    const handleResize = () => {
      setIsSmall(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z });
    }
    if (fixed.current) {
      [j1, j2].forEach((ref) => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(ref.current.translation(), delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)));
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(32));
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = 'chordal';
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e) => (e.target.releasePointerCapture(e.pointerId), drag(false))}
            onPointerDown={(e) => (e.target.setPointerCapture(e.pointerId), drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation()))))}>
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial color="#111111" clearcoat={1} clearcoatRoughness={0.15} roughness={0.9} metalness={0.8} />
              
              {/* Front of ID Card */}
              <Html 
                transform 
                position={[0, 0, 0.011]} 
                rotation={[0, 0, 0]} 
                scale={0.015} 
                zIndexRange={[100, 0]}
                pointerEvents="none"
              >
                <div style={{ width: '220px', height: '330px', backgroundColor: '#0c0c0c', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '16px', overflow: 'hidden', position: 'relative', border: '1px solid #1f2937' }}>
                   
                   <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '8px', zIndex: 10 }}>
                      <div style={{ width: '24px', height: '24px', backgroundColor: '#00ffdc', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontWeight: 'bold', fontSize: '12px' }}>M</div>
                      <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px' }}>PORTFOLIO</span>
                   </div>

                   <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #00ffdc', zIndex: 10, boxShadow: '0 0 20px rgba(0,255,220,0.5)' }}>
                      <img src={maniImg} alt="Mani Babu" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                   </div>

                   <div style={{ width: '100%', backgroundColor: 'white', borderRadius: '8px', padding: '12px', textAlign: 'center', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <h2 style={{ color: 'black', fontWeight: '900', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Kalla Mani Babu</h2>
                      <div style={{ backgroundColor: 'black', color: '#00ffdc', fontSize: '10px', padding: '4px 8px', borderRadius: '9999px', marginTop: '6px', fontWeight: 'bold' }}>
                         FULL STACK DEV
                      </div>
                   </div>

                   {/* Vertical text */}
                   <div style={{ position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%) rotate(90deg)', opacity: 0.1, zIndex: 0 }}>
                      <span style={{ fontSize: '48px', fontWeight: '900', color: 'white', letterSpacing: '4px' }}>MANI</span>
                   </div>
                </div>
              </Html>

              {/* Back of ID Card */}
              <Html 
                transform 
                position={[0, 0, -0.011]} 
                rotation={[0, Math.PI, 0]} 
                scale={0.015} 
                zIndexRange={[100, 0]}
                pointerEvents="none"
              >
                <div style={{ width: '220px', height: '330px', backgroundColor: '#0c0c0c', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', overflow: 'hidden', border: '1px solid #1f2937' }}>
                   <div style={{ width: '48px', height: '48px', backgroundColor: '#00ffdc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontWeight: '900', fontSize: '24px', marginBottom: '16px' }}>M</div>
                   <span style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', letterSpacing: '2px' }}>PORTFOLIO</span>
                   <span style={{ color: '#6b7280', fontSize: '12px', marginTop: '8px' }}>kallamanibabu.me</span>
                   
                   <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '4px' }}>
                       <span style={{ color: '#9ca3af', fontSize: '10px' }}>EXPERIENCE</span>
                       <span style={{ color: 'white', fontSize: '10px', fontWeight: 'bold' }}>2+ YEARS</span>
                     </div>
                     <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '4px' }}>
                       <span style={{ color: '#9ca3af', fontSize: '10px' }}>PROJECTS</span>
                       <span style={{ color: 'white', fontSize: '10px', fontWeight: 'bold' }}>4+ COMPLETED</span>
                     </div>
                   </div>
                </div>
              </Html>
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isSmall ? [1000, 2000] : [1000, 1000]}
          useMap
          map={texture}
          repeat={[-4, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  );
}
