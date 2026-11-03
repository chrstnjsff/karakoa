// The section stays pinned for HOLD px of scroll while the boat sails the
// course. The boat eases toward the scroll position instead of jumping.
import { reduceMotion } from "./count";

const section = document.querySelector<HTMLElement>("[data-process]");
const chart = section?.querySelector<HTMLElement>("[data-chart]");
if (section && chart) init(section, chart);

function init(section: HTMLElement, chart: HTMLElement) {
  const pin = section.querySelector<HTMLElement>(".process-pin")!;
  const svg = chart.querySelector<SVGSVGElement>("svg")!;
  const route = chart.querySelector<SVGPathElement>("[data-route]")!;
  const boat = chart.querySelector<HTMLElement>("[data-boat]")!;
  const steps = Array.from(chart.querySelectorAll<HTMLElement>("[data-step]"));
  const HOLD = 1000; // px of scroll the section stays pinned for
  const LAG = 0.2; // smoothing time constant, seconds

  // Path geometry is read only once the chart is displayed (1024px and up);
  // some browsers refuse to measure a path that is not rendered.
  let total = 0;
  let waypoints: SVGCircleElement[] = [];
  function measure() {
    if (total) return;
    total = route.getTotalLength();
    waypoints = steps.map((_, i) => {
      const pt = route.getPointAtLength((total * i) / (steps.length - 1));
      const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      for (const [k, v] of Object.entries({ cx: pt.x, cy: pt.y, r: 5, "stroke-width": 1.5, stroke: "#0b2c44" })) {
        c.setAttribute(k, String(v));
      }
      chart.querySelector("[data-waypoints]")!.append(c);
      return c;
    });
  }

  function mark(i: number, on: boolean) {
    steps[i].classList.toggle("on", on);
    waypoints[i].setAttribute("fill", on ? "#d4421f" : "#f8f6f2");
    waypoints[i].setAttribute("stroke-opacity", on ? "0" : ".35");
  }

  function render(p: number) {
    measure();
    route.style.strokeDasharray = "1";
    route.style.strokeDashoffset = String(1 - p);
    const pt = route.getPointAtLength(total * p);
    const scale = svg.getBoundingClientRect().width / 1000;
    boat.style.transform = `translate(${pt.x * scale - boat.offsetWidth * 0.5}px, ${pt.y * scale - boat.offsetHeight * 0.82}px)`;
    boat.classList.remove("invisible");
    steps.forEach((_, i) => mark(i, p >= i / (steps.length - 1) - 0.02));
  }

  let target = 0;
  let value = 0;
  let last = 0;
  let frame = 0;

  const progress = () => Math.min(Math.max(-section.getBoundingClientRect().top / HOLD, 0), 1);

  function tick(now: number) {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    value += (target - value) * (1 - Math.exp(-dt / LAG));
    if (Math.abs(target - value) < 0.0005) value = target;
    render(value);
    frame = value === target ? 0 : requestAnimationFrame(tick);
  }

  function onScroll() {
    target = progress();
    if (!frame) {
      last = performance.now();
      frame = requestAnimationFrame(tick);
    }
  }

  function onResize() {
    section.style.height = `${pin.offsetHeight + HOLD}px`;
    render(value);
  }

  function enable() {
    section.setAttribute("data-pinned", "");
    onResize();
    value = target = progress();
    render(value);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
  }

  function disable() {
    section.removeAttribute("data-pinned");
    section.style.height = "";
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    cancelAnimationFrame(frame);
    frame = 0;
  }

  const desktop = window.matchMedia("(min-width: 1024px)");
  const finished = () => render(1);

  function setup() {
    if (!desktop.matches) {
      disable();
      window.removeEventListener("resize", finished);
    } else if (reduceMotion) {
      finished();
      window.addEventListener("resize", finished);
    } else {
      enable();
    }
  }

  desktop.addEventListener("change", setup);
  setup();
}
