"use client";

import { useState } from "react";
import { SIDEBAR_LINKS } from "@/constants/links";
import { LogOutIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Container from "../global/container";
import { Button, buttonVariants } from "../ui/button";
import { cn } from "@/functions";
import { useClerk } from "@clerk/nextjs";
import SidebarProfile from "./dashboard-profile";

const DashboardSidebar = () => {
  const { signOut } = useClerk();
  const pathname = usePathname();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogout = async () => {
    setIsSigningOut(true);
    await signOut();
  };

  return (
    <div
      id="sidebar"
      className="flex-col hidden lg:flex fixed left-0 top-16 bottom-0 z-50 bg-black border-r border-gray-800 w-72"
    >
      <div className={cn("flex flex-col h-full p-3")}>
        <Container delay={0.2} className="h-max">
          <Button
            variant="outline"
            className="w-full justify-between px-2 border border-gray-800 bg-black"
          >
            <span className="flex items-center gap-x-1 text-gray-300">
              <SearchIcon className="w-4 h-4" />
              <span className="text-sm">Search...</span>
            </span>
            <span className="px-1 py-px text-xs rounded-sm bg-gray-800 text-gray-300">
              ⌘K
            </span>
          </Button>
        </Container>
        <ul className="w-full space-y-2 py-5">
          {SIDEBAR_LINKS.map((link, index) => {
            const isActive = pathname === link.href;
            return (
              <li key={index} className="w-full">
                <Container delay={0.1 + index / 10}>
                  <Link
                    href={link.href}
                    className={buttonVariants({
                      variant: "ghost",
                      className: isActive
                        ? "bg-gray-900 text-white w-full !justify-start"
                        : "text-gray-300 w-full !justify-start",
                    })}
                  >
                    <link.icon strokeWidth={2} className="w-4 h-4 mr-1.5" />
                    {link.label}
                  </Link>
                </Container>
              </li>
            );
          })}
        </ul>
        <div className="mt-auto">
          <Container delay={0.3} className="flex flex-col gap-3 items-stretch">
            <SidebarProfile />
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start"
              disabled={isSigningOut}
            >
              {isSigningOut ? (
                <>
                  <LogOutIcon className="w-4 h-4 mr-1.5 animate-spin" />
                  <span>Signing out…</span>
                </>
              ) : (
                <>
                  <LogOutIcon className="w-4 h-4 mr-1.5" />
                  <span>Logout</span>
                </>
              )}
            </Button>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;
