"use client";

import { ReactNode } from "react";
import QueryProvider from "@/providers/QueryProvider";
import { Toaster } from "sonner";

type Props = {
  children: ReactNode;
};

export default function AppProvider({ children }: Props) {
  return (
    <QueryProvider>
      {children}
      <Toaster richColors position="top-right" />
    </QueryProvider>
  );
}