"use client";

import { useEffect, useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, LogOut, Settings, User, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function SidebarProfile() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
    } catch (err) {
      console.error("Logout failed:", err);
      setLoading(false);
    }
  };

  if (!isClient || !isLoaded) {
    return (
      <div className="w-full px-3 py-2 rounded-md bg-gray-950 border-t border-gray-800 flex items-center">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="ml-2 flex flex-col gap-1 flex-1">
          <Skeleton className="w-20 h-3" />
          <Skeleton className="w-28 h-2" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="w-full px-3 py-2 flex items-center justify-between rounded-md hover:bg-gray-800 transition-colors group"
          aria-label="Open user menu"
        >
          <div className="flex items-center gap-2 truncate">
            <Image
              src={user.imageUrl}
              alt="User avatar"
              width={32}
              height={32}
              className="rounded-full border border-gray-700"
            />
            <div className="hidden md:flex flex-col text-left truncate">
              <span className="text-sm font-medium text-gray-200 truncate">
                {user.fullName}
              </span>
              <span className="text-[11px] text-gray-400 truncate max-w-[140px]">
                {user.primaryEmailAddress?.emailAddress}
              </span>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-white transition" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-56 p-0 bg-black border border-gray-800 rounded-lg shadow-xl"
      >
        <AnimatePresence>
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
          >
            <div className="p-3 border-b border-gray-800 flex items-center gap-3">
              <Image
                src={user.imageUrl}
                alt="User profile"
                width={40}
                height={40}
                className="rounded-full border border-gray-700 shadow-sm"
              />
              <div className="flex flex-col truncate">
                <span className="text-sm font-semibold text-white truncate">
                  {user.fullName}
                </span>
                <span className="text-xs text-gray-400 truncate">
                  {user.primaryEmailAddress?.emailAddress}
                </span>
              </div>
            </div>

            <nav className="py-2 text-sm text-gray-300">
              <MenuLink href="/profile" label="My Profile" icon={<User className="w-4 h-4" />} />
              <MenuLink href="/" label="Dashboard" icon={<LayoutDashboard className="w-4 h-4" />} />
              <MenuLink href="/settings" label="Settings" icon={<Settings className="w-4 h-4" />} />
            </nav>

            <div className="border-t border-gray-800" />

            <div className="p-2">
              <Button
                variant="ghost"
                onClick={handleSignOut}
                disabled={loading}
                className="w-full flex items-center justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-gray-900 transition rounded-md text-sm"
              >
                <LogOut className="w-4 h-4" />
                {loading ? "Signing out…" : "Sign Out"}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  );
}

function MenuLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 rounded-md transition-all"
    >
      {icon}
      {label}
    </Link>
  );
}
