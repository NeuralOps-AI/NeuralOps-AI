"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { syncUserWithDatabase } from "@/actions/user-sync";

/**
 * This component handles synchronizing Clerk user data with our database
 * It should be placed in layouts where authentication is required
 */
export function AuthSync() {
  const { isLoaded, userId, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only run sync when auth is loaded and user is signed in
    if (isLoaded && isSignedIn && userId) {
      const syncUser = async () => {
        try {
          await syncUserWithDatabase();
        } catch (error) {
          console.error("Failed to sync user:", error);
          // We could add additional error handling here if needed
        }
      };

      syncUser();
    }
  }, [isLoaded, isSignedIn, userId]);

  return null; // This component doesn't render anything
}

/**
 * Higher-order component that wraps any component with AuthSync functionality
 */
export function withAuthSync(Component: React.ComponentType<any>) {
  return function WithAuthSync(props: any) {
    return (
      <>
        <AuthSync />
        <Component {...props} />
      </>
    );
  };
} 