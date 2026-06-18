import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: "primary" | "secondary";
};

export function Button({
  className,
  asChild = false,
  variant = "primary",
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        "rounded-full px-7 py-4 text-base font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "bg-white text-black hover:bg-neutral-200",
        variant === "secondary" &&
          "border border-white/15 bg-white/5 text-white hover:bg-white/10",
        className
      )}
      {...props}
    />
  );
}
