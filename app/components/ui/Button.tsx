"use client";
import { Button as HeadlessButton } from "@headlessui/react";
import clsx from "clsx";
import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<typeof HeadlessButton> & {
  variant?: "primary" | "secondary" | "ghost";
};

export default function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <HeadlessButton
      className={clsx(
        "px-4 py-2 rounded font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer",
        variant === "primary" &&
          "bg-primary text-white data-active:bg-primary-dark data-hover:bg-primary-light",
        variant === "secondary" &&
          "bg-secondary text-white data-active:bg-secondary-dark data-hover:bg-secondary-light",
        variant === "ghost" &&
          "bg-transparent text-primary hover:bg-primary/10 data-hover:bg-primary/10",
        className
      )}
      {...props}
    />
  );
}