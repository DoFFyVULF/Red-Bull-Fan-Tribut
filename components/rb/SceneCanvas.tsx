"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import { sceneState } from "@/lib/rb/scene";
import EnergyParticles from "./three/EnergyParticles";
import GlbCan from "./three/GlbCan";
import F1Car from "./three/F1Car";

/* ── camera keyframes across the CAN pinned section ── */
const CAN_KEYS = [
  { c: 0.0, theta: -0.2, r: 7.6, y: 1.4 },
  { c: 0.28, theta: 1.65, r: 5.4, y: 2.7 },
  { c: 0.55, theta: 2.35, r: 6.2, y: 2.9 },
  { c: 0.8, theta: Math.PI * 2, r: 6.0, y: 1.6 },
  { c: 1.0, theta: Math.PI * 2, r: 6.6, y: 1.05 },
];

function canCam(c: number) {
  return keyLerp(CAN_KEYS, c);
}

/* ── camera keyframes across the RB22 pinned section ── */
const F1_KEYS = [
  { c: 0.0, theta: 0.5, r: 9.6, y: 1.7 }, // front three-quarter
  { c: 0.28, theta: Math.PI * 0.55, r: 8.0, y: 1.3 }, // side profile
  { c: 0.55, theta: Math.PI * 1.05, r: 8.8, y: 2.8 }, // rear high
  { c: 0.8, theta: Math.PI * 1.6, r: 7.4, y: 3.6 }, // top sweep
  { c: 1.0, theta: Math.PI * 2.5, r: 10.2, y: 1.4 }, // loop back to front
];

function f1Cam(c: number) {
  return keyLerp(F1_KEYS, c);
}

function keyLerp(
  keys: { c: number; theta: number; r: number; y: number }[],
  c: number
) {
  let a = keys[0];
  let b = keys[keys.length - 1];
  for (let i = 0; i < keys.length - 1; i++) {
    if (c >= keys[i].c && c <= keys[i + 1].c) {
      a = keys[i];
      b = keys[i + 1];
      break;
    }
  }
  const span = Math.max(0.0001, b.c - a.c);
  const t = THREE.MathUtils.smoothstep((c - a.c) / span, 0, 1);
  return {
    theta: THREE.MathUtils.lerp(a.theta, b.theta, t),
    r: THREE.MathUtils.lerp(a.r, b.r, t),
    y: THREE.MathUtils.lerp(a.y, b.y, t),
  };
}

/* ── master camera rig ── */
function CameraRig() {
  const { camera } = useThree();
  const camPos = useRef(new THREE.Vector3(0, 2.4, 15.5));
  const camLook = useRef(new THREE.Vector3(0, 0.3, 0));
  const fov = useRef(44);

  useFrame((state, delta) => {
    const k = 3.2; // damping stiffness
    const dt = Math.min(delta, 0.05);
    let tx = 0,
      ty = 1.5,
      tz = 12,
      lx = 0,
      ly = 0.4,
      lz = 0;
    let tFov = sceneState.mobile ? 56 : 44;

    /* portrait screens squeeze the horizontal FOV — the 6-unit RB22 and
       the can orbit radii are framed for landscape, so back the camera
       off as the aspect narrows below ~1.35. No-op on desktop. */
    const cam = camera as THREE.PerspectiveCamera;
    const widen = cam.aspect > 0
      ? THREE.MathUtils.clamp(1.35 / cam.aspect, 1, 1.9)
      : 1;

    if (sceneState.f1Active || sceneState.f1Near) {
      /* ── RB22 studio orbit (pre-framed at key 0 while approaching) ── */
      const fc = f1Cam(sceneState.f1Active ? sceneState.f1 : 0);
      tx = Math.sin(fc.theta) * fc.r * widen;
      ty = fc.y;
      tz = Math.cos(fc.theta) * fc.r * widen;
      lx = 0;
      ly = 0.55;
      lz = 0;
      tFov = sceneState.mobile ? 60 : 50;
    } else if (sceneState.canActive || sceneState.heroActive) {
      /* ── hero + can orbit ── */
      const h = sceneState.hero;
      const c = sceneState.can;
      let theta: number, r: number, y: number;
      let lookY = 0.5;
      if (sceneState.canActive) {
        const cc = canCam(c);
        theta = cc.theta;
        r = cc.r;
        y = cc.y;
        lookY = 0.45;
      } else {
        theta = 0.35 - h * 0.55;
        r = 8.1 - h * 0.6;
        y = 1.7 + h * 0.4;
        lookY = sceneState.mobile ? 1.5 : 1.15;
      }
      r *= widen;
      /* intro dolly blends from far */
      const intro = sceneState.intro;
      const ix = THREE.MathUtils.lerp(0, Math.sin(theta) * r, intro);
      const iz = THREE.MathUtils.lerp(15.5, Math.cos(theta) * r, intro);
      const iy = THREE.MathUtils.lerp(2.4, y, intro);
      tx = ix;
      ty = iy;
      tz = iz;
      lx = 0;
      ly = THREE.MathUtils.lerp(0.3, lookY, intro);
      lz = 0;
    } else {
      /* ── rest pose — ambient particle field ── */
      const t = state.clock.elapsedTime;
      tx = Math.sin(t * 0.05) * 2.0;
      ty = 1.6 + Math.sin(t * 0.08) * 0.4;
      tz = 13;
      lx = 0;
      ly = 0.5;
      lz = 0;
    }

    /* pointer parallax (desktop only) */
    if (!sceneState.mobile && !sceneState.reduced && !sceneState.f1Active && !sceneState.f1Near) {
      tx += sceneState.px * 0.4;
      ty += -sceneState.py * 0.28;
    }

    const d = (cur: number, target: number) =>
      THREE.MathUtils.damp(cur, target, k, dt);
    camPos.current.x = d(camPos.current.x, tx);
    camPos.current.y = d(camPos.current.y, ty);
    camPos.current.z = d(camPos.current.z, tz);
    camLook.current.x = d(camLook.current.x, lx);
    camLook.current.y = d(camLook.current.y, ly);
    camLook.current.z = d(camLook.current.z, lz);
    fov.current = d(fov.current, tFov);

    camera.position.copy(camPos.current);
    camera.lookAt(camLook.current);
    const pc = camera as THREE.PerspectiveCamera;
    if (Math.abs(pc.fov - fov.current) > 0.01) {
      // eslint-disable-next-line react-hooks/immutability -- legitimate three.js camera mutation
      pc.fov = fov.current;
      pc.updateProjectionMatrix();
    }
  });
  return null;
}

/* ── can wrapper: phase positioning + scale in/out ── */
function CanRig() {
  const g = useRef<THREE.Group>(null);
  const s = useRef(0.0001);

  useFrame((state, delta) => {
    if (!g.current) return;
    const dt = Math.min(delta, 0.05);
    const active = (sceneState.heroActive || sceneState.canActive) && !sceneState.f1Active && !sceneState.f1Near;
    const target = active ? Math.max(sceneState.intro, 0.0001) : 0.0001;
    s.current = THREE.MathUtils.damp(s.current, target, 4.5, dt);
    const sc = s.current;
    g.current.scale.setScalar(sc);
    g.current.visible = sc > 0.01;

    /* push aside during ingredient phase */
    const cp = sceneState.can;
    const push = cp > 0.78 ? 1 : 0;
    const px = sceneState.mobile ? 0 : push * 2.6;
    const py = sceneState.mobile ? push * 1.9 : 0;
    g.current.position.x = THREE.MathUtils.damp(g.current.position.x, px, 4, dt);
    g.current.position.y = THREE.MathUtils.damp(g.current.position.y, py, 4, dt);

    /* gentle float */
    if (!sceneState.reduced) {
      g.current.position.y += Math.sin(state.clock.elapsedTime * 1.2) * 0.002;
    }
  });

  return (
    <group ref={g} scale={0.0001}>
      <GlbCan />
    </group>
  );
}

/* ── RB22 wrapper: visibility + scale in/out ── */
function F1Rig() {
  const g = useRef<THREE.Group>(null);
  const s = useRef(0.0001);

  useFrame((_, delta) => {
    if (!g.current) return;
    const dt = Math.min(delta, 0.05);
    const target = (sceneState.f1Active || sceneState.f1Near) && !sceneState.canActive ? 1 : 0.0001;
    s.current = THREE.MathUtils.damp(s.current, target, 3.4, dt);
    g.current.scale.setScalar(s.current);
    g.current.visible = s.current > 0.01;
    /* gentle rise from below the floor while scaling in */
    g.current.position.y = (s.current - 1) * 4;
  });

  return (
    <group ref={g} scale={0.0001}>
      <F1Car />
    </group>
  );
}

export default function SceneCanvas() {
  /* render-time mirror of the media flags — sceneState is a mutable,
     non-reactive object, so props like dpr need real state to update */
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mqM = window.matchMedia("(max-width: 768px)");
    const mqR = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      sceneState.mobile = mqM.matches;
      sceneState.reduced = mqR.matches;
      setIsMobile(mqM.matches);
    };
    apply();
    mqM.addEventListener("change", apply);
    mqR.addEventListener("change", apply);
    return () => {
      mqM.removeEventListener("change", apply);
      mqR.removeEventListener("change", apply);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ contain: "strict" }}
    >
      <Canvas
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        dpr={isMobile ? [1, 1.5] : [1, 1.75]}
        camera={{ position: [0, 2.4, 15.5], fov: 44, near: 0.1, far: 220 }}
        style={{ background: "transparent" }}
      >
        <fog attach="fog" args={["#0A0E27", 20, 85]} />

        <Suspense fallback={null}>
          {/* metallic studio environment — fully procedural, no network */}
          <Environment resolution={128} frames={1}>
            <Lightformer intensity={2.4} position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[12, 12, 1]} color="#ffffff" />
            <Lightformer intensity={1.6} position={[-6, 2, 3]} rotation={[0, Math.PI / 2, 0]} scale={[7, 3, 1]} color="#8fb2ff" />
            <Lightformer intensity={1.9} position={[6, 2.5, 2]} rotation={[0, -Math.PI / 2, 0]} scale={[7, 2.4, 1]} color="#ff3d6e" />
            <Lightformer intensity={1.4} position={[0, 2, -7]} scale={[8, 3, 1]} color="#ffd300" />
            <Lightformer intensity={0.9} position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[10, 10, 1]} color="#2a3352" />
          </Environment>

          {/* lights for the can hero */}
          <ambientLight intensity={0.32} />
          <pointLight position={[4.5, 4, 5]} intensity={55} color="#ff4d75" distance={26} decay={2} />
          <pointLight position={[-5, 2.5, 4]} intensity={40} color="#7fa0ff" distance={24} decay={2} />
          <pointLight position={[0, 3.5, -5]} intensity={30} color="#ffd300" distance={20} decay={2} />
          <directionalLight position={[6, 10, 8]} intensity={1.1} color="#e8eeff" />

          <EnergyParticles />
          <CanRig />
          <F1Rig />
          <CameraRig />

          <EffectComposer multisampling={0}>
            <Bloom intensity={0.85} luminanceThreshold={0.28} luminanceSmoothing={0.2} mipmapBlur radius={0.72} />
            <Vignette eskil={false} offset={0.22} darkness={0.78} />
            {!isMobile && <Noise opacity={0.035} />}
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
