type DiscordConnection = {
  type?: string
  name?: string
  verified?: boolean
}

function normalizeLogin(login: string) {
  return login.trim().toLowerCase()
}

function getGitHubToken() {
  return process.env.GITHUB_TOKEN?.trim() ?? ''
}

function getGitHubOrg() {
  return process.env.GITHUB_METADATA_ORG?.trim() ?? 'minesa-org'
}

export async function getDiscordGithubUsername(accessToken: string) {
  const response = await fetch('https://discord.com/api/v10/users/@me/connections', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    const text = await response.text()
    console.error(
      `[githubOrg] Discord connections fetch failed (${response.status}): ${text}`
    )
    return null
  }

  const connections = (await response.json()) as DiscordConnection[]
  const githubConnection = connections.find(
    (connection) =>
      connection.type === 'github' &&
      typeof connection.name === 'string' &&
      connection.name.length > 0
  )

  return githubConnection?.name ?? null
}

export async function isUserMemberOfGithubOrg(githubUsername: string) {
  const token = getGitHubToken()
  if (!token) {
    console.warn(
      '[githubOrg] GITHUB_TOKEN is not set; GitHub org membership check skipped.'
    )
    return false
  }

  const org = getGitHubOrg()
  const normalizedUsername = normalizeLogin(githubUsername)
  const url = `https://api.github.com/orgs/${org}/memberships/${normalizedUsername}`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })

  if (response.status === 200 || response.status === 204) {
    return true
  }

  if (response.status === 404) {
    return false
  }

  const text = await response.text().catch(() => '')
  console.warn(
    `[githubOrg] Org membership check failed (${response.status}): ${text}`
  )
  return false
}

export function getGithubMetadataOrg() {
  return getGitHubOrg()
}
