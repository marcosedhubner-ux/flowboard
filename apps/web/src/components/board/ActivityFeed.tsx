import type { ActivityEventInfo } from "@/lib/types";

export function ActivityFeed({ events }: { events: ActivityEventInfo[] }) {
  return (
    <div className="w-72 flex-shrink-0 border-l border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-700">Activity</h3>
      <ul className="mt-3 space-y-3">
        {events.map((event) => (
          <li key={event.id} className="text-xs text-slate-500">
            <span className="font-medium text-slate-700">{event.actor.fullName}</span>{" "}
            {event.message}
            <div className="text-slate-400">{new Date(event.createdAt).toLocaleString()}</div>
          </li>
        ))}
        {events.length === 0 && <p className="text-xs text-slate-400">No activity yet.</p>}
      </ul>
    </div>
  );
}
