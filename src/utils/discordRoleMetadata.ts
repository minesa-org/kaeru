import { RoleConnectionMetadataTypes, type RoleConnectionMetadataInput } from '@minesa-org/mini-interaction'

export const ROLE_CONNECTION_METADATA: RoleConnectionMetadataInput[] = [
  {
    key: 'is_miniapp',
    name: 'Connected',
    description: 'User completed Kaeru account connection.',
    type: RoleConnectionMetadataTypes.IntegerGreaterThanOrEqual,
    name_localizations: {
      tr: 'Baglandi'
    },
    description_localizations: {
      tr: 'Kullanici Kaeru hesap baglantisini tamamladi.'
    }
  },
  {
    key: 'github_org_member',
    name: 'GitHub Org Member',
    description: 'User is a member of the configured GitHub organization.',
    type: RoleConnectionMetadataTypes.IntegerGreaterThanOrEqual,
    name_localizations: {
      tr: 'GitHub Organizasyon Uyesi'
    },
    description_localizations: {
      tr: 'Kullanici ayarlanan GitHub organizasyonunun bir uyesidir.'
    }
  }
]

export async function registerDiscordRoleConnectionMetadata(botToken: string) {
  const applicationId = process.env.DISCORD_APPLICATION_ID?.trim()
  if (!applicationId) {
    throw new Error('DISCORD_APPLICATION_ID is not configured.')
  }

  const response = await fetch(
    `https://discord.com/api/v10/applications/${applicationId}/role-connections/metadata`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ROLE_CONNECTION_METADATA)
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to register Discord role connection metadata: ${error}`)
  }

  return await response.json()
}
