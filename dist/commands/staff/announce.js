import { ApplicationIntegrationType, ChannelType, ContainerBuilder, InteractionContextType, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, PermissionFlagsBits, roleMention, SeparatorBuilder, SeparatorSpacingSize, SlashCommandBuilder, TextDisplayBuilder, FileBuilder, ButtonBuilder, ButtonStyle, } from "discord.js";
import { containerTemplate, formatMultiline, getEmoji, sendAlertMessage, } from "../../utils/export.js";
const announce = {
    data: new SlashCommandBuilder()
        .setDefaultMemberPermissions(PermissionFlagsBits.MentionEveryone)
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild])
        .setName("announce")
        .setDescription("Announce something to the server!")
        .setNameLocalizations({
        "zh-CN": "宣布",
        it: "annuncia",
        tr: "duyur",
    })
        .setDescriptionLocalizations({
        "zh-CN": "向服务器宣布一些事情！",
        it: "Annuncia qualcosa al server!",
        tr: "Sunucuya bir şey duyur!",
    })
        .addChannelOption(option => option
        .setName("channel")
        .setNameLocalizations({
        "zh-CN": "渠道",
        it: "canale",
        tr: "kanal",
    })
        .setDescription("Channel to be sent")
        .setDescriptionLocalizations({
        "zh-CN": "要发送的频道",
        it: "Canale da inviare",
        tr: "Gönderilecek kanal",
    })
        .setRequired(true)
        .addChannelTypes([ChannelType.GuildAnnouncement]))
        .addStringOption(option => option
        .setName("message")
        .setNameLocalizations({
        "zh-CN": "信息",
        it: "messaggio",
        tr: "mesaj",
    })
        .setDescription("Message of the announcement, for next line; use two or more spaces")
        .setDescriptionLocalizations({
        "zh-CN": "公告的消息，换行请使用两个或以上空格",
        it: "Messaggio dell'annuncio, per andare a capo usa due o più spazi",
        tr: "Duyurunun mesajı, yeni satır için iki veya daha fazla boşluk kullanın",
    })
        .setRequired(true))
        .addStringOption(option => option
        .setName("title")
        .setNameLocalizations({
        "zh-CN": "标题",
        it: "titolo",
        tr: "başlık",
    })
        .setDescription("Title of the announcement")
        .setDescriptionLocalizations({
        "zh-CN": "公告的标题",
        it: "Titolo dell'annuncio",
        tr: "Duyurunun başlığı",
    })
        .setRequired(false)
        .setMaxLength(100))
        .addStringOption(option => option
        .setName("message_2")
        .setNameLocalizations({
        "zh-CN": "信息2",
        it: "messaggio_2",
        tr: "mesaj_2",
    })
        .setDescription("Message of the announcement")
        .setDescriptionLocalizations({
        "zh-CN": "公告的消息",
        it: "Messaggio dell'annuncio",
        tr: "Duyurunun mesajı",
    })
        .setRequired(false))
        .addStringOption(option => option
        .setName("message_3")
        .setNameLocalizations({
        "zh-CN": "信息3",
        it: "messaggio_3",
        tr: "mesaj_3",
    })
        .setDescription("Message of the announcement")
        .setDescriptionLocalizations({
        "zh-CN": "公告的消息",
        it: "Messaggio dell'annuncio",
        tr: "Duyurunun mesajı",
    })
        .setRequired(false))
        .addStringOption(option => option
        .setName("link")
        .setNameLocalizations({
        "zh-CN": "链接",
        it: "link",
        tr: "bağlantı",
    })
        .setDescription("Link to be sent in button (usage: https://google.com, Google)")
        .setDescriptionLocalizations({
        "zh-CN": "要发送的链接（用法：https://google.com, Google）",
        it: "Link da inviare nel pulsante (uso: https://google.com, Google)",
        tr: "Gönderilecek bağlantı (kullanım: https://google.com, Google)",
    })
        .setRequired(false))
        .addRoleOption(option => option
        .setName("role")
        .setNameLocalizations({
        "zh-CN": "角色",
        it: "ruolo",
        tr: "rol",
    })
        .setDescription("Role to be tagged")
        .setDescriptionLocalizations({
        "zh-CN": "要标记的角色",
        it: "Ruolo da taggare",
        tr: "Etiketlenecek rol",
    })
        .setRequired(false))
        .addAttachmentOption(option => option
        .setName("attachment")
        .setNameLocalizations({
        "zh-CN": "附件",
        it: "allegato",
        tr: "ek",
    })
        .setDescription("Attachment to be sent")
        .setDescriptionLocalizations({
        "zh-CN": "要发送的附件",
        it: "Allegato da inviare",
        tr: "Gönderilecek ek",
    })
        .setRequired(false)),
    execute: async (interaction) => {
        if (!interaction.guild?.members.me?.permissions.has([
            PermissionFlagsBits.MentionEveryone,
            PermissionFlagsBits.AddReactions,
            PermissionFlagsBits.CreatePublicThreads,
        ])) {
            return sendAlertMessage({
                interaction,
                content: `Make sure I have permissions of mentioning roles, adding reactions and creating public threads!`,
                type: "error",
                tag: "Missing Permissions",
                alertReaction: "reactions.kaeru.emphasize",
            });
        }
        const channel = interaction.options.getChannel("channel");
        if (!channel) {
            throw new Error();
        }
        await interaction.deferReply();
        const attachment = interaction.options.getAttachment("attachment");
        const role = interaction.options.getRole("role");
        const title = interaction.options.getString("title") || "Announcement";
        const link = interaction.options.getString("link");
        const message1 = interaction.options.getString("message"), message2 = interaction.options.getString("message_2"), message3 = interaction.options.getString("message_3");
        const container = new ContainerBuilder();
        const files = [];
        if (attachment) {
            const contentType = attachment.contentType || "";
            const response = await fetch(attachment.url);
            if (!response.ok) {
                await interaction.editReply({
                    content: `# ${getEmoji("danger")}\n-# Couldn't download the file, please upload a proper attachment.`,
                });
                return;
            }
            const arrayBuffer = await response.arrayBuffer();
            const fileBuffer = Buffer.from(arrayBuffer);
            if (contentType.startsWith("image/") || contentType.startsWith("video/")) {
                container.addMediaGalleryComponents(new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(`attachment://${attachment.name}`)));
            }
            else {
                container.addFileComponents(new FileBuilder().setURL(`attachment://${attachment.name}`));
            }
            files.push({
                attachment: fileBuffer,
                name: attachment.name,
            });
        }
        // Add separator and message content
        const combinedMessages = [
            `# ${title}`,
            "",
            role ? `-# [${roleMention(role.id)}]` : "-# [no mention.]",
            "",
            formatMultiline(message1 ?? ""),
            message2 ? formatMultiline(message2) : "",
            message3 ? formatMultiline(message3) : "",
        ]
            .filter(Boolean)
            .join("\n\n");
        container.addTextDisplayComponents(new TextDisplayBuilder().setContent(combinedMessages));
        // Add link button if provided
        if (link) {
            const [first, second] = link.split(",");
            const url = first.trim();
            const label = second?.trim();
            try {
                new URL(url);
            }
            catch {
                await interaction.editReply({
                    content: `# ${getEmoji("error")}\n-# Invalid link format. Please use: \`<url>, <label>\` — e.g., \`https://example.com, Visit site\``,
                });
                return;
            }
            container.addActionRowComponents(row => row.addComponents(new ButtonBuilder()
                .setLabel(label || "Link")
                .setURL(url)
                .setStyle(ButtonStyle.Link)));
        }
        // Add footer message
        container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true));
        container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# ${getEmoji("bubble")} __@${interaction.user.username}__`));
        try {
            if (!channel ||
                !("createWebhook" in channel) ||
                typeof channel.createWebhook !== "function") {
                throw new Error("Selected channel does not support webhook to create");
            }
            const webhook = await channel.createWebhook({
                name: interaction.guild.name,
                avatar: interaction.guild.iconURL() ?? undefined,
            });
            try {
                const sentMessage = await webhook.send({
                    components: [container],
                    files: files.length > 0 ? files : undefined,
                    flags: MessageFlags.IsComponentsV2,
                });
                await sentMessage.startThread({
                    name: title,
                    autoArchiveDuration: 60,
                    reason: `${interaction.user.username} created a thread for announcement`,
                });
                const reactions = [
                    getEmoji("reactions.user.heart"),
                    getEmoji("reactions.user.thumbsup"),
                    getEmoji("reactions.user.thumbsdown"),
                    getEmoji("reactions.user.haha"),
                    getEmoji("reactions.user.emphasize"),
                    getEmoji("reactions.user.question"),
                ];
                for (const reaction of reactions) {
                    await sentMessage.react(reaction);
                }
                await interaction.editReply({
                    components: [
                        containerTemplate({
                            tag: "Success",
                            description: `Done! Announcement sent to ${channel}!`,
                            title: getEmoji("reactions.kaeru.thumbsup"),
                        }),
                    ],
                    flags: MessageFlags.IsComponentsV2,
                });
            }
            catch (sendError) {
                console.error("Error sending announcement:", sendError);
                return sendAlertMessage({
                    interaction,
                    content: `${getEmoji("error")} There was an error sending the announcement: ${sendError.message}`,
                });
            }
            finally {
                try {
                    await webhook.delete();
                }
                catch (deleteError) {
                    console.error("Error deleting webhook:", deleteError);
                }
            }
        }
        catch (createError) {
            console.error("Error creating webhook:", createError);
            return sendAlertMessage({
                interaction,
                content: `${getEmoji("error")} There was an error sending the announcement: ${createError.message}`,
            });
        }
    },
};
export default announce;
