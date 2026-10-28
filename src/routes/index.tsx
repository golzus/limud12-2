import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CampaignScreen } from "@/components/campaign/CampaignScreen";
import { createMockSource } from "@/lib/campaign/mock-source";

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
  const [source] = useState(() => createMockSource());
  return <CampaignScreen source={source} />;
}
