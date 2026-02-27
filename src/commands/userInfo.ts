import {
	CommandContext,
	ContainerBuilder,
	IntegrationType,
	InteractionFlags,
	SectionBuilder,
	TextDisplayBuilder,
	ThumbnailBuilder,
	UserCommandBuilder,
	GalleryBuilder,
	GalleryItemBuilder,
} from "@minesa-org/mini-interaction";
import type {
	UserContextMenuInteraction,
	InteractionCommand,
} from "@minesa-org/mini-interaction";
import { getEmoji } from "../utils/index.ts";

const userInfo: InteractionCommand = {
	data: new UserCommandBuilder()
		.setName("User Information")
		.setIntegrationTypes([
			IntegrationType.UserInstall,
			IntegrationType.GuildInstall,
		])
		.setContexts([
			CommandContext.Bot,
			CommandContext.DM,
			CommandContext.Guild,
		]),

	handler: async (interaction: UserContextMenuInteraction) => {
		const isUserInstall =
			interaction.authorizing_integration_owners &&
			Object.keys(interaction.authorizing_integration_owners).every(
				key => key === IntegrationType.UserInstall.toString()
			);

		await interaction.deferReply({
			flags: isUserInstall
				? InteractionFlags.Ephemeral | InteractionFlags.IsComponentsV2
				: InteractionFlags.IsComponentsV2,
		});

		const targetId = interaction.data.target_id;
		if (!targetId) throw new Error("Target user ID missing.");

		const response = await fetch(
			`https://discord.com/api/v10/users/${targetId}`,
			{
				headers: {
					Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
				},
			}
		);

		if (!response.ok) {
			throw new Error("Failed to fetch user from Discord API.");
		}

		const targetUser = await response.json();

		const avatarUrl = targetUser.avatar
			? `https://cdn.discordapp.com/avatars/${targetUser.id}/${targetUser.avatar}.png?size=4096`
			: `https://cdn.discordapp.com/embed/avatars/${Number(
					(BigInt(targetUser.id) >> 22n) % 6n
			  )}.png`;

		const bannerUrl = targetUser.banner
			? `https://cdn.discordapp.com/banners/${targetUser.id}/${targetUser.banner}.png?size=4096`
			: null;

		const accentColor = targetUser.accent_color ?? 0xac8e68;

		const textDisplay = new TextDisplayBuilder().setContent(
			[
				`# ${getEmoji("avatar")} User Information`,
				`**Name:** ${
					targetUser.global_name ?? targetUser.username
				} (\`@${targetUser.username}\`)`,
				`**User ID:** \`${targetUser.id}\``,
				`**Accent Color:** ${
					targetUser.accent_color != null
						? `#${targetUser.accent_color
								.toString(16)
								.padStart(6, "0")}`
						: "Using a banner."
				}`,
				`-# You can also see other details on their profile.`,
			].join("\n"),
		);

		const section = new SectionBuilder()
			.setAccessory(
				new ThumbnailBuilder().setMedia({ url: avatarUrl })
			)
			.addComponent(textDisplay);

		const container1 = new ContainerBuilder()
			.setAccentColor(accentColor)
			.addComponent(section);

		const components: ContainerBuilder[] = [container1];

		if (bannerUrl) {
			const mediaGallery = new GalleryBuilder().addItem(
				new GalleryItemBuilder().setMedia({ url: bannerUrl })
			);

			const container2 = new ContainerBuilder()
				.addComponent(
					new TextDisplayBuilder().setContent(
						`# ${getEmoji("banner")} Banner`
					)
				)
				.addComponent(mediaGallery);

			components.push(container2);
		}

		await interaction.editReply({ components });
	},
};

export default userInfo;
