import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlags, } from "discord.js";
import { sendAlertMessage } from "../../utils/error&containerMessage.js";
const collabButton = {
    customId: /^collab_(edit|view)_/,
    execute: async (interaction) => {
        const [action, type, collabKey] = interaction.customId.split("_", 3);
        const fileData = interaction.client.fileCache.get(collabKey);
        if (!fileData) {
            return sendAlertMessage({
                interaction,
                content: `File data not found.`,
                type: "error",
                tag: "File Data",
            });
        }
        const isOwner = interaction.user.id === fileData.owner;
        const isCollaborator = fileData.collaborators.includes(interaction.user.id);
        if (type === "edit") {
            if (!isOwner && !isCollaborator) {
                return sendAlertMessage({
                    interaction,
                    title: "No-no! You look confused",
                    content: `You don't have permission to edit this file.`,
                    type: "error",
                    tag: "Missing Permission",
                });
            }
            const modal = new ModalBuilder()
                .setCustomId(`collab_modal_${collabKey}`)
                .setTitle(`Edit: ${fileData.name}`)
                .addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder()
                .setCustomId("file_content")
                .setLabel("File Content")
                .setStyle(TextInputStyle.Paragraph)
                .setValue(fileData.text)
                .setMaxLength(4000)
                .setRequired(true)
                .setPlaceholder("Please write down your changes.")));
            return interaction.showModal(modal);
        }
        if (type === "view") {
            if (!fileData.isViewable && !isOwner && !isCollaborator) {
                return sendAlertMessage({
                    interaction,
                    title: "They made this superrr hidden",
                    content: `You don't have permission to view this file.`,
                    type: "error",
                    tag: "Missing Permission",
                });
            }
            return interaction.reply({
                content: `\`\`\`${fileData.ext.slice(1)}\n${fileData.text}\n\`\`\``,
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};
export default collabButton;
