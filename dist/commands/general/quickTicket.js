import { ApplicationCommandType, ApplicationIntegrationType, ChannelType, ContainerBuilder, ContextMenuCommandBuilder, InteractionContextType, MessageFlags, PermissionFlagsBits, TextChannel, TextDisplayBuilder, } from "discord.js";
import { getEmoji } from "../../utils/emojis.js";
import { lockButtonRow, sendErrorMessage, ticketMenuRow } from "../../utils/export.js";
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
            return sendErrorMessage(interaction, `Let's be sure I have creating private threads and managing threads.`, "danger");
        }
        const message = interaction.targetMessage;
        if (message.channel.isThread()) {
            return sendErrorMessage(interaction, `You can't create thread inside thread. Huh... w-what is going on?`);
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
                new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${getEmoji("ticket.create")} <../${interaction.user.id}>, you have opened a quick-action for this message\n> ${message.content}\n> -# Jump to [message](${message.url})\n> -# ———————————————\n- Message sent by __../${message.author?.username ?? "Unknown"}__`)),
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
