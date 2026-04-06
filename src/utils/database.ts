import { MiniDatabase } from '@minesa-org/mini-interaction'
import {
  getDiscordGithubUsername,
  getGithubMetadataOrg,
  isUserMemberOfGithubOrg
} from './githubOrg.js'

/**
 * Shared database instance for the application.
 */
export const db = MiniDatabase.fromEnv()

/**
 * Gets user data from the database.
 */
export async function getUserData(userId: string) {
  try {
    return await db.get(userId)
  } catch (error) {
    console.error('❌ Error getting user data:', error)
    throw error
  }
}

/**
 * Sets user's is_miniapp status.
 * Always true. No gating. Everyone connects.
 */
export async function setUserMiniAppStatus(userId: string) {
  try {
    return await db.set(userId, {
      userId,
      is_miniapp: true,
      lastUpdated: Date.now()
    })
  } catch (error) {
    console.error('❌ Error setting user miniapp status:', error)
    throw error
  }
}

/**
 * Updates user metadata for Discord linked roles.
 * is_miniapp is always true.
 */
export async function updateDiscordMetadata(userId: string, accessToken: string) {
  await setUserMiniAppStatus(userId)

  const githubUsername = await getDiscordGithubUsername(accessToken)
  let isGithubOrgMember = false

  if (githubUsername) {
    try {
      isGithubOrgMember = await isUserMemberOfGithubOrg(githubUsername)
    } catch (error) {
      console.error('[updateDiscordMetadata] GitHub org membership check failed:', error)
    }
  }

  const existing = await db.get(userId).catch(() => null)
  const base =
    existing && typeof existing === 'object'
      ? (existing as Record<string, unknown>)
      : {}

  await db.set(userId, {
    ...base,
    userId,
    is_miniapp: true,
    githubUsername: githubUsername ?? null,
    githubOrg: getGithubMetadataOrg(),
    isGithubOrgMember,
    lastUpdated: Date.now()
  })

  const metadata = {
    platform_name: 'Mini-Interaction',
    username: githubUsername ?? null,
    metadata: {
      is_miniapp: 1,
      github_org_member: isGithubOrgMember ? 1 : 0
    }
  }

  const response = await fetch(
    `https://discord.com/api/v10/users/@me/applications/${process.env.DISCORD_APPLICATION_ID}/role-connection`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metadata)
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to update Discord metadata: ${error}`)
  }

  return await response.json()
}
