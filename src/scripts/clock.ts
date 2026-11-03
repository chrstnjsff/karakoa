// Both lines read the clock in Asia/Manila, whatever the visitor's time zone.
// The server-rendered text stays as the fallback.

const ZONE = "Asia/Manila";
// Posted call hours: Monday to Friday, 2 PM to 9 PM Manila time.
const OPEN = 14;
const CLOSE = 21;

const timeFormat = new Intl.DateTimeFormat("en-US", { timeZone: ZONE, hour: "numeric", minute: "2-digit" });
const partsFormat = new Intl.DateTimeFormat("en-US", { timeZone: ZONE, weekday: "short", hour: "numeric", hourCycle: "h23" });
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function manila(now: Date) {
  const parts = Object.fromEntries(partsFormat.formatToParts(now).map((p) => [p.type, p.value]));
  return { day: DAYS.indexOf(parts.weekday), hour: Number(parts.hour) };
}

function availability(now: Date): { open: boolean; text: string } {
  const { day, hour } = manila(now);
  const weekday = day >= 1 && day <= 5;
  if (weekday && hour >= OPEN && hour < CLOSE) return { open: true, text: "Taking calls now, until 9 PM Manila time" };
  if (weekday && hour < OPEN) return { open: false, text: "Calls open today at 2 PM Manila time" };
  if (day >= 1 && day <= 4) return { open: false, text: "Calls open tomorrow at 2 PM Manila time" };
  return { open: false, text: "Calls open Monday at 2 PM Manila time" };
}

const clocks = document.querySelectorAll<HTMLElement>("[data-clock]");
const avail = document.querySelector<HTMLElement>("[data-avail]");
const availDot = document.querySelector<HTMLElement>("[data-avail-dot]");

function render() {
  const now = new Date();
  const time = `Manila ${timeFormat.format(now)}`;
  clocks.forEach((el) => (el.textContent = time));
  if (avail && availDot) {
    const state = availability(now);
    avail.textContent = state.text;
    availDot.classList.toggle("is-open", state.open);
  }
}

// Tick on the minute, and catch up at once when the tab comes back.
let timer: number | undefined;
function schedule() {
  window.clearTimeout(timer);
  render();
  timer = window.setTimeout(schedule, 60_000 - (Date.now() % 60_000) + 50);
}

if (clocks.length || avail) {
  schedule();
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) window.clearTimeout(timer);
    else schedule();
  });
}
