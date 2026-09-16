import { Avatar } from "@/components/ui/Avatar";
import type { PresenceViewer } from "@/lib/types";

export function PresenceBar({ viewers }: { viewers: PresenceViewer[] }) {
  if (viewers.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400">Viewing now</span>
      <div className="flex -space-x-2">
        {viewers.map((viewer) => (
          <Avatar key={viewer.userId} fullName={viewer.fullName} />
        ))}
      </div>
    </div>
  );
}
