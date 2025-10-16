import { ApplicationCommandType, ApplicationIntegrationType, ContainerBuilder, ContextMenuCommandBuilder, InteractionContextType, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, SectionBuilder, TextDisplayBuilder, ThumbnailBuilder, } from "discord.js";
import { getEmoji } from "../../utils/export.js";
const userInfo = {
    data: new ContextMenuCommandBuilder()
        .setType(ApplicationCommandType.User)
        .setIntegrationTypes([
        ApplicationIntegrationType.UserInstall,
        ApplicationIntegrationType.GuildInstall,
    ])
        .setContexts([
        InteractionContextType.BotDM,
        InteractionContextType.PrivateChannel,
        InteractionContextType.Guild,
    ])
        .setName("User Information")
        .setNameLocalizations({
        tr: "Kullanıcı Bilgisi",
        it: "Informazioni Utente",
        ro: "Informații Utilizator",
        el: "Πληροφορίες Χρήστη",
        "pt-BR": "Informações do Usuário",
        "zh-CN": "用户信息",
    }),
    execute: async (interaction) => {
        if (Object.keys(interaction.authorizingIntegrationOwners).every(key => key == ApplicationIntegrationType.UserInstall.toString())) {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        }
        else {
            await interaction.deferReply();
        }
        const userId = interaction.targetId;
        const user = await interaction.client.users.fetch(userId, { force: true });
        let member = null;
        if (interaction.guild) {
            try {
                member = interaction.guild
                    ? await interaction.guild.members.fetch({ user: userId, force: true })
                    : null;
            }
            catch { }
        }
        const accentColor = user.accentColor ?? 0xac8e68; // Kaeru's primary color
        const avatarDecoURL = user.avatarDecorationURL();
        const avatarDecoLine = avatarDecoURL
            ? `**Avatar Decoration:** [Decoration URL](${avatarDecoURL})`
            : "";
        const bannerUrl = member?.bannerURL({ size: 4096, forceStatic: false }) ||
            user.bannerURL({ size: 4096, forceStatic: false });
        const avatarUrl = member?.displayAvatarURL({ size: 4096, forceStatic: false }) ||
            user.displayAvatarURL({ size: 4096, forceStatic: false });
        let container2 = null;
        if (bannerUrl) {
            const mediaGallery = new MediaGalleryBuilder();
            mediaGallery.addItems([new MediaGalleryItemBuilder().setURL(bannerUrl)]);
            container2 = new ContainerBuilder()
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ${getEmoji("banner")} Banner`))
                .addMediaGalleryComponents(mediaGallery);
        }
        const text1 = new TextDisplayBuilder().setContent([
            `# ${getEmoji("avatar")} User Information`,
            `**Name:** ${user.displayName ?? user.username} (\`@${user.username}\`)`,
            `**User ID:** \`${user.id}\``,
            `**Accent Color:** ${user.accentColor != null ? `#${user.accentColor.toString(16).padStart(6, "0")}` : "Using a banner."}`,
            avatarDecoLine,
            `-# You can also see other details on their profile.`,
        ].join("\n"));
        const section = new SectionBuilder()
            .setThumbnailAccessory(new ThumbnailBuilder().setURL(avatarUrl))
            .addTextDisplayComponents(text1);
        const container1 = new ContainerBuilder()
            .setAccentColor(accentColor)
            .addSectionComponents(section);
        const components = [container1];
        if (container2)
            components.push(container2);
        await interaction.editReply({
            components,
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: {
                parse: [],
            },
        });
    },
};
export default userInfo;
