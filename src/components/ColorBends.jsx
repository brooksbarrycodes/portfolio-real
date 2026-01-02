import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

const DEFAULT_COLORS = ['#ff5c7a', '#8a5cff', '#00ffd1'];

function hexToRgb01(hex) {
  const cleaned = String(hex || '').replace('#', '').trim();
  const full =
    cleaned.length === 3
      ? cleaned
          .split('')
          .map((c) => c + c)
          .join('')
      : cleaned;
  const int = parseInt(full || '000000', 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return [r / 255, g / 255, b / 255];
}

export default function ColorBends({
  enableMouse = false,
  colors = DEFAULT_COLORS,
  rotation = 30,
  speed = 0.3,
  scale = 1.2,
  frequency = 1.4,
  warpStrength = 1.2,
  mouseInfluence = 0.8,
  parallax = 0.6,
  noise = 0.08,
  transparent = false,
  className,
  style,
}) {
  const hostRef = useRef(null);
  const rafRef = useRef(null);

  const [c0, c1, c2] = useMemo(() => {
    const arr = Array.isArray(colors) ? colors : DEFAULT_COLORS;
    const a0 = arr[0] ?? DEFAULT_COLORS[0];
    const a1 = arr[1] ?? DEFAULT_COLORS[1];
    const a2 = arr[2] ?? DEFAULT_COLORS[2];
    return [hexToRgb01(a0), hexToRgb01(a1), hexToRgb01(a2)];
  }, [colors]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, transparent ? 0 : 1);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const geometry = new THREE.PlaneGeometry(2, 2);

    const uniforms = {
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(1, 1) },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      u_mouseSmoothed: { value: new THREE.Vector2(0.5, 0.5) },
      u_color0: { value: new THREE.Vector3(c0[0], c0[1], c0[2]) },
      u_color1: { value: new THREE.Vector3(c1[0], c1[1], c1[2]) },
      u_color2: { value: new THREE.Vector3(c2[0], c2[1], c2[2]) },
      u_rotation: { value: (rotation * Math.PI) / 180 },
      u_speed: { value: speed },
      u_scale: { value: scale },
      u_frequency: { value: frequency },
      u_warpStrength: { value: warpStrength },
      u_mouseInfluence: { value: mouseInfluence },
      u_parallax: { value: parallax },
      u_noise: { value: noise },
    };

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      uniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;

        varying vec2 vUv;
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform vec2 u_mouse;
        uniform vec2 u_mouseSmoothed;
        uniform vec3 u_color0;
        uniform vec3 u_color1;
        uniform vec3 u_color2;
        uniform float u_rotation;
        uniform float u_speed;
        uniform float u_scale;
        uniform float u_frequency;
        uniform float u_warpStrength;
        uniform float u_mouseInfluence;
        uniform float u_parallax;
        uniform float u_noise;

        float hash(vec2 p) {
          p = fract(p * vec2(123.34, 456.21));
          p += dot(p, p + 45.32);
          return fract(p.x * p.y);
        }

        float noise2d(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        vec2 rotate2D(vec2 p, float a) {
          float s = sin(a);
          float c = cos(a);
          return mat2(c, -s, s, c) * p;
        }

        vec3 gradient3(float t) {
          t = clamp(t, 0.0, 1.0);
          vec3 ab = mix(u_color0, u_color1, smoothstep(0.0, 1.0, t));
          vec3 bc = mix(u_color1, u_color2, smoothstep(0.0, 1.0, t));
          return mix(ab, bc, smoothstep(0.0, 1.0, t));
        }

        void main() {
          vec2 uv = vUv * 2.0 - 1.0;
          uv.x *= u_resolution.x / max(u_resolution.y, 1.0);

          uv = rotate2D(uv, u_rotation) * u_scale;

          vec2 m = (u_mouseSmoothed - 0.5) * 2.0;
          uv += m * (u_mouseInfluence * 0.25) * u_parallax;

          float t = u_time * (0.8 + u_speed * 2.0);

          float n = noise2d(uv * (2.5 + u_frequency) + vec2(t * 0.15, -t * 0.12));
          float n2 = noise2d(uv * (1.2 + u_frequency * 0.6) + vec2(-t * 0.08, t * 0.1));
          float warp = (n - 0.5) * 2.0 * u_warpStrength + (n2 - 0.5) * 1.2 * u_warpStrength;

          float field =
            sin((uv.x + warp * 0.6) * (3.0 * u_frequency) + t) +
            cos((uv.y - warp * 0.4) * (2.6 * u_frequency) - t * 0.9);

          float grain = (noise2d(gl_FragCoord.xy * 0.5) - 0.5) * u_noise;
          float bands = 0.5 + 0.5 * sin(field * 1.15 + warp * 0.65);
          float mixT = fract(bands + grain);

          vec3 col = gradient3(mixT);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const setSize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h, false);
      uniforms.u_resolution.value.set(w, h);
    };
    setSize();

    const onResize = () => setSize();
    window.addEventListener('resize', onResize);

    const onMouseMove = (e) => {
      const rect = host.getBoundingClientRect();
      const x = (e.clientX - rect.left) / Math.max(rect.width, 1);
      const y = 1.0 - (e.clientY - rect.top) / Math.max(rect.height, 1);
      uniforms.u_mouse.value.set(x, y);
    };
    if (enableMouse) window.addEventListener('mousemove', onMouseMove, { passive: true });

    let last = performance.now();
    let lastFrame = 0;
    const minDt = 1000 / 30;
    const tick = (now) => {
      if (document.visibilityState === 'hidden') {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      if (now - lastFrame < minDt) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      lastFrame = now;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      uniforms.u_time.value += dt;

      const target = uniforms.u_mouse.value;
      const smoothed = uniforms.u_mouseSmoothed.value;
      smoothed.lerp(target, 0.08);

      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      if (enableMouse) window.removeEventListener('mousemove', onMouseMove);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === host) host.removeChild(renderer.domElement);
    };
  }, [c0, c1, c2, rotation, speed, scale, frequency, warpStrength, mouseInfluence, parallax, noise, transparent]);

  return (
    <div
      ref={hostRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        ...style,
      }}
    />
  );
}
