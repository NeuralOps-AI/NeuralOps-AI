// app/api/onboarding/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { clerkClient, getAuth } from '@clerk/nextjs/server'
import { z } from 'zod'

const bodySchema = z.object({
  role: z.string().min(1),
  goals: z.string().min(1),
  integrations: z.array(z.string()).optional(),
})

export async function POST(request: Request) {
  const { userId } = getAuth(new NextRequest(request))
  if (!userId) return NextResponse.error()

  const json = await request.json()
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  await clerkClient.users.updateUser(userId, {
    publicMetadata: {
      onboarded: true,
      role: parsed.data.role,
      goals: parsed.data.goals,
      integrations: parsed.data.integrations || [],
    },
  })

  return NextResponse.json({ ok: true })
}
