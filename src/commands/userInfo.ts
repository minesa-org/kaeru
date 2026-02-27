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
		.setNameLocalizations({
			tr: "Kullanıcı Bilgisi",
			it: "Informazioni Utente",
			ro: "Informații Utilizator",
			el: "Πληροφορίες Χρήστη",
			"pt-BR": "Informações do Usuário",
			"zh-CN": "用户信息",
		})
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

		const targetUser =
			interaction.targetUser ??
			(await interaction.client.users.fetch(targetId));

		if (!targetUser) {
			throw new Error("Target user not found.");
		}

		const targetMember =
			interaction.data.resolved?.members?.[targetId];

		const accentColor = targetUser.accent_color ?? 0xac8e68;

		/* ---------------- AVATAR ---------------- */

		const avatarUrl = targetMember?.avatar
			? `https://cdn.discordapp.com/guilds/${interaction.guild_id}/users/${targetUser.id}/avatars/${targetMember.avatar}.png?size=4096`
			: targetUser.avatar
			? `https://cdn.discordapp.com/avatars/${targetUser.id}/${targetUser.avatar}.png?size=4096`
			: `https://cdn.discordapp.com/embed/avatars/${Number(
					(BigInt(targetUser.id) >> 22n) % 6n
			  )}.png`;

		/* ---------------- BANNER ---------------- */

		const bannerUrl = targetUser.banner
			? `https://cdn.discordapp.com/banners/${targetUser.id}/${targetUser.banner}.png?size=4096`
			: null;

		/* ------------- AVATAR DECORATION -------- */

		const avatarDecoHash =
			targetUser.avatar_decoration_data?.asset;

		const avatarDecoURL = avatarDecoHash
			? `https://cdn.discordapp.com/avatar-decoration-assets/${avatarDecoHash}.png`
			: null;

		const avatarDecoLine = avatarDecoURL
			? `**Avatar Decoration:** [Decoration URL](${avatarDecoURL})`
			: "";

		/* ---------------- TEXT ---------------- */

		const textDisplay = new TextDisplayBuilder().setContent(
			[
				`# ${getEmoji("avatar")} User Information`,
				`**Name:** ${
					targetMember?.nick ??
					targetUser.global_name ??
					targetUser.username
				} (\`@${targetUser.username}\`)`,
				`**User ID:** \`${targetUser.id}\``,
				`**Accent Color:** ${
					targetUser.accent_color != null
						? `#${targetUser.accent_color
								.toString(16)
								.padStart(6, "0")}`
						: "Using a banner."
				}`,
				avatarDecoLine,
				`-# You can also see other details on their profile.`,
			]
				.filter(Boolean)
				.join("\n"),
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

		/* ---------------- BANNER CONTAINER ---------------- */

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
