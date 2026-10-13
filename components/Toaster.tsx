"use client";

import { useSyncExternalStore } from "react";
import { getNoToast, getToast, subscribeToast } from "@/lib/toast";

export default function Toaster() {
  const toast = useSyncExternalStore(subscribeToast, getToast, getNoToast);

  // The live region is always there, so screen readers announce each new message.
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-40 z-[70] flex justify-center md:bottom-28"
    >
      {toast && (
        <p
          key={toast.id}
          className="animate-pop-in rounded-full bg-ink px-5 py-2.5 text-body-s font-medium text-paper shadow-[0_12px_32px_-8px_rgb(0_0_0/0.4)] motion-reduce:animate-none"
        >
          {toast.message}
        </p>
      )}
    </div>
  );
}
