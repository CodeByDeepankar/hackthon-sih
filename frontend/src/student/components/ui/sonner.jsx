"use client";

import { useTheme } from "next-themes@0.4.6";
import { Toaster, ToasterProps } from "sonner@2.0.3";

const Toaster = ({ ...props }) => { const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={ theme as ToasterProps["theme"] }
      className="toaster group"
      style={ {
          "--normal-bg": "var(--popover)", "--normal-text": "var(--popover-foreground)", "--normal-border": "var(--border)" } as React.CSSProperties
      }
      { ...props }
    />
  );
};

export { Toaster };
