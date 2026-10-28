export type GroupId = "connected" | "linked" | "eternal";

export interface GroupInfo {
  id: GroupId;
  name: string;
  description: string;
  quote: string;
}

export const GROUPS: GroupInfo[] = [
  { id: "connected", name: "מחוברים", description: "שעה קבועה · לימוד קבוע", quote: "”כי הם חיינו”" },
  { id: "linked", name: "מקושרים", description: "שעה קבועה · לימוד קבוע · חזרות", quote: "”עץ חיים היא למחזיקים בה”" },
  { id: "eternal", name: "חיי עולם", description: "שעה קבועה · לימוד קבוע · חזרות · בחינות", quote: "”ואתם הדבקים... חיים כלכם היום”" },
];

export type GroupCounts = Record<GroupId, number>;

export interface BeitMidrash {
  id: string;
  name: string;
  /** Total avreichim on the uploaded list */
  total: number;
  counts: GroupCounts;
}

export interface Joiner {
  id: string;
  name: string;
  beitMidrashId: string;
  group: GroupId;
  joinedAt: number;
}

export interface CampaignState {
  batei: BeitMidrash[];
  joiners: Joiner[]; // newest first
}

export type CampaignEvent = { type: "join"; joiner: Joiner };

/** Any data provider (mock, Lovable Cloud realtime, polling...) implements this. */
export interface CampaignSource {
  load(): Promise<CampaignState>;
  subscribe(listener: (event: CampaignEvent) => void): () => void;
}

export const joinedOf = (b: BeitMidrash) => b.counts.connected + b.counts.linked + b.counts.eternal;
export const percentOf = (b: BeitMidrash) => (b.total ? Math.round((joinedOf(b) / b.total) * 100) : 0);

export function applyEvent(state: CampaignState, event: CampaignEvent): CampaignState {
  if (event.type !== "join") return state;
  const { joiner } = event;
  if (state.joiners.some((j) => j.id === joiner.id)) return state;
  return {
    batei: state.batei.map((b) =>
      b.id === joiner.beitMidrashId
        ? { ...b, counts: { ...b.counts, [joiner.group]: b.counts[joiner.group] + 1 } }
        : b,
    ),
    joiners: [joiner, ...state.joiners].slice(0, 60),
  };
}
