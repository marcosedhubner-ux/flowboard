import clsx from "clsx";

function initials(fullName: string): string {
  return fullName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({
  fullName,
  title,
  className,
}: {
  fullName: string;
  title?: string;
  className?: string;
}) {
  return (
    <span
      title={title ?? fullName}
      className={clsx(
        "inline-flex h-7 w-7 items-center justify-center rounded-full bg-pin/15 text-xs font-semibold text-pin ring-2 ring-paper",
        className
      )}
    >
      {initials(fullName)}
    </span>
  );
}
