// The element's server-rendered text is the final value, so nothing breaks
// without script.

export const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const frames = new WeakMap<Element, number>();

export function countUp(el: HTMLElement, seconds = 1.2) {
  const target = Number(el.dataset.count);
  const decimals = Number(el.dataset.decimals ?? 0);
  const format = (v: number) =>
    v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  cancelAnimationFrame(frames.get(el) ?? 0);
  if (reduceMotion) {
    el.textContent = format(target);
    return;
  }
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min((now - start) / (seconds * 1000), 1);
    el.textContent = format(target * (1 - (1 - t) ** 2));
    if (t < 1) frames.set(el, requestAnimationFrame(step));
  };
  el.textContent = format(0);
  frames.set(el, requestAnimationFrame(step));
}
