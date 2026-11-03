import { countUp, reduceMotion } from "./count";

const figures = document.querySelectorAll<HTMLElement>("[data-count-on-view]");

if (figures.length && !reduceMotion && "IntersectionObserver" in window) {
  figures.forEach((el) => (el.textContent = "0"));
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        countUp(e.target as HTMLElement, 1.6);
        io.unobserve(e.target);
      }),
    { rootMargin: "0px 0px -10% 0px" },
  );
  figures.forEach((el) => io.observe(el));
}
