import { Loader2 } from "lucide-react";

export function LoaderOverlay({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(255,255,255,0.4)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      pointerEvents: "none"
    }}>
      <Loader2 className="animate-spin" size={48} color="#333" />
    </div>
  );
} 