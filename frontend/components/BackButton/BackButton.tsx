"use client";

import { clsx } from "clsx";
import { useRouter } from "next/navigation";
import { PrevIcon } from "@/components/icons";

export const BackButton = () => {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history?.length && window.history.length > 1) {
      window.history.back();
      return;
    }
    router.push("/");
  };

  return (
    <div className={clsx(["px-4"])}>
      <button
        type="button"
        onClick={handleBack}
        aria-label="戻る"
        className={clsx(["inline-flex", "items-center", "gap-2", "text-sm", "text-gray-700", "focus-visible:outline-none", "focus-visible:ring-2", "focus-visible:ring-offset-2", "focus-visible:ring-indigo-500"])}
      >
        <PrevIcon className={clsx(["w-4", "h-4", "text-black"])} />
        <span>戻る</span>
      </button>
    </div>
  );
};
