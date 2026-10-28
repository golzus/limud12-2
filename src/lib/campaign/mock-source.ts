import type { BeitMidrash, CampaignEvent, CampaignSource, CampaignState, GroupId, Joiner } from "./types";

const LETTERS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ז׳", "ח׳", "ט׳", "י׳", "י״א", "י״ב"];
const SEED: [number, number, number, number][] = [
  [170, 36, 38, 42], [160, 28, 34, 38], [145, 24, 28, 30], [145, 28, 32, 46],
  [125, 20, 18, 24], [180, 48, 52, 58], [165, 30, 36, 40], [125, 14, 16, 22],
  [165, 32, 38, 45], [155, 26, 30, 34], [170, 40, 46, 52], [160, 32, 36, 41],
];
const FIRST = ["יעקב", "משה", "אברהם", "דוד", "שלום", "יוסף", "חיים", "שמואל", "אהרן", "מנחם", "ישראל", "נחום"];
const LAST = ["פרידמן", "לוי", "רוזן", "כהן", "ישראלי", "גולדברג", "וייס", "שטרן", "קליין", "ברגר", "הורוביץ"];
const GROUP_IDS: GroupId[] = ["connected", "linked", "eternal"];

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
let seq = 0;
const makeJoiner = (batei: BeitMidrash[]): Joiner => ({
  id: `mock-${Date.now()}-${seq++}`,
  name: `ר׳ ${pick(FIRST)} ${pick(LAST)}`,
  beitMidrashId: pick(batei).id,
  group: pick(GROUP_IDS),
  joinedAt: Date.now(),
});

/** Demo data source: emits a random new joiner every few seconds. */
export function createMockSource(intervalMs = 4500): CampaignSource {
  const batei: BeitMidrash[] = SEED.map(([total, connected, linked, eternal], i) => ({
    id: `bm-${i + 1}`,
    name: `בית המדרש ${LETTERS[i]}`,
    total,
    counts: { connected, linked, eternal },
  }));
  const initial: CampaignState = {
    batei,
    joiners: Array.from({ length: 12 }, () => makeJoiner(batei)),
  };

  return {
    load: async () => initial,
    subscribe(listener: (e: CampaignEvent) => void) {
      const t = setInterval(() => {
        const joiner = makeJoiner(batei);
        listener({ type: "join", joiner });
      }, intervalMs);
      return () => clearInterval(t);
    },
  };
}
