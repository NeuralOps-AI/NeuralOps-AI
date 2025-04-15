// app/api/profile/route.ts

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function PUT(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, username, bio, avatarUrl } = body as {
      name?: string;
      username?: string;
      bio?: string;
      avatarUrl?: string | null;
    };

    const updatedUser = await prisma.user.update({
      where: { clerkId: userId },
      data: {
        name,
        username,
        bio,
        avatar: avatarUrl === null ? null : avatarUrl,
      },
    });

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
