function initials(fullName: string): string {
  return fullName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({ fullName, title }: { fullName: string; title?: string }) {
  return (
    <span
      title={title ?? fullName}
      className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-pin/15 text-xs font-semibold text-pin ring-2 ring-paper"
    >
      {initials(fullName)}
    </span>
  );
}
