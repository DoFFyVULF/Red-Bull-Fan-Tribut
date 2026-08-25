"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { sceneState } from "@/lib/rb/scene";

/**
 * Flow-field energy particles — GPU animated shader points.
 * Golden / bull-red / silver dust drifting on a curl-noise field,
 * pushed away by the pointer and bursting on "energy" events.
 */

const VERT = /* glsl */ `
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uBurst;
  uniform float uPixelRatio;
  uniform float uReduced;

  attribute float aSeed;
  attribute float aScale;
  attribute vec3 aColor;

  varying vec3 vColor;
  varying float vAlpha;

  vec3 flowField(vec3 p, float t) {
    return vec3(
      sin(p.y * 0.32 + t * 0.50) + cos(p.z * 0.27 - t * 0.33),
      sin(p.z * 0.24 + t * 0.42) + cos(p.x * 0.31 + t * 0.36),
      sin(p.x * 0.29 - t * 0.47) + cos(p.y * 0.26 - t * 0.41)
    );
  }

  void main() {
    vec3 pos = position;
    float t = uTime * (0.35 + aSeed * 0.55);
    float motion = mix(1.0, 0.15, uReduced);

    vec3 f = flowField(pos, t);
    pos += f * (0.55 + 0.45 * aSeed) * motion;

    // endless upward drift, wrapped
    pos.y = mod(pos.y + uTime * (0.12 + 0.22 * aSeed) * motion + 22.0, 44.0) - 22.0;

    // pointer repulsion (pointer in ~NDC, mapped to world bounds)
    vec2 pw = uPointer * vec2(16.0, 10.0);
    vec2 d = pos.xz * 0.0 + pos.xy - pw;
    float dist = length(d);
    float push = smoothstep(4.5, 0.0, dist) * 1.8;
    pos.x += (d.x / max(dist, 0.001)) * push;
    pos.y += (d.y / max(dist, 0.001)) * push;

    // energy burst from center
    if (uBurst > 0.001) {
      vec3 dir = normalize(pos + vec3(0.0, 0.001, 0.0));
      pos += dir * uBurst * (2.5 + 4.0 * aSeed);
    }

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    float size = aScale * (1.0 + uBurst * 1.6) * uPixelRatio;
    gl_PointSize = size * (34.0 / -mv.z);

    float edge = smoothstep(22.0, 16.0, abs(pos.y));
    float twinkle = 0.55 + 0.45 * sin(uTime * (1.2 + aSeed * 2.4) + aSeed * 40.0);
    vAlpha = edge * twinkle;
    vColor = aColor;
  }
`;

const FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float core = smoothstep(0.5, 0.05, d);
    float glow = smoothstep(0.5, 0.0, d) * 0.35;
    float a = (core + glow) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;

const GOLD = new THREE.Color("#FFD300");
const RED = new THREE.Color("#DB0840");
const SILVER = new THREE.Color("#C0BFBF");
const ORANGE = new THREE.Color("#F4801F");

export default function EnergyParticles({ count }: { count?: number }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const burstRef = useRef(0);

  const n = count ?? (typeof window !== "undefined" &&
  (window.innerWidth < 768 || window.matchMedia("(pointer: coarse)").matches)
    ? 600
    : 2000);

  const { positions, seeds, scales, colors } = useMemo(() => {
    const positions = new Float32Array(n * 3);
    const seeds = new Float32Array(n);
    const scales = new Float32Array(n);
    const colors = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 44;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 16 - 2;
      seeds[i] = Math.random();
      scales[i] = 0.4 + Math.random() * 1.4;
      const r = Math.random();
      const c = r < 0.45 ? GOLD : r < 0.72 ? SILVER : r < 0.92 ? RED : ORANGE;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, seeds, scales, colors };
  }, [n]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uBurst: { value: 0 },
      uPixelRatio: { value: typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 2) : 1 },
      uReduced: { value: 0 },
    }),
    []
  );

  useFrame((state, delta) => {
    const u = matRef.current?.uniforms;
    if (!u) return;
    u.uTime.value += delta;
    u.uPointer.value.set(sceneState.px, -sceneState.py);
    u.uReduced.value = sceneState.reduced ? 1 : 0;
    /* keep point sizing in sync with the canvas' actual dpr cap */
    u.uPixelRatio.value = state.gl.getPixelRatio();

    // burst decays; sceneState.burst accumulates events
    burstRef.current = Math.max(burstRef.current * 0.92, 0);
    if (sceneState.burst > 0.001) {
      burstRef.current = Math.min(burstRef.current + sceneState.burst, 1.4);
      sceneState.burst *= 0.85;
    }
    u.uBurst.value = burstRef.current;
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
        <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={VERT}
        fragmentShader={FRAG}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
