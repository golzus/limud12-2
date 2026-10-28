import { useEffect, useRef, useState } from "react";
import { applyEvent, type CampaignSource, type CampaignState, type Joiner } from "./types";

/**
 * Subscribes to a CampaignSource and keeps live state without page refresh.
 * `onJoin` fires for every live join (used for the popup notifications).
 */
export function useCampaign(source: CampaignSource, onJoin?: (j: Joiner) => void) {
  const [state, setState] = useState<CampaignState | null>(null);
  const onJoinRef = useRef(onJoin);
  onJoinRef.current = onJoin;

  useEffect(() => {
    let alive = true;
    const pending: Parameters<typeof applyEvent>[1][] = [];
    let loaded = false;
    const unsub = source.subscribe((e) => {
      if (!loaded) return void pending.push(e);
      setState((s) => (s ? applyEvent(s, e) : s));
      if (e.type === "join") onJoinRef.current?.(e.joiner);
    });
    source.load().then((initial) => {
      if (!alive) return;
      loaded = true;
      setState(pending.reduce(applyEvent, initial));
    });
    return () => {
      alive = false;
      unsub();
    };
  }, [source]);

  return state;
}
