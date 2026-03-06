/**
 * Simple Pressable component for internal use by map components.
 * This is a lightweight version focused on basic link/button functionality.
 * For full-featured Pressable, use @opensite/ui.
 */

import * as React from "react";

export interface SimplePressableProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  "aria-label"?: string;
  target?: string;
  rel?: string;
}

export const SimplePressable = React.forwardRef<
  HTMLAnchorElement | HTMLButtonElement,
  SimplePressableProps
>(({ children, className, href, onClick, ...props }, ref) => {
  if (href) {
    const isExternal = href.startsWith("http://") || href.startsWith("https://");
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={className}
        target={isExternal ? "_blank" : props.target}
        rel={isExternal ? "noopener noreferrer" : props.rel}
        onClick={onClick}
        {...props}
      >
        {children}
      </a>
    );
  }

  if (onClick) {
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        className={className}
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
    );
  }

  return <span className={className}>{children}</span>;
});

SimplePressable.displayName = "SimplePressable";
