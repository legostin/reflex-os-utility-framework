import * as React from "react";
import { cn } from "../cn";

export function Toolbar({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)} {...rest}>
      {children}
    </div>
  );
}

export function ToolbarSpacer() {
  return <div className="flex-1" />;
}
