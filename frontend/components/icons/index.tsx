import clsx from "clsx";

export const PrevIcon = ({
  className,
  size = "w-4 h-4",
}: {
  className?: string;
  size?: string;
}) => {
  return (
    <svg
      className={clsx([size, className])}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
};

export const NextIcon = ({
  className,
  size = "w-4 h-4",
}: {
  className?: string;
  size?: string;
}) => {
  return (
    <svg
      className={clsx([size, className])}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
};

export const PlusIcon = ({
  className,
  size = "w-6 h-6",
}: {
  className?: string;
  size?: string;
}) => {
  return (
    <svg
      className={clsx([size, className])}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
};

export const XIcon = ({ className, size = "w-4 h-4" }: { className?: string; size?: string }) => {
  return (
    <svg
      className={clsx([size, className])}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
};

export const HeartIcon = ({
  className,
  size = "w-4 h-4",
  isFilled = false,
}: {
  className?: string;
  size?: string;
  isFilled?: boolean;
}) => {
  const d =
    "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z";
  return (
    <svg className={clsx([size, className])} viewBox="0 0 24 24" aria-hidden="true">
      {isFilled ? (
        <path fill="currentColor" d={d} />
      ) : (
        <path
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={d}
        />
      )}
    </svg>
  );
};

export const ShareIcon = ({
  className,
  size = "w-4 h-4",
}: {
  className?: string;
  size?: string;
}) => {
  return (
    <svg
      className={clsx([size, className])}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7"
      />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 6l-4-4-4 4" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v13" />
    </svg>
  );
};

export const DotsHorizontalIcon = ({
  className,
  size = "w-5 h-5",
}: {
  className?: string;
  size?: string;
}) => {
  return (
    <svg
      className={clsx([size, className])}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </svg>
  );
};

export const DotsVerticalIcon = ({
  className,
  size = "w-5 h-5",
}: {
  className?: string;
  size?: string;
}) => {
  return (
    <svg
      className={clsx([size, className])}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  );
};
