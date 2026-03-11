import { DiscordRestClient } from "@minesa-org/mini-interaction";

let restClient: DiscordRestClient | undefined;

export function getDiscordRestClient(): DiscordRestClient {
	if (!restClient) {
		const applicationId =
			process.env.DISCORD_APPLICATION_ID ?? process.env.DISCORD_APP_ID;
		const token =
			process.env.DISCORD_BOT_TOKEN ?? process.env.DISCORD_TOKEN;

		if (!applicationId || !token) {
			throw new Error(
				"[Kaeru] Missing Discord REST credentials for DiscordRestClient.",
			);
		}

		restClient = new DiscordRestClient({
			applicationId,
			token,
		});
	}

	return restClient;
}
