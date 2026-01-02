"use client";

import { useRouter } from "next/navigation";
import { PrevIcon } from "@/components/icons";

export default function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history?.length && window.history.length > 1) {
      window.history.back();
      return;
    }
    router.push("/");
  };

  return (
    <div className="px-4">
      <button
        type="button"
        onClick={handleBack}
        aria-label="戻る"
        className="inline-flex items-center gap-2 text-sm text-gray-700 focus:outline-none"
      >
        <PrevIcon className="w-4 h-4 text-black" />
        <span>戻る</span>
      </button>
    </div>
  );
}
