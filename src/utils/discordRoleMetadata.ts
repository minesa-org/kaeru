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
