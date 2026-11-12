// Mercury: the tuned chrome gradient from gradients.sh (registry item kX8nN9Jqdy), wired without React.
//
// `npx shadcn add https://gradients.sh/r/c/kX8nN9Jqdy.json` installs a React component
// (components/gradients/mercury.tsx) on top of gradient-surface.tsx and the gradient engine.
// Nara's pages are plain HTML, so this file does what those two React files do: it fills an
// element with a canvas, paints the engine's static fallback first, then mounts the live gradient.
// The parameters below are copied unchanged from mercury.tsx. The engine in ./gradient-engine is
// the registry's own source (MIT, see ./LICENSE).
//
// Built into public/gradient/ by scripts/build-gradient.mjs.
import { mountGradient, normalizeParams, staticFallbackCss } from "./gradient-engine";
import type { GradientParams, MountedGradient } from "./gradient-engine";

export const MERCURY: GradientParams = {
  kind: "chrome",
  background: "#020a09",
  blur: 0.24,
  colors: ["#183f35", "#00a691", "#cefdf6"],
  dither: { cell: 3, enabled: false, levels: 8 },
  grain: 0.03,
  interaction: { pointer: 0.15, scroll: 0.2 },
  loopSeconds: 29,
  scale: 0.67,
  seed: 28,
  speed: 0.36,
  warp: 0.3,
};

const PAUSE_KEY = "nara:gradient-paused";

/**
 * Fills `host` with the Mercury gradient. The canvas sits behind the host's children.
 * A `[data-gradient-toggle]` button inside the host pauses and resumes the motion
 * (WCAG 2.2.2: anything that moves longer than 5 seconds needs a pause control);
 * the choice is remembered for the next visit.
 */
export function mountMercury(host: HTMLElement): MountedGradient {
  const params = normalizeParams(MERCURY);
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.className = "gradient-canvas";
  canvas.style.background = staticFallbackCss(params);
  host.prepend(canvas);
  const live = mountGradient(canvas, params, { primary: true, reducedMotion: "respect" });

  const toggle = host.querySelector<HTMLButtonElement>("[data-gradient-toggle]");
  let paused = false;
  try { paused = localStorage.getItem(PAUSE_KEY) === "1"; } catch { /* storage blocked */ }
  const apply = () => {
    live.setPaused(paused);
    if (toggle) toggle.setAttribute("aria-pressed", String(paused));
    host.dataset.gradientPaused = String(paused);
  };
  toggle?.addEventListener("click", () => {
    paused = !paused;
    try { localStorage.setItem(PAUSE_KEY, paused ? "1" : "0"); } catch { /* storage blocked */ }
    apply();
  });
  apply();
  return live;
}

document.querySelectorAll<HTMLElement>('[data-gradient="mercury"]').forEach(mountMercury);
