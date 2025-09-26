import { PermissionFlagsBits, MessageFlags, ChannelType, } from "discord.js";
import { containerTemplate, emojis, lockButtonRow, log, sendAlertMessage, summarizeTicketTitle, ticketContainerData, ticketMenuRow, } from "../../utils/export.js";
const webhookStorage = new Map();
const createTicketModal = {
    customId: /^ticket-create-modal\|/,
    execute: async (interaction) => {
        const [, rawLabel] = interaction.customId.split("|");
        const labelKey = rawLabel?.replace("label-", "") || "bug";
        const label = labelKey.toUpperCase();
        const emoji = emojis.ticket?.label?.[labelKey] ||
            emojis.ticket.label.bug;
        const userMessage = interaction.fields.getTextInputValue("message");
        const summarizedTitle = await summarizeTicketTitle(userMessage);
        const fallback = userMessage.slice(0, 90).replace(/\n/g, " ").trim();
        const safeSummary = summarizedTitle
            ? summarizedTitle.slice(0, 90).replace(/\n/g, " ").trim()
            : null;
        const finalTitle = `[${label}] ${safeSummary || fallback}`.slice(0, 100);
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            if (!interaction.channel || interaction.channel.type !== ChannelType.GuildText) {
                return sendAlertMessage({
                    interaction,
                    content: `This command can be used only in text channels.`,
                    alertReaction: "info",
                });
            }
            const thread = await interaction.channel.threads.create({
                name: finalTitle,
                autoArchiveDuration: 1440,
                invitable: false,
                type: ChannelType.PrivateThread,
                reason: `${interaction.user.username} opened a thread for support`,
            });
            const container = await ticketContainerData(interaction);
            await thread.members.add(interaction.user);
            const pinMessage = await thread.send({
                components: [container, ticketMenuRow, lockButtonRow],
                flags: MessageFlags.IsComponentsV2,
            });
            if (interaction.guild?.members.me?.permissions.has(PermissionFlagsBits.ManageMessages)) {
                await pinMessage.pin();
            }
            // Send initial message
            let webhook = null;
            const webhookData = webhookStorage.get(thread.parentId);
            if (interaction.guild?.members.me?.permissions.has(PermissionFlagsBits.ManageWebhooks)) {
                try {
                    if (webhookData) {
                        webhook = await interaction.client.fetchWebhook(webhookData.id, webhookData.token);
                    }
                    else {
                        const webhooks = await thread.parent.fetchWebhooks();
                        const existing = webhooks.find(wh => wh.name === "KaeruTicketWebhook");
                        if (existing && existing.token) {
                            webhook = await interaction.client.fetchWebhook(existing.id, existing.token);
                            webhookStorage.set(thread.parentId, { id: existing.id, token: existing.token });
                        }
                        else {
                            webhook = await thread.parent.createWebhook({
                                name: "KaeruTicketWebhook",
                                avatar: "https://cdn.discordapp.com/attachments/736571695170584576/1327617435418755185/23679.png?ex=688e0696&is=688cb516&hm=94d4df8ef1e62de0f1b8a5076e5333962fbd6e92906e5b360100a3c7d46c4a84&",
                                reason: "Webhook for ticket message delivery",
                            });
                            webhookStorage.set(thread.parentId, {
                                id: webhook.id,
                                token: webhook.token,
                            });
                        }
                    }
                }
                catch (err) {
                    log("error", "Failed to create/fetch webhook:", err);
                    webhook = null;
                }
            }
            if (webhook) {
                await webhook.send({
                    content: `>>> ${userMessage}`,
                    threadId: thread.id,
                    allowedMentions: { repliedUser: false },
                    username: interaction.user.username,
                    avatarURL: interaction.user.displayAvatarURL({ forceStatic: false }),
                });
            }
            else {
                await thread.send({ content: `>>> ${userMessage}` });
            }
            await interaction.editReply({
                components: [
                    containerTemplate({
                        tag: "Created Ticket",
                        title: `${emoji.id ? `<:${emoji.name}:${emoji.id}>` : emoji} Created <#${thread.id}>`,
                        description: `Now, you can talk about your issue with our staff members.`,
                    }),
                ],
                flags: [MessageFlags.IsComponentsV2],
            });
        }
        catch (error) {
            log("error", "Failed to create ticket:", error);
            return sendAlertMessage({
                interaction,
                content: "Failed to create ticket",
                type: "error",
            });
        }
    },
};
export default createTicketModal;
