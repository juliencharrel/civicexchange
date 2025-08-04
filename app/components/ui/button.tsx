import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded font-semibold text-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-primary)] text-white data-active:bg-[var(--color-primary-dark)] data-hover:bg-[var(--color-primary-light)]",
        primary:
          "bg-[var(--color-primary)] text-white data-active:bg-[var(--color-primary-dark)] data-hover:bg-[var(--color-primary-light)]",
        secondary:
          "bg-[var(--color-secondary)] text-white data-active:bg-[var(--color-secondary-dark)] data-hover:bg-[var(--color-secondary-light)]",
        destructive:
          "bg-[var(--color-danger)] text-white data-active:bg-[var(--color-danger-dark)] data-hover:bg-[var(--color-danger-light)]",
        outline:
          "border border-[var(--color-primary)] text-[var(--color-primary)] bg-transparent hover:bg-[var(--color-primary-light)] data-hover:bg-[var(--color-primary-light)]",
        ghost:
          "bg-transparent text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] data-hover:bg-[var(--color-primary-light)]",
        link:
          "text-[var(--color-primary)] underline-offset-4 hover:underline bg-transparent px-0 py-0 shadow-none",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
