// Keyframes for the work screens, generated at build time and emitted in the
// page head by Base.astro. Every part loops over its card's --c, so a card
// stays in step. All names and numbers are sample data.
import { rng } from "./rng";

let css = "";
const names = new Map<string, string>();

function keyframes(frames: string): string {
  let name = names.get(frames);
  if (!name) {
    name = `wk${names.size}`;
    names.set(frames, name);
    css += `@keyframes ${name}{${frames}}\n`;
  }
  return name;
}

/** A label that swaps instantly at each keyframe. */
const swap = (frames: string) => `animation:${keyframes(frames)} var(--c) steps(1,end) infinite`;
/** A part that eases between keyframes. */
const move = (frames: string) => `animation:${keyframes(frames)} var(--c) ease-in-out infinite`;

/** Waits as a ring, spins, then ticks; rs to re is when the loop resets. */
function stepIcon(s: number, e: number, rs: number, re: number) {
  return {
    ring: swap(`0%,${s}%{opacity:1} ${s + 0.5}%,${rs}%{opacity:0} ${re}%,100%{opacity:1}`),
    spin: swap(`0%,${s}%{opacity:0} ${s + 0.5}%,${e}%{opacity:1} ${e + 0.5}%,100%{opacity:0}`),
    ok: move(`0%,${e}%{opacity:0;transform:scale(.6)} ${e + 2}%{opacity:1;transform:scale(1.15)} ${e + 4}%,${rs}%{opacity:1;transform:none} ${re}%,100%{opacity:0}`),
  };
}

/* A. home care: an open visit is assigned, then a packet goes sent, viewed, signed */
export const care = {
  open: swap("0%,22%{opacity:1} 26%,93%{opacity:0} 97%,100%{opacity:1}"),
  covered: swap("0%,22%{opacity:0} 26%,93%{opacity:1} 97%,100%{opacity:0}"),
  chip: move(
    "0%,9%{opacity:1;transform:none} 13%{opacity:1;transform:scale(1.05)} 22%{opacity:0;transform:translateY(30px) scale(.9)} 93%{opacity:0;transform:none} 97%,100%{opacity:1;transform:none}",
  ),
  row: move("0%,22%{background:transparent} 27%{background:rgba(241,90,60,.09)} 42%,100%{background:transparent}"),
  newShift: move("0%,18%{opacity:0;transform:scaleX(.5)} 26%,93%{opacity:1;transform:none} 97%,100%{opacity:0;transform:none}"),
  sent: swap("0%,38%{opacity:1} 41%,93%{opacity:0} 97%,100%{opacity:1}"),
  viewed: swap("0%,38%{opacity:0} 41%,55%{opacity:1} 58%,100%{opacity:0}"),
  signed: move("0%,55%{opacity:0;transform:scale(.85)} 59%{opacity:1;transform:scale(1.08)} 62%,93%{opacity:1;transform:none} 97%,100%{opacity:0}"),
};

/* B. workforce: one person goes idle, another comes back from away */
// Screens are abstract shapes: [left %, top px, width %, height px].
const SCREENS: Record<string, [number, number, number, number][]> = {
  doc: [[8, 6, 50, 3], [8, 13, 80, 2], [8, 18, 74, 2], [8, 23, 78, 2], [8, 28, 60, 2]],
  sheet: [[6, 6, 26, 4], [37, 6, 26, 4], [68, 6, 26, 4], [6, 14, 26, 3], [37, 14, 26, 3], [68, 14, 26, 3], [6, 21, 26, 3], [37, 21, 26, 3], [68, 21, 26, 3], [6, 28, 26, 3], [37, 28, 26, 3]],
  code: [[8, 6, 30, 2], [14, 11, 50, 2], [14, 16, 40, 2], [20, 21, 46, 2], [14, 26, 30, 2], [8, 31, 20, 2]],
  mail: [[6, 5, 8, 6], [18, 7, 60, 2], [6, 15, 8, 6], [18, 17, 50, 2], [6, 25, 8, 6], [18, 27, 64, 2]],
  chart: [[10, 24, 8, 12], [24, 18, 8, 18], [38, 26, 8, 10], [52, 12, 8, 24], [66, 20, 8, 16], [80, 8, 8, 28]],
  doc2: [[8, 6, 36, 5], [8, 15, 84, 2], [8, 20, 80, 2], [8, 25, 40, 2], [56, 26, 36, 9]],
};
const shapes = (k: string) => SCREENS[k].map(([x, y, w, h]) => `left:${x}%;top:${y}px;width:${w}%;height:${h}px`);

export const team = {
  counts: [
    { on: 9, idle: 2, away: 1, a: swap("0%,28%{opacity:1} 31%,95%{opacity:0} 98%,100%{opacity:1}"), hidden: true },
    { on: 8, idle: 3, away: 1, a: swap("0%,28%{opacity:0} 31%,64%{opacity:1} 67%,100%{opacity:0}"), hidden: true },
    { on: 9, idle: 3, away: 0, a: swap("0%,64%{opacity:0} 67%,95%{opacity:1} 98%,100%{opacity:0}"), hidden: false },
  ],
  people: [
    { name: "Kai L.", shapes: shapes("doc") },
    { name: "Rosa M.", shapes: shapes("sheet") },
    {
      name: "Ben T.",
      shapes: shapes("code"),
      goesIdle: {
        tile: move("0%,28%{box-shadow:0 0 0 0 rgba(227,167,91,0)} 31%{box-shadow:0 0 0 1.5px rgba(227,167,91,.85)} 45%,100%{box-shadow:0 0 0 0 rgba(227,167,91,0)}"),
        screen: move("0%,28%{opacity:1} 31%,95%{opacity:.35} 98%,100%{opacity:1}"),
        active: swap("0%,28%{opacity:1} 31%,95%{opacity:0} 98%,100%{opacity:1}"),
        idle: swap("0%,28%{opacity:0} 31%,95%{opacity:1} 98%,100%{opacity:0}"),
      },
    },
    { name: "Ivy C.", shapes: shapes("mail") },
    {
      name: "Leo P.",
      shapes: shapes("chart"),
      comesBack: {
        tile: move("0%,64%{box-shadow:0 0 0 0 rgba(60,196,191,0)} 67%{box-shadow:0 0 0 1.5px rgba(60,196,191,.85)} 80%,100%{box-shadow:0 0 0 0 rgba(60,196,191,0)}"),
        screen: move("0%,64%{opacity:.1} 67%,95%{opacity:1} 98%,100%{opacity:.1}"),
        awayLabel: move("0%,64%{opacity:1} 67%,95%{opacity:0} 98%,100%{opacity:1}"),
        away: swap("0%,64%{opacity:1} 67%,95%{opacity:0} 98%,100%{opacity:1}"),
        active: swap("0%,64%{opacity:0} 67%,95%{opacity:1} 98%,100%{opacity:0}"),
      },
    },
    { name: "Noor A.", shapes: shapes("doc2") },
  ],
  // 5-second activity heartbeats, drawn twice so the strip loops without a seam
  beats: (() => {
    const r = rng(3);
    return Array.from({ length: 44 }, (_, i) => {
      const low = i % 13 === 7;
      return { h: (low ? 18 : 35 + r() * 65).toFixed(0), low };
    });
  })(),
};

/* C. spend: cost per product and top costs switch from cloud to software */
const CLOUD = "0%,47%{opacity:1} 51%,91%{opacity:0} 95%,100%{opacity:1}";
const SOFTWARE = "0%,47%{opacity:0} 51%,91%{opacity:1} 95%,100%{opacity:0}";
export const spend = {
  toggle: move("0%,46%{transform:none} 52%,90%{transform:translateX(100%)} 96%,100%{transform:none}"),
  cloud: swap(CLOUD),
  software: swap(SOFTWARE),
  meter: move(
    "0%{transform:scaleX(0);background:#0b2c44} 12%,46%{transform:scaleX(.74);background:#0b2c44} 54%,88%{transform:scaleX(.58);background:#d4421f} 95%,100%{transform:scaleX(0);background:#0b2c44}",
  ),
  bars: (
    [
      ["Portal", 0.82, 0.45],
      ["Mobile", 0.56, 0.3],
      ["Data", 0.95, 0.22],
      ["Admin", 0.34, 0.72],
    ] as const
  ).map(([name, a, b], i) => ({
    name,
    rest: `transform:scaleY(${a})`,
    a: move(
      `0%,${i * 2}%{transform:scaleY(0);background:#0b2c44} ${10 + i * 2}%,46%{transform:scaleY(${a});background:#0b2c44} 54%,88%{transform:scaleY(${b});background:#d4421f} 95%,100%{transform:scaleY(0);background:#0b2c44}`,
    ),
  })),
  top: (
    [
      ["Compute", "$7,900", 1, "Design tools", "$2,400", 1],
      ["Database", "$4,800", 0.61, "CI minutes", "$1,700", 0.71],
      ["Storage", "$2,100", 0.27, "Team chat", "$1,100", 0.46],
    ] as const
  ).map(([cloudName, cloudCost, cloudShare, softName, softCost, softShare]) => ({
    cloudName,
    cloudCost,
    softName,
    softCost,
    rest: `transform:scaleX(${cloudShare})`,
    bar: move(`0%{transform:scaleX(0)} 12%,46%{transform:scaleX(${cloudShare})} 54%,88%{transform:scaleX(${softShare})} 95%,100%{transform:scaleX(0)}`),
  })),
};

/* D. status: a check sweeps the services, one dips and recovers, delivery moves on */
const DEGRADED_OFF = "0%,30%{opacity:1} 33%,58%{opacity:0} 61%,100%{opacity:1}";
const DEGRADED_ON = "0%,30%{opacity:0} 33%,58%{opacity:1} 61%,100%{opacity:0}";
export const status = {
  ok: swap(DEGRADED_OFF),
  degraded: swap(DEGRADED_ON),
  checked: swap("0%,5%{opacity:1} 6%,16%{opacity:0} 17%,59%{opacity:1} 60%,70%{opacity:0} 71%,100%{opacity:1}"),
  checking: swap("0%,5%{opacity:0} 6%,16%{opacity:1} 17%,59%{opacity:0} 60%,70%{opacity:1} 71%,100%{opacity:0}"),
  scan: move(
    "0%,5%{opacity:0;transform:translateY(0)} 6%{opacity:1;transform:translateY(0)} 16%{opacity:1;transform:translateY(60px)} 17%,59%{opacity:0;transform:translateY(60px)} 59.5%{opacity:0;transform:translateY(0)} 60%{opacity:1;transform:translateY(0)} 70%{opacity:1;transform:translateY(60px)} 71%,100%{opacity:0;transform:translateY(60px)}",
  ),
  // 30 days of checks per service; one bad day where noted
  rows: (
    [
      ["Client portal", "99.99%"],
      ["Booking API", "99.97%", 12],
      ["Admin site", "99.99%"],
      ["Public website", "99.95%", 19],
    ] as const
  ).map(([name, pct, bad], row) => ({
    name,
    pct,
    live: row === 1,
    ticks: Array.from({ length: 30 }, (_, i) => {
      if (row === 1 && i === 29) return { a: move("0%,30%{background:#3cc4bf} 33%,58%{background:#e3a75b} 61%,100%{background:#3cc4bf}") };
      if (i === bad) return { bg: row === 3 ? "#f15a3c" : "#e3a75b" };
      if (row === 3 && bad !== undefined && i === bad + 1) return { bg: "#e3a75b" };
      return {};
    }),
  })),
  progress: move("0%,78%{transform:scaleX(.68)} 86%,95%{transform:scaleX(.76)} 99%,100%{transform:scaleX(.68)}"),
  before: swap("0%,80%{opacity:1} 83%,95%{opacity:0} 99%,100%{opacity:1}"),
  after: swap("0%,80%{opacity:0} 83%,95%{opacity:1} 99%,100%{opacity:0}"),
  inQa: swap("0%,84%{opacity:1} 87%,95%{opacity:0} 99%,100%{opacity:1}"),
  released: move("0%,84%{opacity:0;transform:scale(.85)} 88%{opacity:1;transform:scale(1.08)} 90%,95%{opacity:1;transform:none} 99%,100%{opacity:0}"),
};

/* E. catalog: a template is picked and requested, then checked, planned, provisioned, deployed */
export const catalog = {
  picked: move("0%,6%{border-color:#ece7df;background:#fff} 10%,93%{border-color:#d4421f;background:#fff6f3} 97%,100%{border-color:#ece7df;background:#fff}"),
  prompt: swap("0%,8%{opacity:1} 11%,93%{opacity:0} 97%,100%{opacity:1}"),
  chosen: swap("0%,8%{opacity:0} 11%,93%{opacity:1} 97%,100%{opacity:0}"),
  name: move("0%,9%{opacity:0} 13%,93%{opacity:1} 97%,100%{opacity:0}"),
  press: move("0%,15%{transform:none;background:#d4421f} 17%{transform:scale(.94);background:#b9381a} 19%,100%{transform:none;background:#d4421f}"),
  steps: (
    [
      ["Template checked", 19, 26],
      ["Plan approved", 26, 35],
      ["Provisioning", 35, 50],
      ["Deployed", 50, 58],
    ] as const
  ).map(([label, s, e]) => ({
    label,
    icon: stepIcon(s, e, 93, 97),
    text: move(`0%,${s}%{color:#5f6b75} ${s + 0.5}%,93%{color:#0b2c44} 97%,100%{color:#5f6b75}`),
  })),
  live: move("0%,58%{opacity:0;transform:translateY(4px)} 62%,93%{opacity:1;transform:none} 97%,100%{opacity:0}"),
};

/* F. gitops: build, test, scan, staging, prod; the cluster syncs and stays healthy */
const ROLL_ON = "0%,40%{opacity:0} 42%,47%{opacity:1} 49%,100%{opacity:0}";
const ROLL_OFF = "0%,40%{opacity:1} 42%,47%{opacity:0} 49%,100%{opacity:1}";
export const gitops = {
  outOfSync: swap("0%,27%{opacity:1} 29%,95%{opacity:0} 98%,100%{opacity:1}"),
  syncing: swap("0%,27%{opacity:0} 29%,47%{opacity:1} 49%,100%{opacity:0}"),
  synced: swap("0%,47%{opacity:0} 49%,95%{opacity:1} 98%,100%{opacity:0}"),
  stages: (
    [
      ["Build", 4, 12],
      ["Test", 12, 20],
      ["Scan", 20, 28],
      ["Staging", 28, 38],
      ["Prod", 38, 47],
    ] as const
  ).map(([label, s, e]) => ({
    label,
    icon: stepIcon(s, e, 95, 98),
    link: move(`0%,${e}%{transform:scaleX(0)} ${e + 3}%,95%{transform:scaleX(1)} 98%,100%{transform:scaleX(0)}`),
  })),
  rolling: swap(ROLL_ON),
  steady: swap(ROLL_OFF),
  // request rate: two identical halves so the line scrolls forever
  chart: (() => {
    const r = rng(11);
    const half: number[] = Array.from({ length: 20 }, (_, i) => 30 - Math.sin(i / 3.2) * 9 - r() * 8);
    half.push(half[0]);
    const pts = [...half, ...half.slice(1)].map((y, i) => [i * 10, y] as const);
    const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y.toFixed(1)}`).join(" ");
    return { line, area: `${line} L400 60 L0 60 Z` };
  })(),
};

/** Every keyframe the screens use, for the page head. */
export const workKeyframes = css;
