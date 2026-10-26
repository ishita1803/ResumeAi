import { AlertTriangle } from "lucide-react";

/** Visible flag that Gemini was unavailable and the built-in engine answered instead. */
export function AiNotice({ children = "AI is unavailable right now — showing built-in results instead." }: { children?: React.ReactNode }) {
  return (
    <div role="status" className="flex items-start gap-2 rounded-[10px] px-3 py-2 text-[12.5px] font-medium" style={{ background: "#FFF4E0", color: "#8A5300" }}>
      <AlertTriangle size={14} className="mt-0.5 shrink-0" />
      <span className="min-w-0 break-words">{children}</span>
    </div>
  );
}
