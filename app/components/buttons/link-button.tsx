import { Link } from "@remix-run/react";
import { RemixLinkProps } from "@remix-run/react/dist/components";

interface ILinkButton extends RemixLinkProps {
  children: React.ReactNode;
}

export default function LinkButton(props: ILinkButton) {
  return (
    <Link
      {...props}
      className="px-5 py-2 text-sm text-center transition rounded-lg border border-black/10 dark:border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] dark:shadow-none default cursor-pointer bg-blue-600 hover:bg-blue-700 pressed:bg-blue-800 text-white"
    >
      {props.children}
    </Link>
  );
}
