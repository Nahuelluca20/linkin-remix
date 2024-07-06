import React from "react";
import { Link } from "@remix-run/react";
import { useButton } from "react-aria";
import { tv } from "tailwind-variants";
import { focusRing } from "./utils";

export interface ButtonLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: string;
  prefetch?: "intent" | "render" | "none";
  variant?: "primary" | "secondary" | "destructive" | "icon" | "outlined";
  isDisabled?: boolean;
}

const buttonLink = tv({
  extend: focusRing,
  base: "px-5 py-2 text-sm text-center transition rounded-lg border border-black/10 dark:border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] dark:shadow-none cursor-pointer",
  variants: {
    variant: {
      primary: "bg-blue-600 hover:bg-blue-700 pressed:bg-blue-800 text-white",
      secondary:
        "bg-gray-100 hover:bg-gray-200 pressed:bg-gray-300 text-gray-800 dark:bg-zinc-600 dark:hover:bg-zinc-500 dark:pressed:bg-zinc-400 dark:text-zinc-100",
      destructive: "bg-red-700 hover:bg-red-800 pressed:bg-red-900 text-white",
      outlined:
        "border-blue-600 dark:border-blue-600 hover:border-blue-700 pressed:border-blue-800 text-blue-600",
      icon: "border-0 p-1 flex items-center justify-center text-gray-600 hover:bg-black/[5%] pressed:bg-black/10 dark:text-zinc-400 dark:hover:bg-white/10 dark:pressed:bg-white/20 disabled:bg-transparent",
    },
    isDisabled: {
      true: "pointer-events-none cursor-not-allowed bg-gray-100 dark:bg-zinc-800 text-gray-300 dark:text-zinc-600 forced-colors:text-[GrayText] border-black/5 dark:border-white/5",
    },
  },
  defaultVariants: {
    variant: "primary",
  },
  compoundVariants: [
    {
      isDisabled: true,
      class: "hover:bg-gray-100 dark:hover:bg-zinc-800",
    },
  ],
});

export function ButtonLink(props: ButtonLinkProps) {
  const ref = React.useRef<HTMLAnchorElement>(null);
  const { buttonProps } = useButton(props, ref);
  const {
    variant,
    className,
    children,
    to,
    prefetch,
    isDisabled,
    onClick,
    ...rest
  } = props;

  const handleClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    if (isDisabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  const linkProps = isDisabled ? {} : { to, prefetch };

  return (
    <Link
      {...linkProps}
      {...rest}
      {...buttonProps}
      ref={ref}
      onClick={handleClick}
      className={buttonLink({ variant, isDisabled, className })}
      aria-disabled={isDisabled}
    >
      {children}
    </Link>
  );
}
