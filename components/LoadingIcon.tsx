"use client";

import { LoaderCircle } from "lucide-react";

export const LoadingIcon = (props: any) => (
  <span
    aria-hidden="true"
    className={`w-6 h-6 ${
      props.className ?? "text-white"
    } animate-spin dark:text-foreground`}
  >
    <LoaderCircle />
  </span>
);
