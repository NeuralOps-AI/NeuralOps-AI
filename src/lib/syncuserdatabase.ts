// lib/syncUserWithDatabase.ts
import { prisma } from "@/lib/prisma"; // Adjust path as needed
import { currentUser } from "@clerk/nextjs/server"; // ✅ Correct import for server-side usage


export async function syncUserWithDatabase(_?: null) {
  const user = await currentUser();
  if (!user) throw new Error("No Clerk user found");

  const existingUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || "Unnamed",
        avatar: user.imageUrl,
        username: user.username,
        role: "user", // Default role
        usage: {
          create: {}, // creates default usage record
        },
      },
    });
  }
}
