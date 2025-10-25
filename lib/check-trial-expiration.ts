import { prisma } from "@/lib/db"
import type { Profile } from "@prisma/client"

export async function checkAndExpireTrial(profile: Profile): Promise<Profile> {
  if (!profile.trialEndsAt) {
    return profile
  }

  const now = new Date()
  
  if (profile.trialEndsAt <= now) {
    const updatedProfile = await prisma.profile.update({
      where: { id: profile.id },
      data: {
        plan: "FREE",
        trialEndsAt: null,
        trialPlan: null,
        updatedAt: now
      }
    })
    
    return updatedProfile
  }

  return profile
}

export async function getUserProfileWithTrialCheck(userId: string): Promise<Profile | null> {
  const profile = await prisma.profile.findUnique({
    where: { userId }
  })

  if (!profile) {
    return null
  }

  return checkAndExpireTrial(profile)
}
