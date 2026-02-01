import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ReactNode } from "react";

type SiteHeaderProps = {
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
};

export function SiteHeader({ leftSlot, rightSlot }: SiteHeaderProps) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) sticky top-0 bg-background">
      <div className="flex w-full items-center justify-between gap-2 px-4 lg:px-6">
        <div className="flex items-center gap-1 lg:gap-2">
          <SidebarTrigger className="-ml-1 bg-background hover:bg-background hover:outline" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          {leftSlot}
        </div>

        <div className="flex items-center gap-2">{rightSlot}</div>
      </div>
    </header>
  );
}
