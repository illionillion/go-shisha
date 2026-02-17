import clsx from "clsx";

export const PrevIcon = ({ className = "text-white" }: { className?: string }) => {
  return (
    <svg
      className={clsx(["w-4", "h-4", className])}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
};

export const NextIcon = ({ className = "text-white" }: { className?: string }) => {
  return (
    <svg
      className={clsx(["w-4", "h-4", className])}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
};

export const PlusIcon = ({ className = "text-white" }: { className?: string }) => {
  return (
    <svg
      className={clsx(["w-6", "h-6", className])}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
};

export const XIcon = ({ className = "text-white" }: { className?: string }) => {
  return (
    <svg
      className={clsx(["w-4", "h-4", className])}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
};
