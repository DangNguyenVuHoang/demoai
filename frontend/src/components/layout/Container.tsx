import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function Container({ children, className }: Props) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4", className)}>
      {children}
    </div>
  );
}