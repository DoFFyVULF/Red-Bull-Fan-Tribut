"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { sceneState } from "@/lib/rb/scene";

/* Sketchfab GLB — Oracle Red Bull Racing 2026 challenger (RB22 concept) */
const MODEL_URL = "/models/2026_red_bull_racing_rb22.glb";

/* flip if the model loads facing away from the hero camera */
const CAR_YAW = 0;

/* native bbox is ~5.27 long — scale up slightly for presence */
const TARGET_LENGTH = 6.0;

export default function F1Car() {
  const ringA = useRef<THREE.Group>(null);
  const streaks = useRef<THREE.InstancedMesh>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const dirRef = useRef<THREE.DirectionalLight>(null);

  const { scene } = useGLTF(MODEL_URL);

  /* normalize once: strip junk, pivot ground-center, scale by length */
  const model = useMemo(() => {
    const clone = scene.clone(true);
    const junk: THREE.Object3D[] = [];
    clone.traverse((o) => {
      if ((o as THREE.Light).isLight || (o as THREE.Camera).isCamera) junk.push(o);
    });
    junk.forEach((o) => o.parent?.remove(o));

    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const fitted = new THREE.Group();
    clone.position.set(-center.x, -box.min.y, -center.z);
    fitted.add(clone);
    fitted.scale.setScalar(TARGET_LENGTH / Math.max(size.z, 0.0001));
    return fitted;
  }, [scene]);

  /* wind-tunnel streaks — instanced dashes streaming past the car */
  const streakData = useMemo(() => {
    const count = 46;
    const seeds = Array.from({ length: count }, (_, i) => ({
      x: (Math.random() - 0.5) * 14,
      z: ((i / count) - 0.5) * 30,
      y: 0.25 + Math.random() * 2.4,
      len: 1.2 + Math.random() * 2.6,
      speed: 0.65 + Math.random() * 0.8,
    }));
    return seeds;
  }, []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  /* dusk → studio light fade driven by scroll */
  useEffect(() => {
    if (hemiRef.current) hemiRef.current.intensity = 0.85;
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const p = sceneState.f1;

    /* turntable spin — gentle, pauses-ish feel via damping */
    if (model) model.rotation.y = CAR_YAW + Math.sin(p * Math.PI * 2) * 0.35 + t * 0.05;

    /* studio lighting fade */
    const studio = Math.min(1, Math.max(0, (p - 0.12) / 0.5));
    if (hemiRef.current)
      hemiRef.current.intensity = THREE.MathUtils.lerp(0.85, 0.45, studio);
    if (dirRef.current) {
      dirRef.current.intensity = THREE.MathUtils.lerp(1.5, 2.1, studio);
      dirRef.current.color.set(studio > 0.5 ? "#fff3d6" : "#cfe0ff");
    }

    /* pedestal pulse */
    if (ringA.current) {
      ringA.current.rotation.z = t * 0.35;
      const s = 1 + 0.03 * Math.sin(t * 2.2);
      ringA.current.scale.set(s, s, 1);
    }

    /* streaks stream toward -X (side-wind feel), faster with scroll */
    if (streaks.current) {
      const wind = 0.25 + p * 1.6;
      streakData.forEach((sd, i) => {
        sd.x -= delta * sd.speed * wind * 6;
        if (sd.x < -9) sd.x = 9 + Math.random() * 3;
        dummy.position.set(sd.x, sd.y, sd.z);
        dummy.scale.set(sd.len * (0.4 + p), 1, 1);
        dummy.rotation.y = Math.PI / 2;
        dummy.updateMatrix();
        streaks.current!.setMatrixAt(i, dummy.matrix);
      });
      streaks.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      <hemisphereLight ref={hemiRef} args={["#8fb2ff", "#0a0e27", 0.85]} />
      <directionalLight ref={dirRef} position={[18, 26, 8]} intensity={1.5} color="#cfe0ff" />

      {/* studio floor */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[11, 64]} />
        <meshStandardMaterial color="#0d1226" metalness={0.72} roughness={0.32} />
      </mesh>

      {/* glow rings */}
      <group ref={ringA} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <torusGeometry args={[3.6, 0.02, 8, 96]} />
          <meshStandardMaterial color="#FFD300" emissive="#FFD300" emissiveIntensity={2.0} toneMapped={false} />
        </mesh>
        <mesh>
          <torusGeometry args={[4.3, 0.012, 8, 96]} />
          <meshStandardMaterial color="#DB0840" emissive="#DB0840" emissiveIntensity={1.5} toneMapped={false} />
        </mesh>
      </group>

      {/* wind-tunnel streaks */}
      <instancedMesh ref={streaks} args={[undefined, undefined, 46]}>
        <boxGeometry args={[0.05, 0.04, 0.04]} />
        <meshBasicMaterial color="#ffd300" transparent opacity={0.42} toneMapped={false} />
      </instancedMesh>

      {/* the car */}
      <primitive object={model} />
    </group>
  );
}

useGLTF.preload(MODEL_URL);
