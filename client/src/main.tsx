import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initAnalytics } from "./lib/analytics";

// Initialize analytics (safe no-ops if env vars not set)
const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
const fbPixelId = import.meta.env.VITE_FB_PIXEL_ID as string | undefined;
initAnalytics({ gaId, fbPixelId, debug: import.meta.env.DEV });

createRoot(document.getElementById("root")!).render(<App />);
