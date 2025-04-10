"use server";

import { db } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { User } from "@prisma/client";

/**
 * Synchronizes the currently authenticated Clerk user with the Prisma database.
 * This action should be called after auth state changes (login, signup, profile update).
 * 
 * @returns The synchronized user data or null if no user is authenticated
 */
export async function syncUserWithDatabase(): Promise<User | null> {
  try {
    // Get the authenticated user from Clerk
    const user = await currentUser();
    
    // If no authenticated user, return null
    if (!user) {
      return null;
    }
    
    // Extract relevant user data from Clerk
    const userData = {
      clerkId: user.id,
      email: user.emailAddresses[0]?.emailAddress || "",
      name: user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.username || "",
      avatar: user.imageUrl
    };
    
    // Check if user already exists in the database
    const existingUser = await db.user.findUnique({
      where: {
        clerkId: userData.clerkId
      }
    });
    
    let dbUser: User;
    
    if (existingUser) {
      // Update existing user
      dbUser = await db.user.update({
        where: {
          clerkId: userData.clerkId
        },
        data: {
          email: userData.email || existingUser.email,
          name: userData.name || existingUser.name,
          avatar: userData.avatar || existingUser.avatar,
        }
      });
    } else {
      // Create new user
      dbUser = await db.user.create({
        data: userData
      });
    }
    
    return dbUser;
  } catch (error) {
    console.error("Failed to sync user with database:", error);
    // Rethrow for error handling upstream
    throw new Error("Failed to sync user with database");
  }
} 