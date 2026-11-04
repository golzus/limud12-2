import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CampaignScreen } from "@/components/campaign/CampaignScreen";
import { createMockSource } from "@/lib/campaign/mock-source";
import { createHttpSource } from "@/lib/campaign/http-source";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "קמפיין חיינו · מסך בתי המדרש" },
      { name: "description", content: "מסך תצוגה חי של קמפיין שבת חיינו ב־12 בתי המדרש באשדוד." },
      { property: "og:title", content: "קמפיין חיינו · מסך בתי המדרש" },
      { property: "og:description", content: "התקדמות ההצטרפות בזמן אמת ב־12 בתי המדרש." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  // Swap for a live (Cloud realtime) source later — the screen stays the same.
  // Set VITE_CAMPAIGN_API (e.g. https://your-system/api/campaign) to use real data.
  const [source] = useState(() => {
    const api = import.meta.env["VITE_CAMPAIGN_API"] as string | undefined;
    return api ? createHttpSource(api) : createMockSource();
  });
  return <CampaignScreen source={source} />;
}
