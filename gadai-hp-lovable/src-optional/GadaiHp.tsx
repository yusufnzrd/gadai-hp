// Optional: gives Lovable a clean /gadai-hp route (without ".html").
// 1. Save as src/pages/GadaiHp.tsx
// 2. In src/App.tsx add:  <Route path="/gadai-hp" element={<GadaiHp />} />
//    (import GadaiHp from "./pages/GadaiHp";)  Place it above the catch all "*" route.
// It hands over to public/gadai-hp.html, which does the A/B split.
import { useEffect } from "react";

export default function GadaiHp() {
  useEffect(() => {
    window.location.replace("/gadai-hp.html" + window.location.search + window.location.hash);
  }, []);
  return null;
}
