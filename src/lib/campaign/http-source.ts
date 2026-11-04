import type { CampaignEvent, CampaignSource, CampaignState } from "./types";

/**
 * Live data source for the real system.
 *  - GET  {baseUrl}/state   → CampaignState JSON (initial load + resync)
 *  - GET  {baseUrl}/stream  → Server-Sent Events, each message = CampaignEvent JSON
 * If the stream is unavailable, falls back to polling /state every `pollMs`.
 * Reconnects automatically and resyncs when the screen comes back online.
 */
export function createHttpSource(baseUrl: string, pollMs = 5000): CampaignSource {
  const getState = async (): Promise<CampaignState> => {
    const r = await fetch(`${baseUrl}/state`, { cache: "no-store" });
    if (!r.ok) throw new Error(`state ${r.status}`);
    return r.json();
  };

  return {
    load: getState,
    subscribe(listener: (e: CampaignEvent) => void) {
      let es: EventSource | null = null;
      let poll: ReturnType<typeof setInterval> | null = null;
      let closed = false;

      const resync = () => getState().then((state) => !closed && listener({ type: "snapshot", state })).catch(() => {});
      const startPolling = () => {
        if (!poll) poll = setInterval(resync, pollMs);
      };

      if (typeof EventSource !== "undefined") {
        es = new EventSource(`${baseUrl}/stream`);
        es.onmessage = (m) => {
          try {
            listener(JSON.parse(m.data) as CampaignEvent);
          } catch {
            /* ignore malformed message */
          }
        };
        es.onopen = () => {
          if (poll) clearInterval(poll), (poll = null);
          resync(); // catch anything missed while disconnected
        };
        es.onerror = startPolling; // browser retries the stream by itself meanwhile
      } else startPolling();

      window.addEventListener("online", resync);
      return () => {
        closed = true;
        es?.close();
        if (poll) clearInterval(poll);
        window.removeEventListener("online", resync);
      };
    },
  };
}
