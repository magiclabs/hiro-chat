"use client";

import { LoaderCircle } from "lucide-react";

export const LoadingIcon = () => (
  <span
    aria-hidden="true"
    className="w-6 h-6 text-white animate-spin dark:text-foreground"
  >
    <LoaderCircle />
  </span>
);
