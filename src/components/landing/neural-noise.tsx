"use client";

import { useEffect, useRef } from "react";

/**
 * Animated green "neural noise" behind the whole landing page, hero to footer: one fixed canvas,
 * one animation that never restarts. The shaders are the ones from rahil1202's NeuralNoiseCursor
 * on 21st.dev (layered rotated sine noise that bends toward the pointer), with the palette held at
 * its opening green rather than drifting with page scroll.
 *
 * Tuned to run all the time without hurting the page:
 * - full strength in the hero, settling to `restOpacity` below it so body text stays readable;
 * - rendered below device resolution and capped at 30 fps (the noise is soft and slow, so neither shows);
 * - pauses while the tab is hidden; a single still frame with reduced motion; hidden without WebGL.
 */
const VERTEX = `
  precision mediump float;
  attribute vec2 a_position;
  varying vec2 vUv;
  void main() {
    vUv = 0.5 * (a_position + 1.0);
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT = `
  precision mediump float;
  varying vec2 vUv;
  uniform float u_time;
  uniform float u_ratio;
  uniform vec2  u_pointer_position;
  uniform float u_scroll_progress;
  uniform float u_pointer_strength;
  uniform float u_time_scale;

  vec2 rotate(vec2 uv, float th) {
    return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
  }

  float neuro_shape(vec2 uv, float t, float p) {
    vec2 sine_acc = vec2(0.0);
    vec2 res = vec2(0.0);
    float scale = 8.0;

    for (int j = 0; j < 15; j++) {
      uv = rotate(uv, 1.0);
      sine_acc = rotate(sine_acc, 1.0);
      vec2 layer = uv * scale + float(j) + sine_acc - t;
      sine_acc += sin(layer) + 2.4 * p;
      res += (0.5 + 0.5 * cos(layer)) / scale;
      scale *= 1.2;
    }
    return res.x + res.y;
  }

  void main() {
    vec2 uv = 0.5 * vUv;
    uv.x *= u_ratio;

    // pointer falloff
    vec2 pointer = vUv - u_pointer_position;
    pointer.x *= u_ratio;
    float p = clamp(length(pointer), 0.0, 1.0);
    p = 0.5 * pow(1.0 - p, 2.0) * u_pointer_strength;

    float t = 0.001 * u_time * u_time_scale;

    float noise = neuro_shape(uv, t, p);
    noise = 1.2 * pow(noise, 3.0);
    noise += pow(noise, 10.0);
    noise = max(0.0, noise - 0.5);
    noise *= (1.0 - length(vUv - 0.5));

    vec3 base = normalize(vec3(
      0.2,
      0.5 + 0.4 * cos(3.0 * u_scroll_progress),
      0.5 + 0.5 * sin(3.0 * u_scroll_progress)
    ));

    vec3 color = base * noise;
    gl_FragColor = vec4(color, noise);
  }
`;

export function NeuralNoise({ opacity = 0.95, restOpacity = 0.55, pointerStrength = 1, timeScale = 1 }: { opacity?: number; restOpacity?: number; pointerStrength?: number; timeScale?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, antialias: false }) as WebGLRenderingContext | null;
    if (!gl) {
      canvas.style.display = "none";
      return;
    }
    const compile = (src: string, type: number) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(sh));
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };
    const vs = compile(VERTEX, gl.VERTEX_SHADER);
    const fs = compile(FRAGMENT, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    const u = (name: string) => gl.getUniformLocation(program, name);
    const uTime = u("u_time");
    const uRatio = u("u_ratio");
    const uPointer = u("u_pointer_position");
    gl.uniform1f(u("u_scroll_progress"), 0); // hold the opening green
    gl.uniform1f(u("u_pointer_strength"), pointerStrength);
    gl.uniform1f(u("u_time_scale"), timeScale);

    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: innerWidth * 0.5, y: innerHeight * 0.5, tx: innerWidth * 0.5, ty: innerHeight * 0.5 };
    const start = performance.now();
    let raf = 0;
    let last = 0;

    const resize = () => {
      // Below device resolution: smaller on phones, never above 1x.
      const scale = Math.min(devicePixelRatio || 1, 1) * (innerWidth < 768 ? 0.5 : 0.6);
      canvas.width = Math.floor(innerWidth * scale);
      canvas.height = Math.floor(innerHeight * scale);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(uRatio, canvas.width / canvas.height);
      if (still) draw(start + 4000);
    };
    const draw = (now: number) => {
      pointer.x += (pointer.tx - pointer.x) * 0.2;
      pointer.y += (pointer.ty - pointer.y) * 0.2;
      gl.uniform1f(uTime, now - start);
      gl.uniform2f(uPointer, pointer.x / innerWidth, 1 - pointer.y / innerHeight);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 32) return; // ~30 fps
      last = now;
      draw(now);
    };
    // Full strength in the hero, easing down to a calmer level for the rest of the page
    // (calmer still on the light theme, where bright strands compete more with grey body text).
    const root = document.documentElement;
    const onScroll = () => {
      const rest = root.classList.contains("dark") ? restOpacity : restOpacity * 0.7;
      const k = Math.min(1, scrollY / (innerHeight * 0.85));
      canvas.style.opacity = String(opacity + (rest - opacity) * k);
    };
    const themeWatch = new MutationObserver(onScroll);
    themeWatch.observe(root, { attributes: true, attributeFilter: ["class"] });
    const setTarget = (x: number, y: number) => ((pointer.tx = x), (pointer.ty = y));
    const onPointer = (e: PointerEvent) => setTarget(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => e.targetTouches[0] && setTarget(e.targetTouches[0].clientX, e.targetTouches[0].clientY);

    addEventListener("resize", resize);
    addEventListener("pointermove", onPointer);
    addEventListener("touchmove", onTouch, { passive: true });
    addEventListener("scroll", onScroll, { passive: true });
    resize();
    onScroll();
    if (still) draw(start + 4000);
    else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      themeWatch.disconnect();
      removeEventListener("resize", resize);
      removeEventListener("pointermove", onPointer);
      removeEventListener("touchmove", onTouch);
      removeEventListener("scroll", onScroll);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [opacity, restOpacity, pointerStrength, timeScale]);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 -z-10 h-full w-full" style={{ opacity }} />;
}
