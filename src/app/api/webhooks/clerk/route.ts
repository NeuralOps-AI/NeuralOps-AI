import { db } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// Define expected event types
type UserEventData = {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  email_addresses?: Array<{
    email_address: string;
  }>;
  image_url?: string;
};

type EventType = {
  data: UserEventData;
  type: string;
};

/**
 * Webhook handler for Clerk events to keep our Prisma database in sync
 */
export async function POST(req: Request) {
  // Get the webhook signing secret from environment variables
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET env var");
    return new NextResponse("Missing webhook secret", { status: 500 });
  }

  // Get the headers
  const headersList = headers();
  const svix_id = (await headersList).get("svix-id");
  const svix_timestamp = (await headersList).get("svix-timestamp");
  const svix_signature = (await headersList).get("svix-signature");

  // If there are no headers, return an error
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse("Missing svix headers", { status: 400 });
  }

  // Get the body
  let evt: EventType;
  
  try {
    const payload = await req.json();
    evt = payload as EventType;
  } catch (err) {
    console.error("Error parsing webhook payload:", err);
    return new NextResponse("Error parsing webhook payload", { status: 400 });
  }

  // Get the event type and data
  const eventType = evt.type;
  const data = evt.data;

  // Handle events
  try {
    switch (eventType) {
      case "user.created": {
        // Get user data
        const emailAddress = data.email_addresses?.[0]?.email_address || "";
        const firstName = data.first_name || "";
        const lastName = data.last_name || "";
        const userName = data.username || "";
        const name = firstName && lastName ? `${firstName} ${lastName}` : userName;
        const imageUrl = data.image_url || "";
        
        // Create user in database
        await db.user.create({
          data: {
            clerkId: data.id,
            email: emailAddress,
            name: name || "User",
            avatar: imageUrl,
          },
        });
        
        console.log(`User created in database: ${data.id}`);
        break;
      }
      
      case "user.updated": {
        // Get user data
        const emailAddress = data.email_addresses?.[0]?.email_address || "";
        const firstName = data.first_name || "";
        const lastName = data.last_name || "";
        const userName = data.username || "";
        const name = firstName && lastName ? `${firstName} ${lastName}` : userName;
        const imageUrl = data.image_url || "";
        
        // Check if user exists
        const existingUser = await db.user.findUnique({
          where: { clerkId: data.id },
        });

        if (existingUser) {
          // Update user
          await db.user.update({
            where: { clerkId: data.id },
            data: {
              email: emailAddress || existingUser.email,
              name: name || existingUser.name || "User",
              avatar: imageUrl || existingUser.avatar,
            },
          });
          console.log(`User updated in database: ${data.id}`);
        } else {
          // Create user if doesn't exist
          await db.user.create({
            data: {
              clerkId: data.id,
              email: emailAddress,
              name: name || "User",
              avatar: imageUrl,
            },
          });
          console.log(`User created (from update) in database: ${data.id}`);
        }
        break;
      }
      
      case "user.deleted": {
        // Delete user from database
        await db.user.delete({
          where: { clerkId: data.id },
        });
        console.log(`User deleted from database: ${data.id}`);
        break;
      }

      default:
        // Ignore other events
        break;
    }

    return new NextResponse("Webhook processed successfully", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new NextResponse("Error processing webhook", { status: 500 });
  }
} 