import {
	CommandBuilder,
	CommandContext,
	InteractionFlags,
	IntegrationType,
	MiniPermFlags,
} from "@minesa-org/mini-interaction";
import type { CommandInteraction, InteractionCommand } from "@minesa-org/mini-interaction";
import { db } from "../utils/database.ts";
import { fetchDiscord } from "../utils/discord.ts";
import { getEmoji, sendAlertMessage } from "../utils/index.ts";

function parseDuration(input: string): number | null {
	const trimmed = input.trim().toLowerCase();

	const match = trimmed.match(/^(\d+)\s*(s|m|h|d|w)?$/);
	if (!match) return null;

	const value = parseInt(match[1], 10);
	if (isNaN(value) || value <= 0) return null;

	const unit = match[2] ?? "m";

	switch (unit) {
		case "s": return value * 1000;
		case "m": return value * 60 * 1000;
		case "h": return value * 60 * 60 * 1000;
		case "d": return value * 24 * 60 * 60 * 1000;
		case "w": return value * 7 * 24 * 60 * 60 * 1000;
		default: return null;
	}
}

const timeoutCommand: InteractionCommand = {
	data: new CommandBuilder()
		.setName("timeout")
		.setDescription("Timeout a member in the server")
		.setContexts([CommandContext.Guild])
		.setIntegrationTypes([IntegrationType.GuildInstall])
		.setDefaultMemberPermissions(MiniPermFlags.ModerateMembers)
		.addUserOption((option) =>
			option
				.setName("user")
				.setDescription("The member to timeout")
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName("duration")
				.setDescription("Duration (e.g. 30m, 2h, 1d, 1w)")
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName("reason")
				.setDescription("Reason for the timeout")
				.setRequired(false),
		),

	handler: async (interaction: CommandInteraction) => {
		const user = interaction.user ?? interaction.member?.user;
		const guildId = interaction.guild_id;

		if (!user || !guildId) {
			return sendAlertMessage({
				interaction,
				content: "This command can only be used within a server.",
				type: "error",
			});
		}

		const targetUser = interaction.options.getUser("user", true)!.user;
		const durationInput = interaction.options.getString("duration", true)!;
		const reason = interaction.options.getString("reason") ?? "No reason provided";

		const durationMs = parseDuration(durationInput);
		if (durationMs === null) {
			return sendAlertMessage({
				interaction,
				content: `Invalid duration: **${durationInput}**\n\nAccepted formats: \`30s\`, \`30m\`, \`2h\`, \`1d\`, \`1w\``,
				type: "error",
			});
		}

		const maxDuration = 28 * 24 * 60 * 60 * 1000;
		if (durationMs > maxDuration) {
			return sendAlertMessage({
				interaction,
				content: "Timeout duration cannot exceed **28 days**.",
				type: "error",
			});
		}

		await interaction.deferReply({ flags: InteractionFlags.Ephemeral });

		try {
			const until = new Date(Date.now() + durationMs).toISOString();

			await fetchDiscord(
				`/guilds/${guildId}/members/${targetUser.id}`,
				process.env.DISCORD_BOT_TOKEN!,
				true,
				"PATCH",
				{ communication_disabled_until: until },
			);

			const durationLabel = formatDurationLabel(durationMs);
			const untilTimestamp = Math.floor((Date.now() + durationMs) / 1000);

			// Confirm to moderator
			await interaction.editReply({
				content: [
					`## ${getEmoji("timeout")} Member Timed Out`,
					`- **User:** <@${targetUser.id}>`,
					`- **Duration:** ${durationLabel}`,
					`- **Expires:** <t:${untilTimestamp}:R>`,
					`- **Reason:** ${reason}`,
				].join("\n"),
			});

			// DM the timed-out user
			try {
				const dmChannel = await fetchDiscord(
					"/users/@me/channels",
					process.env.DISCORD_BOT_TOKEN!,
					true,
					"POST",
					{ recipient_id: targetUser.id },
				);

				if (dmChannel?.id) {
					await fetchDiscord(
						`/channels/${dmChannel.id}/messages`,
						process.env.DISCORD_BOT_TOKEN!,
						true,
						"POST",
						{
							content: [
								`## ${getEmoji("timeout")} You have been timed out`,
								`- **Server:** <#${interaction.channel?.id ?? guildId}>`,
								`- **Duration:** ${durationLabel}`,
								`- **Expires:** <t:${untilTimestamp}:R>`,
								`- **Reason:** ${reason}`,
							].join("\n"),
						},
					);
				}
			} catch (dmError) {
				console.warn(`[Kaeru] Could not DM timed-out user ${targetUser.id}:`, dmError);
			}

			// Log to the guild's logs channel
			try {
				const guildData = await db.get(`guild:${guildId}`);
				const logsChannelId = guildData?.logsChannelId;

				if (typeof logsChannelId === "string" && logsChannelId.length > 0) {
					await fetchDiscord(
						`/channels/${logsChannelId}/messages`,
						process.env.DISCORD_BOT_TOKEN!,
						true,
						"POST",
						{
							content: [
								`## ${getEmoji("timeout")} Member Timed Out`,
								`- **User:** <@${targetUser.id}>`,
								`- **Moderator:** <@${user.id}>`,
								`- **Duration:** ${durationLabel}`,
								`- **Expires:** <t:${untilTimestamp}:R>`,
								`- **Reason:** ${reason}`,
							].join("\n"),
						},
					);
				}
			} catch (logError) {
				console.warn("[Kaeru] Could not send timeout log:", logError);
			}
		} catch (error) {
			console.error("[Kaeru] Timeout command failed:", error);
			return sendAlertMessage({
				interaction,
				content: "Failed to apply timeout. Check that the bot has **Moderate Members** permission and the target's role is lower than the bot's highest role.",
				type: "error",
			});
		}
	},
};

function formatDurationLabel(ms: number): string {
	const parts: string[] = [];

	const weeks = Math.floor(ms / (7 * 24 * 60 * 60 * 1000));
	if (weeks > 0) parts.push(`${weeks}w`);

	const days = Math.floor((ms % (7 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));
	if (days > 0) parts.push(`${days}d`);

	const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
	if (hours > 0) parts.push(`${hours}h`);

	const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
	if (minutes > 0) parts.push(`${minutes}m`);

	const seconds = Math.floor((ms % (60 * 1000)) / 1000);
	if (seconds > 0 && parts.length === 0) parts.push(`${seconds}s`);

	return parts.join(" ") || "0m";
}

export default timeoutCommand;
