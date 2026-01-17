"use client";

import { useState, type ReactNode } from "react";

function ReplayIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-rotate-ccw"
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

export function ExampleWrapper({ children }: { children: ReactNode }) {
  const [key, setKey] = useState(0);

  return (
    <div className="relative w-full h-[240px] lg:h-[300px]">
      <div className="empty:hidden absolute top-3 right-2 z-2 backdrop-blur-lg rounded-lg text-fd-muted-foreground">
        <button
          type="button"
          onClick={() => setKey((k) => k + 1)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-100 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring p-1 [&_svg]:size-4 hover:text-fd-accent-foreground"
          aria-label="Replay animation"
        >
          <ReplayIcon />
        </button>
      </div>
      <div key={key} className="w-full h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
