import { ApplicationCommandType, ApplicationIntegrationType, ChannelType, ContextMenuCommandBuilder, InteractionContextType, MessageFlags, PermissionFlagsBits, TextChannel, } from "discord.js";
import { getEmoji } from "../../utils/emojis.js";
import { containerTemplate, lockButtonRow, sendAlertMessage, ticketMenuRow, } from "../../utils/export.js";
const quickTicket = {
    data: new ContextMenuCommandBuilder()
        .setName("Quick Ticket")
        .setNameLocalizations({
        it: "Biglietto Rapido",
        tr: "Hızlı Talep Formu",
        ro: "Bilet Rapid",
        el: "Γρήγορο Εισιτήριο",
        "zh-CN": "快速票证",
        "pt-BR": "Ingresso Rápido",
    })
        .setType(ApplicationCommandType.Message)
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild]),
    execute: async (interaction) => {
        await interaction.deferReply({
            flags: MessageFlags.Ephemeral,
        });
        if (!interaction.guild?.members.me?.permissions.has([
            PermissionFlagsBits.ManageThreads,
            PermissionFlagsBits.CreatePrivateThreads,
        ])) {
            return sendAlertMessage({
                interaction,
                content: `Let's be sure I have permission to __create private threads__.`,
                type: "error",
                tag: "Emoji Getting",
            });
        }
        const message = interaction.targetMessage;
        if (message.channel.isThread()) {
            return sendAlertMessage({
                interaction,
                content: `You can't create thread inside thread. Huh... w-what is going on?`,
                type: "error",
                tag: "Wait, what?",
                alertReaction: "reactions.kaeru.haha",
            });
        }
        if (!(interaction.channel instanceof TextChannel)) {
            throw new Error("This command must be used in a standard text channel.");
        }
        const textChannel = interaction.channel;
        const thread = await textChannel.threads.create({
            name: `— Quick-ticket by ${interaction.user.username}`,
            autoArchiveDuration: 60,
            type: ChannelType.PrivateThread,
            reason: `${interaction.user.username} opened a thread for support`,
            invitable: true,
        });
        await thread.send({
            components: [
                containerTemplate({
                    tag: "Quick Ticket",
                    description: [
                        `<@${interaction.user.id}>, you have opened a quick-action for this message`,
                        `> ${message.content}`,
                        `> -# Jump to [message](${message.url})`,
                        `- Message sent by __@${message.author?.username ?? "Unknown"}__`,
                    ],
                    title: `${getEmoji("ticket.create")} Quick-Ticket Created`,
                    thumbnail: "https://media.discordapp.net/attachments/736571695170584576/1408594076835643412/Normal.png?ex=68aa4ef6&is=68a8fd76&hm=64bc5af80ee9a98e1449e691f12876fe265b5a3f6ce4a9d9d9995e3af6e6c182&=&format=webp&quality=lossless&width=706&height=706",
                }),
                ticketMenuRow,
                lockButtonRow,
            ],
            flags: MessageFlags.IsComponentsV2,
        });
        return await interaction.editReply({
            content: `# ${getEmoji("ticket.created")} Created <#${thread.id}>\nNow, you can talk about your issue with our staff members or server members.`,
        });
    },
};
export default quickTicket;
