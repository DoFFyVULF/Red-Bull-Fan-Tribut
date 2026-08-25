"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { sceneState } from "@/lib/rb/scene";

/* Sketchfab "Redbull" by yashwanthantony9542 — CC-BY-4.0
   https://sketchfab.com/3d-models/redbull-4dfe63f5c5804c63b7752484539ccc64 */
const MODEL_URL = "/models/redbull.glb";

/* scene-fit constants — the procedural can was ~3.05 units tall, bottom at -1.45 */
const TARGET_HEIGHT = 3.05;
const BOTTOM_Y = -1.45;

export default function GlbCan() {
  const spinner = useRef<THREE.Group>(null); // continuous rotation
  const tilt = useRef<THREE.Group>(null); // pointer parallax
  const ring = useRef<THREE.Group>(null);

  const spinSpeed = useRef(0.32);

  const { scene } = useGLTF(MODEL_URL);

  /* normalize once: strip stray lights/cameras, pivot bottom-center, scale */
  const model = useMemo(() => {
    const clone = scene.clone(true);
    const junk: THREE.Object3D[] = [];

    clone.traverse((o) => {
      if ((o as THREE.Light).isLight || (o as THREE.Camera).isCamera) junk.push(o);
    });
    junk.forEach((o) => o.parent?.remove(o));

    /* fit: uniform-scale by height, pivot at bottom-center */
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const fitted = new THREE.Group();
    clone.position.set(-center.x, -box.min.y, -center.z);
    fitted.add(clone);
    fitted.scale.setScalar(TARGET_HEIGHT / Math.max(size.y, 0.0001));
    fitted.position.y = BOTTOM_Y;
    return fitted;
  }, [scene]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    /* continuous spin — slower before the intro finishes */
    const targetSpin = sceneState.started ? 0.32 : 0.1;
    spinSpeed.current = THREE.MathUtils.damp(spinSpeed.current, targetSpin, 2.5, delta);
    if (spinner.current)
      spinner.current.rotation.y += delta * spinSpeed.current * (sceneState.reduced ? 0.2 : 1);

    /* pointer parallax tilt */
    if (tilt.current && !sceneState.mobile && !sceneState.reduced) {
      tilt.current.rotation.x = THREE.MathUtils.damp(tilt.current.rotation.x, sceneState.py * 0.14, 3, delta);
      tilt.current.rotation.y = THREE.MathUtils.damp(tilt.current.rotation.y, sceneState.px * 0.18, 3, delta);
    }

    /* pedestal ring pulse */
    if (ring.current) {
      ring.current.rotation.z = t * 0.4;
      const s = 1 + 0.04 * Math.sin(t * 2.4) + sceneState.burst * 0.15;
      ring.current.scale.set(s, s, 1);
    }
  });

  return (
    <group>
      {/* pedestal glow rings */}
      <group ref={ring} position={[0, -1.85, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <torusGeometry args={[1.35, 0.022, 8, 80]} />
          <meshStandardMaterial color="#FFD300" emissive="#FFD300" emissiveIntensity={2.2} toneMapped={false} />
        </mesh>
        <mesh>
          <torusGeometry args={[1.62, 0.014, 8, 80]} />
          <meshStandardMaterial color="#DB0840" emissive="#DB0840" emissiveIntensity={1.6} toneMapped={false} />
        </mesh>
      </group>

      <group ref={tilt}>
        <group ref={spinner}>
          <primitive object={model} />
        </group>
      </group>
    </group>
  );
}

/* warm the fetch as soon as the module is imported (SceneCanvas loads it eagerly) */
useGLTF.preload(MODEL_URL);
