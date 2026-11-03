// WAI-ARIA tabs. Auto-advance pauses under the pointer, keyboard focus, or
// off screen, and stops for good once the visitor picks a tab (WCAG 2.2.2).
import { countUp, reduceMotion } from "./count";

const root = document.querySelector<HTMLElement>("[data-hero-root]");

if (root) {
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-tab]"));
  const panels = Array.from(root.querySelectorAll<HTMLElement>("[data-panel]"));
  const url = root.querySelector<HTMLElement>("[data-window] [data-url]");
  const win = root.querySelector<HTMLElement>("[data-window]")!;
  const tablist = root.querySelector<HTMLElement>("[role=tablist]")!;
  let current = 0;

  // Stagger index per kind of moving part, within each panel.
  for (const panel of panels) {
    for (const kind of ["data-in", "data-grow", "data-bar", "data-check"]) {
      panel.querySelectorAll<HTMLElement>(`[${kind}]`).forEach((el, i) => el.style.setProperty("--n", String(i)));
    }
  }

  function play(panel: HTMLElement) {
    // Restart the CSS intro: drop the class, flush styles, add it back.
    panel.classList.remove("play");
    void panel.offsetWidth;
    panel.classList.add("play");
    panel.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => countUp(el));
    if (!reduceMotion) panel.querySelectorAll<SVGAnimationElement>("[data-rider]").forEach((a) => a.beginElement());
  }

  function show(n: number) {
    if (n === current) return;
    const prev = panels[current];
    current = n;
    tabs.forEach((t, i) => {
      const on = i === n;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
    });
    if (url) url.textContent = tabs[n].dataset.url ?? "";

    prev.classList.remove("is-active");
    prev.classList.add("is-leaving");
    window.setTimeout(() => prev.classList.remove("is-leaving"), 300);
    panels[n].classList.add("is-active");
    play(panels[n]);
  }

  // The selected tab's bar fills over 7 seconds; its end moves to the next tab.
  const stopAuto = () => root.removeAttribute("data-auto");
  if (!reduceMotion) {
    root.setAttribute("data-auto", "");
    tabs.forEach((t, i) =>
      t.querySelector(".bar")?.addEventListener("animationend", () => {
        if (root.hasAttribute("data-auto") && i === current) show((current + 1) % tabs.length);
      }),
    );

    const holds = new Set<string>();
    const hold = (why: string, on: boolean) => {
      if (on) holds.add(why);
      else holds.delete(why);
      root.toggleAttribute("data-paused", holds.size > 0);
    };
    for (const [name, el] of [["window", win], ["tabs", tablist]] as const) {
      el.addEventListener("pointerenter", () => hold(name, true));
      el.addEventListener("pointerleave", () => hold(name, false));
    }
    tablist.addEventListener("focusin", () => hold("focus", true));
    tablist.addEventListener("focusout", () => hold("focus", false));
    new IntersectionObserver(([e]) => hold("offscreen", !e.isIntersecting), { threshold: 0.2 }).observe(win);
  }

  tabs.forEach((t, i) => {
    t.addEventListener("click", () => {
      stopAuto();
      show(i);
    });
    t.addEventListener("keydown", (e) => {
      const last = tabs.length - 1;
      const next =
        e.key === "ArrowRight" ? (i === last ? 0 : i + 1)
        : e.key === "ArrowLeft" ? (i === 0 ? last : i - 1)
        : e.key === "Home" ? 0
        : e.key === "End" ? last
        : -1;
      if (next < 0) return;
      e.preventDefault();
      stopAuto();
      show(next);
      tabs[next].focus();
    });
  });

  play(panels[0]);
}
