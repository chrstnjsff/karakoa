// Hero film: one slide at a time. The current slide's story bar runs a CSS
// animation as long as the slide (--slide-ms); its animationend moves the
// film on, so pausing that animation also stops the clock. The film holds
// still while the reader pauses it, while it is offscreen, and while the
// tab is hidden. Reduced motion starts it paused.
type Hold = "user" | "offscreen" | "hidden";

type FullscreenDoc = Document & {
  webkitFullscreenEnabled?: boolean;
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => void;
};
type FullscreenEl = HTMLElement & { webkitRequestFullscreen?: () => void };

const root = document.querySelector<HTMLElement>("[data-film]");
if (root) start(root);

function start(film: HTMLElement) {
  const slides = Array.from(film.querySelectorAll<HTMLElement>("[data-slide]"));
  const segs = Array.from(film.querySelectorAll<HTMLButtonElement>("[data-seg]"));
  const stage = film.querySelector<HTMLElement>("[data-stage]");
  const controls = film.querySelector<HTMLElement>("[data-controls]");
  const toggle = film.querySelector<HTMLButtonElement>("[data-toggle]");
  const full = film.querySelector<HTMLButtonElement>("[data-full]");
  if (!stage || !controls || !toggle || !full || slides.length === 0) return;

  const holds = new Set<Hold>();
  let current = 0;
  let leavingTimer = 0;

  // Re-adding an attribute after a reflow restarts the CSS animations it keys.
  const restart = (el: HTMLElement, name: string, value = "") => {
    el.removeAttribute(name);
    void el.offsetWidth;
    el.setAttribute(name, value);
  };

  const setLength = () => film.style.setProperty("--slide-ms", `${slides[current].dataset.ms ?? 4000}ms`);

  function show(index: number) {
    const next = (index + slides.length) % slides.length;
    if (next !== current) {
      const prev = slides[current];
      prev.removeAttribute("data-active");
      // Keep its animations at their end state while it fades out.
      prev.setAttribute("data-leaving", "");
      prev.inert = true;
      window.clearTimeout(leavingTimer);
      leavingTimer = window.setTimeout(() => slides.forEach((s) => s.removeAttribute("data-leaving")), 400);
    }
    current = next;
    const slide = slides[current];
    slide.removeAttribute("data-leaving");
    slide.inert = false;
    restart(slide, "data-active");
    setLength();
    segs.forEach((seg, i) => {
      if (i === current) {
        restart(seg, "data-state", "now");
        seg.setAttribute("aria-current", "step");
      } else {
        seg.dataset.state = i < current ? "done" : "next";
        seg.removeAttribute("aria-current");
      }
    });
  }

  function hold(reason: Hold, on: boolean) {
    if (on) holds.add(reason);
    else holds.delete(reason);
    film.toggleAttribute("data-paused", holds.size > 0);
    const paused = holds.has("user");
    toggle!.toggleAttribute("data-playing", !paused);
    toggle!.setAttribute("aria-label", paused ? "Play slides" : "Pause slides");
    // Announce slide changes only when the reader is driving.
    stage!.setAttribute("aria-live", paused ? "polite" : "off");
  }

  // The first slide has been animating since first paint; leave it be.
  slides.forEach((s, i) => (s.inert = i !== 0));
  setLength();
  controls.hidden = false;

  film.addEventListener("animationend", (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains("fill") && target.closest("[data-seg]")?.getAttribute("data-state") === "now") {
      show(current + 1);
    }
  });

  segs.forEach((seg, i) => seg.addEventListener("click", () => show(i)));
  toggle.addEventListener("click", () => hold("user", !holds.has("user")));

  film.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") show(current + 1);
    else if (e.key === "ArrowLeft") show(current - 1);
    else return;
    e.preventDefault();
  });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) hold("user", true);

  new IntersectionObserver(([entry]) => hold("offscreen", !entry.isIntersecting), { threshold: 0.25 }).observe(film);
  document.addEventListener("visibilitychange", () => hold("hidden", document.hidden));
  hold("hidden", document.hidden);

  // Full screen where the browser allows it on an element (not iPhone Safari).
  const doc = document as FullscreenDoc;
  const el = film as FullscreenEl;
  if (document.fullscreenEnabled || doc.webkitFullscreenEnabled) {
    full.hidden = false;
    const isFull = () => (document.fullscreenElement ?? doc.webkitFullscreenElement) === film;
    full.addEventListener("click", () => {
      if (isFull()) {
        if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
        else doc.webkitExitFullscreen?.();
      } else if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
      else el.webkitRequestFullscreen?.();
    });
    const sync = () => {
      full.toggleAttribute("data-on", isFull());
      full.setAttribute("aria-label", isFull() ? "Exit full screen" : "Show slides full screen");
    };
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
  }
}
