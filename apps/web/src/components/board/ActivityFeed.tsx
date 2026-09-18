import type { ActivityEventInfo } from "@/lib/types";

export function ActivityFeed({ events }: { events: ActivityEventInfo[] }) {
  return (
    <div className="w-72 flex-shrink-0 border-l border-ink/10 bg-paper p-4">
      <h3 className="font-[family-name:var(--font-hand)] text-lg font-semibold text-ink">Activity</h3>
      <ul className="mt-3 space-y-3">
        {events.map((event) => (
          <li key={event.id} className="text-xs text-ink-soft">
            <span className="font-medium text-ink">{event.actor.fullName}</span> {event.message}
            <div className="text-ink-soft/70">{new Date(event.createdAt).toLocaleString()}</div>
          </li>
        ))}
        {events.length === 0 && <p className="text-xs text-ink-soft">No activity yet.</p>}
      </ul>
    </div>
  );
}
