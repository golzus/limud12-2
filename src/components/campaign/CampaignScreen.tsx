import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import logo from "@/assets/logo.webp.asset.json";
import yagdil from "@/assets/yagdil.webp.asset.json";
import maagalim from "@/assets/maagalim.webp.asset.json";
import bg from "@/assets/bg.webp.asset.json";
import studyHall from "@/assets/study-hall.jpg";
import { useCampaign } from "@/lib/campaign/use-campaign";
import {
  GROUPS,
  joinedOf,
  percentOf,
  type BeitMidrash,
  type CampaignSource,
  type GroupId,
  type Joiner,
} from "@/lib/campaign/types";

const GROUP_BG: Record<GroupId, string> = {
  connected: "bg-cmp-lemon",
  linked: "bg-cmp-cream",
  eternal: "bg-cmp-gold",
};
const GROUP_TEXT: Record<GroupId, string> = {
  connected: "text-cmp-lemon",
  linked: "text-cmp-cream",
  eternal: "text-cmp-gold",
};
const groupName = (g: GroupId) => GROUPS.find((x) => x.id === g)!.name;

/* ---------- helpers ---------- */

/** Scales the design to fit, then stretches the canvas so it fills the whole screen (no empty margins). */
function useScale(w: number, h: number) {
  const [fit, setFit] = useState({ scale: 1, w, h });
  useEffect(() => {
    const update = () => {
      const s = Math.min(window.innerWidth / w, window.innerHeight / h);
      setFit({ scale: s, w: window.innerWidth / s, h: window.innerHeight / s });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [w, h]);
  return fit;
}

function useCountUp(value: number, ms = 900) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      const v = Math.round(a + (value - a) * (1 - Math.pow(1 - p, 3)));
      setShown(v);
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);
  return shown;
}

function BookIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round">
      <path d="M32 14c-8-5-18-6-28-4v24c10-2 20-1 28 4 8-5 18-6 28-4V10c-10-2-20-1-28 4Z" fill="currentColor" fillOpacity=".12" />
      <path d="M32 14v24" />
      <path d="M8 16c7-1 15 0 20 3M8 22c7-1 15 0 20 3M56 16c-7-1-15 0-20 3M56 22c-7-1-15 0-20 3" strokeWidth="1.6" />
      <path d="M32 12V4M32 6c-3-3-6-2-7 0 2 2 5 2 7 0Zm0 0c3-3 6-2 7 0-2 2-5 2-7 0Z" strokeWidth="1.8" />
    </svg>
  );
}

/* ---------- sections ---------- */

function GroupCard({ group, accent }: { group: (typeof GROUPS)[number]; accent: string }) {
  return (
    <div className="relative flex min-h-[216px] flex-1 flex-col rounded-2xl border border-cmp-line bg-cmp-panel px-7 pt-5">
      <div className="text-[17px] text-cmp-cream/70">קבוצת</div>
      <div className="mt-1 flex items-center justify-between">
        <div className={`text-[44px] font-extrabold leading-none ${GROUP_TEXT[group.id]}`}>{group.name}</div>
        <BookIcon className="h-[42px] w-[96px] text-cmp-cream" />
      </div>
      <div className="mt-5 text-[19px] leading-snug text-cmp-cream">{group.description}</div>
      <div className="mt-auto pb-6 text-[16px] text-cmp-cream/70">{group.quote}</div>
      <div className={`absolute bottom-0 left-5 right-5 h-[3px] rounded-full ${accent}`} />
    </div>
  );
}

function Column({ b, cycle }: { b: BeitMidrash; cycle: number }) {
  const joined = joinedOf(b);
  const pct = percentOf(b);
  const order: GroupId[] = ["eternal", "linked", "connected"]; // top → bottom
  const [flash, setFlash] = useState(0);
  const prev = useRef(joined);
  useEffect(() => {
    if (joined !== prev.current) setFlash((f) => f + 1);
    prev.current = joined;
  }, [joined]);

  // Every cycle: drop the bar to zero, then let it rise slowly back up.
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    setGrown(false);
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setGrown(true)));
    return () => cancelAnimationFrame(raf);
  }, [cycle]);

  return (
    <div className="flex flex-1 flex-col items-center border-l border-cmp-line/60 last:border-l-0">
      <div className="text-[34px] font-bold text-cmp-cream">
        {pct}
        <span className="text-[18px] font-medium text-cmp-cream/80">%</span>
      </div>
      <div className="mt-3 flex min-h-[245px] w-[76px] flex-1 flex-col justify-end overflow-hidden rounded-t-md bg-cmp-track">
        <div key={flash} className={`cmp-bar-anim cmp-bar-grow cmp-breathe flex flex-col ${flash ? "cmp-pop" : ""}`} style={{ height: `${grown ? Math.min(100, pct) : 0}%`, animationDelay: `${(b.id.length + Number(b.id.replace(/\D/g, ""))) * -0.5}s` }}>
          {order.map((g) => (
            <div
              key={g}
              className={`cmp-bar-anim flex items-center justify-center overflow-hidden text-[22px] font-bold text-cmp-ink ${GROUP_BG[g]}`}
              style={{ height: `${joined ? (b.counts[g] / joined) * 100 : 0}%` }}
            >
              {b.counts[g]}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 text-center text-[19px] leading-6 text-cmp-cream">
        <div>{b.name.replace(/\s\S+$/, "")}</div>
        <div className="font-bold">{b.name.split(" ").pop()}</div>
      </div>
      <div className="mt-2 text-[40px] font-extrabold leading-none text-cmp-cream">{joined}</div>
      <div className="mt-2 text-[16px] text-cmp-cream/60">מתוך {b.total}</div>
    </div>
  );
}

function JoinerItem({ j, bmName }: { j: Joiner; bmName: string }) {
  return (
    <div className="flex h-full w-[306px] shrink-0 items-center gap-4 border-l border-cmp-line px-6">
      <BookIcon className="h-[24px] w-[44px] shrink-0 text-cmp-cream" />
      <div className="min-w-0">
        <div className="truncate text-[22px] font-bold text-cmp-cream">{j.name}</div>
        <div className="truncate text-[15px] text-cmp-cream/70">
          <span className={GROUP_TEXT[j.group]}>{groupName(j.group)}</span> · {bmName}
        </div>
      </div>
    </div>
  );
}

function JoinersTicker({ joiners, names }: { joiners: Joiner[]; names: Record<string, string> }) {
  const list = joiners.slice(0, 20);
  const duration = Math.max(30, list.length * 4);
  return (
    <div className="flex h-[84px] overflow-hidden rounded-2xl border border-cmp-line bg-cmp-panel">
      <div className="z-10 flex w-[256px] shrink-0 flex-col justify-center bg-cmp-lemon px-6 text-cmp-ink">
        <div className="text-[26px] font-extrabold leading-tight">מצטרפים לחיינו</div>
        <div className="text-[16px]">עוד חברותא. עוד חיים.</div>
      </div>
      <div className="relative flex-1 overflow-hidden" dir="rtl">
        <div className="cmp-marquee flex h-full w-max" style={{ ["--cmp-marquee-duration" as string]: `${duration}s` }}>
          {[...list, ...list].map((j, i) => (
            <JoinerItem key={`${j.id}-${i}`} j={j} bmName={names[j.beitMidrashId] ?? ""} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface Toast { joiner: Joiner; leaving: boolean }

function JoinToasts({ toasts, names }: { toasts: Toast[]; names: Record<string, string> }) {
  return (
    <div className="pointer-events-none absolute left-[48px] top-[600px] flex-col-reverse z-30 flex w-[330px] gap-3">
      {toasts.map(({ joiner: j, leaving }) => (
        <div
          key={j.id}
          className={`${leaving ? "cmp-toast-out" : "cmp-toast-in"} rounded-xl border-2 border-cmp-gold bg-cmp-deep-2/95 px-5 py-4 shadow-2xl`}
        >
          <div className="text-[14px] font-medium text-cmp-gold">הצטרף עכשיו! ✦</div>
          <div className="text-[26px] font-extrabold text-cmp-lemon">{j.name}</div>
          <div className="text-[16px] text-cmp-cream">
            {names[j.beitMidrashId]} · קבוצת <span className={GROUP_TEXT[j.group]}>{groupName(j.group)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- screen ---------- */

export function CampaignScreen({ source }: { source: CampaignSource }) {
  const { scale, w, h } = useScale(1920, 1080);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const onJoin = useCallback((joiner: Joiner) => {
    setToasts((t) => [...t, { joiner, leaving: false }].slice(-3));
    setTimeout(() => setToasts((t) => t.map((x) => (x.joiner.id === joiner.id ? { ...x, leaving: true } : x))), 3000);
    setTimeout(() => setToasts((t) => t.filter((x) => x.joiner.id !== joiner.id)), 3500);
  }, []);

  const state = useCampaign(source, onJoin);
  const total = useMemo(() => state?.batei.reduce((s, b) => s + joinedOf(b), 0) ?? 0, [state]);
  const shownTotal = useCountUp(total);
  const names = useMemo(() => Object.fromEntries((state?.batei ?? []).map((b) => [b.id, b.name])), [state]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-cmp-deep-2 font-cmp">
      <div
        dir="rtl"
        className="absolute left-0 top-0 origin-top-left overflow-hidden bg-cmp-deep bg-cover bg-center"
        style={{ width: w, height: h, transform: `scale(${scale})`, backgroundImage: `url(${bg.url})` }}
      >
        <div className="absolute inset-0 bg-cmp-deep/70" />
        <div className="relative flex h-full flex-col px-[48px] pb-[20px] pt-[28px]">
          {/* Header */}
          <div className="flex h-[280px] shrink-0 items-start gap-5">
            <div className="flex w-[350px] shrink-0 flex-col items-center">
              <img src={logo.url} alt="שבת חיינו" className="h-[240px] w-auto object-contain" />
              <div className="mt-1 text-[18px] text-cmp-cream">100% אנ״ש אשדוד למען חיינו</div>
            </div>
            <div className="flex flex-1 flex-col">
              <div className="flex flex-1 gap-5">
                <GroupCard group={GROUPS[0]!} accent="bg-cmp-lemon" />
                <GroupCard group={GROUPS[1]!} accent="bg-cmp-cream" />
                <GroupCard group={GROUPS[2]!} accent="bg-cmp-gold" />
              </div>
            </div>
            <div className="flex w-[330px] shrink-0 flex-col items-end pt-2 text-left" dir="rtl">
              <div className="mt-3 text-[110px] font-extrabold leading-none tracking-tight text-cmp-lemon" dir="ltr">
                {shownTotal.toLocaleString("en-US")}
              </div>
              <div className="mt-4 text-[26px] text-cmp-cream">אברכים כבר הצטרפו</div>
            </div>
          </div>

          <div className="mt-[14px] border-t border-cmp-line" />

          {/* Middle */}
          <div className="mt-[30px] flex min-h-[574px] flex-1 gap-[34px]">
            <div className="flex flex-1 flex-col rounded-3xl border border-cmp-line bg-cmp-panel px-8 pb-4 pt-5">
              <div className="flex items-center justify-center gap-7 border-b border-cmp-line pb-3 text-[16px] text-cmp-cream">
                {GROUPS.map((g) => (
                  <span key={g.id} className="flex items-center gap-2">
                    <span className={`h-[10px] w-[10px] rounded-sm ${GROUP_BG[g.id]}`} /> {g.name}
                  </span>
                ))}
              </div>
              <div className="flex flex-1 pt-4">
                {state?.batei.map((b) => <Column key={b.id} b={b} />)}
              </div>
            </div>

            <div className="flex w-[330px] shrink-0 flex-col">
              <div className="relative h-[424px] overflow-hidden rounded-2xl border-2 border-cmp-gold/60">
                <img src={studyHall} alt="בית מדרש" width={768} height={1024} className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-x-0 top-0 h-[60%] bg-gradient-to-b from-cmp-deep via-cmp-deep/70 to-transparent" />
                <div className="relative pt-6 text-center text-[42px] font-extrabold leading-[1.15] text-cmp-cream">
                  <div className="text-cmp-lemon">בוא והצטרף</div>
                  <div>ללגיונו</div>
                  <div>של מלך</div>
                </div>
              </div>
              <div className="mt-auto">
                <div className="border-b border-cmp-line pb-3 text-[16px] text-cmp-cream/70">בשותפות ובסיוע</div>
                <div className="flex items-center gap-5 pt-4">
                  <img src={maagalim.url} alt="מעגלים" className="h-[56px] w-auto" />
                  <img src={yagdil.url} alt="יגדיל תורה" className="h-[64px] w-auto" />
                </div>
              </div>
            </div>
          </div>

          {/* Ticker */}
          <div className="mt-[34px]">
            <JoinersTicker joiners={state?.joiners ?? []} names={names} />
          </div>

          <div className="mt-3 flex items-center justify-between gap-6 text-[13px] tracking-widest text-cmp-cream/50">
            <span>הדמיה בלבד · השמות והנתונים להמחשה</span>
            <span className="text-[14px] tracking-normal text-cmp-cream/80">
              להזמנות תוכנות נוספות — ג.ז. <span className="font-bold text-cmp-gold" dir="ltr">0504-199-417</span>
            </span>
            <span dir="ltr">CHAYENU / LIVE</span>
          </div>
        </div>

        <JoinToasts toasts={toasts} names={names} />
      </div>
    </div>
  );
}
