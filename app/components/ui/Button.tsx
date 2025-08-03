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
          "bg-[var(--color-primary)] text-white data-active:bg-[var(--color-primary-dark)] data-hover:bg-[var(--color-primary-light)]",
        variant === "secondary" &&
          "bg-[var(--color-secondary)] text-white data-active:bg-[var(--color-secondary-dark)] data-hover:bg-[var(--color-secondary-light)]",
        variant === "ghost" &&
          "bg-transparent text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] data-hover:bg-[var(--color-primary-light)]",
        className
      )}
      {...props}
    />
  );
}